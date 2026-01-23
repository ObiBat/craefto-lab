import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  docusealClient,
  generateDocumentPDF,
  populatePlaceholders,
  loadTemplate,
} from '@/lib/documents';
import type { SendForSignatureRequest, DocumentType } from '@/lib/documents/types';

// POST /api/admin/documents/[id]/send - Send document for signature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body: SendForSignatureRequest = await request.json();

    // Validate signers
    if (!body.signers || body.signers.length === 0) {
      return NextResponse.json({ error: 'At least one signer is required' }, { status: 400 });
    }

    // Validate signer data
    for (const signer of body.signers) {
      if (!signer.email || !signer.name || !signer.role) {
        return NextResponse.json({ error: 'Each signer must have email, name, and role' }, { status: 400 });
      }
    }

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check document status
    if (!['draft', 'pending_review'].includes(document.status)) {
      return NextResponse.json(
        { error: `Cannot send document with status: ${document.status}` },
        { status: 400 }
      );
    }

    // Generate PDF if not already generated
    let pdfBuffer: Buffer;

    try {
      // If we have HTML content, use it; otherwise generate from template
      let htmlContent = document.html_content;

      if (!htmlContent) {
        const templateHtml = await loadTemplate(document.document_type as DocumentType);
        htmlContent = populatePlaceholders(templateHtml, document.content_json as Record<string, unknown>);
      }

      pdfBuffer = await generateDocumentPDF(htmlContent, document.document_type as DocumentType);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }

    // Check DocuSeal connection
    const connectionCheck = await docusealClient.checkConnection();
    if (!connectionCheck.connected) {
      console.error('DocuSeal not available:', connectionCheck.error);
      return NextResponse.json(
        { error: 'E-signature service not available. Please try again later.' },
        { status: 503 }
      );
    }

    // Calculate expiry date
    const expiresInDays = body.expires_in_days || 14;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expiresInDays);

    // Create submission in DocuSeal
    let submission;
    try {
      submission = await docusealClient.createSubmissionWithDocument(
        pdfBuffer,
        `${document.document_number}.pdf`,
        body.signers.map((s) => ({
          email: s.email,
          name: s.name,
          role: s.role,
        })),
        {
          sendEmail: true,
          message: body.message || `Please review and sign: ${document.title}`,
          expireAt: expireAt.toISOString(),
        }
      );
    } catch (docusealError) {
      console.error('DocuSeal error:', docusealError);
      return NextResponse.json({ error: 'Failed to create signing request' }, { status: 500 });
    }

    // Store PDF in Supabase Storage
    const pdfPath = `documents/${document.id}/${document.document_number}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Failed to upload PDF to storage:', uploadError);
      // Continue anyway - DocuSeal has the document
    }

    // Update document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'pending_signature',
        docuseal_submission_id: String(submission.id),
        pdf_storage_path: uploadError ? null : pdfPath,
        sent_at: new Date().toISOString(),
        expires_at: expireAt.toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating document:', updateError);
    }

    // Create signature records
    const signatureRecords = body.signers.map((signer) => {
      const submitter = submission.submitters.find((s) => s.email === signer.email);
      return {
        document_id: id,
        signer_role: signer.role,
        signer_name: signer.name,
        signer_email: signer.email,
        docuseal_submitter_id: submitter ? String(submitter.id) : null,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
    });

    await supabase.from('document_signatures').insert(signatureRecords);

    // Log activity
    await supabase.from('document_activities').insert({
      document_id: id,
      activity_type: 'sent',
      actor: 'admin',
      description: `Sent for signature to: ${body.signers.map((s) => s.name).join(', ')}`,
      metadata: {
        submission_id: submission.id,
        signers: body.signers,
        expires_at: expireAt.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      expires_at: expireAt.toISOString(),
      signers: submission.submitters.map((s) => ({
        email: s.email,
        name: s.name,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error('Error in POST /api/admin/documents/[id]/send:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
