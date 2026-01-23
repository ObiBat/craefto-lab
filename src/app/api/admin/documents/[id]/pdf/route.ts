import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  generateDocumentPDF,
  populatePlaceholders,
  loadTemplate,
} from '@/lib/documents';
import type { DocumentType } from '@/lib/documents/types';

// Vercel serverless function config - Chromium needs more time and memory
export const maxDuration = 30;

// GET /api/admin/documents/[id]/pdf - Generate and download PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if we have a stored PDF and it's still valid
    if (document.pdf_storage_path && document.status !== 'draft') {
      const { data: storedPdf, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.pdf_storage_path);

      if (!downloadError && storedPdf) {
        const arrayBuffer = await storedPdf.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const headers: Record<string, string> = {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'private, max-age=3600',
        };

        if (download) {
          headers['Content-Disposition'] = `attachment; filename="${document.document_number}.pdf"`;
        } else {
          headers['Content-Disposition'] = `inline; filename="${document.document_number}.pdf"`;
        }

        return new NextResponse(new Uint8Array(buffer), { headers });
      }
    }

    // Generate PDF from HTML content
    let htmlContent = document.html_content;

    if (!htmlContent) {
      // Load template and populate placeholders
      const templateHtml = await loadTemplate(document.document_type as DocumentType);
      htmlContent = populatePlaceholders(
        templateHtml,
        document.content_json as Record<string, unknown>
      );
    }

    // Generate PDF
    const pdfBuffer = await generateDocumentPDF(
      htmlContent,
      document.document_type as DocumentType
    );

    // Store PDF if document is not in draft status
    if (document.status !== 'draft') {
      const pdfPath = `documents/${document.id}/${document.document_number}.pdf`;
      await supabase.storage
        .from('documents')
        .upload(pdfPath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      // Update document with PDF path
      await supabase
        .from('documents')
        .update({ pdf_storage_path: pdfPath })
        .eq('id', id);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-cache',
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${document.document_number}.pdf"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${document.document_number}.pdf"`;
    }

    return new NextResponse(new Uint8Array(pdfBuffer), { headers });
  } catch (error) {
    console.error('Error in GET /api/admin/documents/[id]/pdf:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
