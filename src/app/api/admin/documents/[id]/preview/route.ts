import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import {
  populatePlaceholders,
  loadTemplate,
} from '@/lib/documents';
import type { DocumentType } from '@/lib/documents/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache the CSS to avoid repeated file reads
let cachedCss: string | null = null;

async function getSharedStyles(): Promise<string> {
  if (cachedCss) return cachedCss;

  try {
    const cssPath = path.join(process.cwd(), 'public', 'client-hub', 'styles.css');
    cachedCss = await fs.readFile(cssPath, 'utf-8');
    return cachedCss;
  } catch {
    console.error('Failed to load shared styles');
    return '';
  }
}

/**
 * Clean up the template HTML for document preview:
 * - Inline the CSS
 * - Remove navigation header
 * - Remove page counter
 * - Remove hub-specific elements
 */
function processTemplateForPreview(html: string, css: string): string {
  let processed = html;

  // Replace external stylesheet link with inline styles
  processed = processed.replace(
    /<link[^>]*href=["']styles\.css["'][^>]*>/gi,
    `<style>${css}</style>`
  );

  // Remove the fixed header navigation
  processed = processed.replace(
    /<header[^>]*class=["'][^"']*page-header[^"']*["'][^>]*>[\s\S]*?<\/header>/gi,
    ''
  );

  // Remove "Back to Hub" links
  processed = processed.replace(
    /<a[^>]*class=["'][^"']*back-link[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    ''
  );

  // Remove page title with counter (e.g., "SOW & Contract Template 05 / 08")
  processed = processed.replace(
    /<span[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
    ''
  );

  // Remove the page counter
  processed = processed.replace(
    /<span[^>]*class=["'][^"']*page-counter[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
    ''
  );

  // Remove the entire page-title-section block (contains page-number div, h1, p)
  // Structure: <div class="page-title-section"><div class="page-number">...</div><h1>...</h1><p>...</p></div>
  processed = processed.replace(
    /<div[^>]*class=["'][^"']*page-title-section[^"']*["'][^>]*>[\s\S]*?<\/p>\s*<\/div>/gi,
    ''
  );

  // Fallback: Remove just the page-number div if page-title-section structure was different
  processed = processed.replace(
    /<div[^>]*class=["'][^"']*page-number[^"']*["'][^>]*>[^<]*<\/div>/gi,
    ''
  );

  // Remove legal warning about template usage (not needed for actual documents)
  processed = processed.replace(
    /<div[^>]*class=["'][^"']*legal-warning[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ''
  );

  // Remove instructions/notes sections
  processed = processed.replace(
    /<div[^>]*class=["'][^"']*template-note[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ''
  );

  // Remove "main" wrapper padding-top that accommodates fixed header
  processed = processed.replace(
    /(<main[^>]*style=["'][^"']*)padding-top:\s*\d+px;?/gi,
    '$1'
  );

  // Add padding-top override for main
  processed = processed.replace(
    /<main/gi,
    '<main style="padding-top: 0 !important;"'
  );

  // Make container full width in preview
  processed = processed.replace(
    /<body([^>]*)>/gi,
    '<body$1 style="padding: 0; margin: 0;">'
  );

  return processed;
}

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

    // Load shared CSS
    const sharedCss = await getSharedStyles();

    // If we already have HTML content, process and return it
    if (document.html_content) {
      const processedHtml = processTemplateForPreview(document.html_content, sharedCss);
      return new NextResponse(processedHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Otherwise, generate HTML from template
    try {
      const templateHtml = await loadTemplate(document.document_type as DocumentType);
      const populatedHtml = populatePlaceholders(
        templateHtml,
        document.content_json as Record<string, unknown>
      );

      // Process the template for preview
      const processedHtml = processTemplateForPreview(populatedHtml, sharedCss);

      // Save the processed HTML back to the document
      await supabase
        .from('documents')
        .update({ html_content: processedHtml })
        .eq('id', id);

      return new NextResponse(processedHtml, {
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #FAF7F2;
      --bg-card: #FFFFFF;
      --text-primary: #1A1714;
      --text-secondary: #5E5246;
      --text-muted: #807870;
      --border-color: #E5DFD6;
      --accent: #4A7C59;
    }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .document {
      max-width: 800px;
      margin: 0 auto;
      background: var(--bg-card);
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(26, 23, 20, 0.08);
      overflow: hidden;
    }
    .doc-header {
      padding: 48px;
      border-bottom: 2px solid var(--border-color);
      text-align: center;
    }
    .doc-header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }
    .doc-header .subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }
    .doc-body { padding: 48px; }
    .section { margin-bottom: 32px; }
    .section h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }
    .field { margin-bottom: 16px; }
    .label {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .value { color: var(--text-secondary); }
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="doc-header">
      <h1>${document.title}</h1>
      <div class="subtitle">${document.document_number}</div>
    </div>
    <div class="doc-body">
      <div class="error">
        <strong>Template Error:</strong> Could not load the document template. Showing content fields below.
      </div>
      ${Object.entries(content).map(([key, value]) => `
        <div class="field">
          <div class="label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
          <div class="value">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value || '—'}</div>
        </div>
      `).join('')}
    </div>
  </div>
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
