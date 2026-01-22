import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  populatePlaceholders,
  loadTemplate,
} from '@/lib/documents';
import type { DocumentType } from '@/lib/documents/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/documents/[id]/preview - Get HTML preview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return new NextResponse('<html><body><h1>Document not found</h1></body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // If we already have HTML content, return it
    if (document.html_content) {
      return new NextResponse(document.html_content, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Otherwise, generate HTML from template
    try {
      const templateHtml = await loadTemplate(document.document_type as DocumentType);
      const html = populatePlaceholders(
        templateHtml,
        document.content_json as Record<string, unknown>
      );

      // Optionally save the generated HTML back to the document
      await supabase
        .from('documents')
        .update({ html_content: html })
        .eq('id', id);

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (genError) {
      console.error('Error generating HTML preview:', genError);

      // Return a basic preview from content_json
      const content = document.content_json as Record<string, unknown>;
      const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a1a1a; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 4px; }
    .error { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="error">
    <strong>Template Error:</strong> Could not load the document template. Showing raw content below.
  </div>
  <h1>${document.title}</h1>
  <p><strong>Document Number:</strong> ${document.document_number}</p>
  <p><strong>Type:</strong> ${document.document_type}</p>
  <hr>
  <h2>Content</h2>
  ${Object.entries(content).map(([key, value]) => `
    <div class="field">
      <div class="label">${key}</div>
      <div class="value">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</div>
    </div>
  `).join('')}
</body>
</html>
      `;

      return new NextResponse(fallbackHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  } catch (error) {
    console.error('Error in GET /api/admin/documents/[id]/preview:', error);
    return new NextResponse('<html><body><h1>Error loading preview</h1></body></html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
