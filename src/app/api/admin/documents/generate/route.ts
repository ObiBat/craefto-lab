import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generateDocument,
  generateDefaultProposalContent,
  generateDefaultSOWContent,
  generateDefaultInvoiceContent,
} from '@/lib/documents';
import type {
  DocumentType,
  GenerateDocumentRequest,
  LeadForDocument,
  LeadAnalysisForDocument,
  ProposalContent,
  SOWContent,
  InvoiceContent,
} from '@/lib/documents/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/admin/documents/generate - Generate document from lead data
export async function POST(request: NextRequest) {
  try {
    const body: GenerateDocumentRequest = await request.json();

    // Validate required fields
    if (!body.lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    if (!body.document_type) {
      return NextResponse.json({ error: 'document_type is required' }, { status: 400 });
    }

    const validTypes: DocumentType[] = ['proposal', 'sow', 'invoice', 'change_order'];
    if (!validTypes.includes(body.document_type)) {
      return NextResponse.json({ error: 'Invalid document_type' }, { status: 400 });
    }

    // Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadData: LeadForDocument = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      website: lead.website,
      service_interest: lead.service_interest,
      budget_range: lead.budget_range,
      timeline: lead.timeline,
      message: lead.message,
      score: lead.score,
    };

    // Fetch lead analysis if available
    let analysisData: LeadAnalysisForDocument | undefined;
    const { data: analysis } = await supabase
      .from('lead_analysis')
      .select('*')
      .eq('lead_id', body.lead_id)
      .single();

    if (analysis) {
      analysisData = {
        fit_score: analysis.fit_score,
        scope_creep_risk: analysis.scope_creep_risk,
        complexity: analysis.complexity,
        project_type: analysis.project_type,
        recommended_stack: analysis.recommended_stack || [],
        red_flags: analysis.red_flags || [],
        green_flags: analysis.green_flags || [],
      };
    }

    // Generate content based on document type
    let content: ProposalContent | SOWContent | InvoiceContent;
    let html: string;

    try {
      const result = await generateDocument(
        body.document_type,
        leadData,
        analysisData,
        body.customizations
      );
      content = result.content as ProposalContent | SOWContent | InvoiceContent;
      html = result.html;
    } catch (genError) {
      console.error('Error generating document content:', genError);

      // Fallback: generate content without HTML template
      switch (body.document_type) {
        case 'proposal':
          content = {
            ...generateDefaultProposalContent(leadData, analysisData),
            ...(body.customizations as Partial<ProposalContent>),
          };
          break;
        case 'sow':
          content = {
            ...generateDefaultSOWContent(leadData, body.customizations as Partial<ProposalContent>, analysisData),
            ...(body.customizations as Partial<SOWContent>),
          };
          break;
        case 'invoice':
          content = {
            ...generateDefaultInvoiceContent(leadData, body.customizations as Partial<SOWContent>),
            ...(body.customizations as Partial<InvoiceContent>),
          };
          break;
        default:
          return NextResponse.json({ error: 'Unsupported document type for generation' }, { status: 400 });
      }
      html = ''; // Will be generated on preview
    }

    // Generate title
    const typeLabels: Record<DocumentType, string> = {
      proposal: 'Project Proposal',
      sow: 'Statement of Work',
      invoice: 'Invoice',
      change_order: 'Change Order',
    };
    const title = `${typeLabels[body.document_type]} — ${lead.company || lead.name}`;

    // Create document in database
    const { data: document, error: createError } = await supabase
      .from('documents')
      .insert({
        lead_id: body.lead_id,
        document_type: body.document_type,
        title,
        content_json: content,
        html_content: html || null,
        template_id: body.template_id || `${body.document_type}-v1`,
        status: 'draft',
        created_by: 'admin',
      })
      .select(`
        *,
        lead:leads(id, name, email, company)
      `)
      .single();

    if (createError) {
      console.error('Error creating document:', createError);
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    // If invoice, also create invoice record
    if (body.document_type === 'invoice') {
      const invoiceContent = content as InvoiceContent;
      await supabase.from('invoices').insert({
        document_id: document.id,
        invoice_number: document.document_number,
        subtotal: invoiceContent.subtotal,
        tax_rate: invoiceContent.taxRate / 100, // Store as decimal
        tax_amount: invoiceContent.taxAmount,
        total: invoiceContent.total,
        currency: invoiceContent.currency || 'AUD',
        line_items: invoiceContent.lineItems,
        payment_terms: invoiceContent.paymentTerms,
        due_date: new Date(invoiceContent.dueDate).toISOString().split('T')[0],
        payment_status: 'unpaid',
      });
    }

    // Log activity
    await supabase.from('document_activities').insert({
      document_id: document.id,
      activity_type: 'created',
      actor: 'admin',
      description: `Document generated from lead: ${lead.name}`,
      metadata: {
        lead_id: body.lead_id,
        has_analysis: !!analysisData,
      },
    });

    return NextResponse.json({
      document,
      content,
      html: html || null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/documents/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
