// PDF Generation Utility using Puppeteer

import puppeteer, { type Browser, type PDFOptions } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================
// CONFIGURATION
// ============================================

const PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm',
  },
  displayHeaderFooter: false,
};

// Browser instance for reuse
let browserInstance: Browser | null = null;

// ============================================
// BROWSER MANAGEMENT
// ============================================

/**
 * Get or create a browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--font-render-hinting=none',
    ],
  });

  return browserInstance;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// ============================================
// PDF GENERATION
// ============================================

export interface GeneratePDFOptions {
  /** Page format (default: A4) */
  format?: 'A4' | 'Letter' | 'Legal';
  /** Print background colors/images */
  printBackground?: boolean;
  /** Page margins in mm */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** Custom header HTML */
  headerTemplate?: string;
  /** Custom footer HTML */
  footerTemplate?: string;
  /** Display header/footer */
  displayHeaderFooter?: boolean;
  /** Landscape orientation */
  landscape?: boolean;
  /** Scale of the webpage rendering (0.1 - 2) */
  scale?: number;
  /** Wait for specific selector before generating PDF */
  waitForSelector?: string;
  /** Additional wait time in ms */
  waitTime?: number;
}

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(
  html: string,
  options: GeneratePDFOptions = {}
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    // Load HTML content
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });

    // Wait for custom selector if specified
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }

    // Additional wait time if needed
    if (options.waitTime) {
      await new Promise((resolve) => setTimeout(resolve, options.waitTime));
    }

    // Inject print-specific styles
    await page.addStyleTag({
      content: `
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `,
    });

    // Generate PDF
    const pdfOptions: PDFOptions = {
      ...PDF_OPTIONS,
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      landscape: options.landscape || false,
      scale: options.scale || 1,
      displayHeaderFooter: options.displayHeaderFooter || false,
      margin: {
        ...PDF_OPTIONS.margin,
        ...options.margin,
      },
    };

    if (options.displayHeaderFooter) {
      pdfOptions.headerTemplate = options.headerTemplate || '<div></div>';
      pdfOptions.footerTemplate =
        options.footerTemplate ||
        `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `;
    }

    const pdfBuffer = await page.pdf(pdfOptions);

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Generate PDF from a URL
 */
export async function generatePDFFromURL(
  url: string,
  options: GeneratePDFOptions = {}
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    await page.goto(url, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000,
    });

    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }

    if (options.waitTime) {
      await new Promise((resolve) => setTimeout(resolve, options.waitTime));
    }

    const pdfBuffer = await page.pdf({
      ...PDF_OPTIONS,
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      landscape: options.landscape || false,
      margin: {
        ...PDF_OPTIONS.margin,
        ...options.margin,
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Generate PDF from a file path
 */
export async function generatePDFFromFile(
  filePath: string,
  options: GeneratePDFOptions = {}
): Promise<Buffer> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const html = await fs.readFile(absolutePath, 'utf-8');
  return generatePDFFromHTML(html, options);
}

// ============================================
// DOCUMENT-SPECIFIC PDF GENERATION
// ============================================

/**
 * Generate PDF with document-specific styling
 */
export async function generateDocumentPDF(
  html: string,
  documentType: 'proposal' | 'sow' | 'invoice' | 'change_order'
): Promise<Buffer> {
  // Load shared styles
  const stylesPath = path.join(process.cwd(), 'public', 'client-hub', 'styles.css');
  let styles = '';

  try {
    styles = await fs.readFile(stylesPath, 'utf-8');
  } catch {
    console.warn('Could not load client-hub styles');
  }

  // Inject styles into HTML
  const styledHtml = html.replace(
    '</head>',
    `<style>${styles}</style>
    <style>
      /* PDF-specific overrides */
      body {
        background: white !important;
        padding: 0 !important;
      }
      .page-header,
      .back-link,
      .print-button,
      .template-header,
      .nav-tabs,
      .tab-buttons {
        display: none !important;
      }
      .template-content,
      .legal-document,
      .proposal-document,
      .invoice-document {
        max-width: none !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      @page {
        size: A4;
        margin: 15mm;
      }
    </style>
    </head>`
  );

  // Configure options based on document type
  const options: GeneratePDFOptions = {
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: documentType !== 'invoice',
  };

  if (documentType === 'proposal') {
    options.footerTemplate = `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #807870; padding: 0 20mm;">
        <span>Craefto Lab — Project Proposal</span>
        <span style="margin-left: 20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `;
  } else if (documentType === 'sow') {
    options.footerTemplate = `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #807870; padding: 0 20mm;">
        <span>Statement of Work — Confidential</span>
        <span style="margin-left: 20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `;
  }

  return generatePDFFromHTML(styledHtml, options);
}

// ============================================
// MERGE PDFs (if needed)
// ============================================

/**
 * Merge multiple PDFs into one (requires pdf-lib)
 * Note: This is a placeholder - implement with pdf-lib if needed
 */
export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  // For now, just return the first PDF
  // To properly merge, install pdf-lib and implement
  if (pdfBuffers.length === 0) {
    throw new Error('No PDFs to merge');
  }

  if (pdfBuffers.length === 1) {
    return pdfBuffers[0];
  }

  // TODO: Implement PDF merging with pdf-lib
  // const { PDFDocument } = await import('pdf-lib');
  // const mergedPdf = await PDFDocument.create();
  // for (const buffer of pdfBuffers) {
  //   const pdf = await PDFDocument.load(buffer);
  //   const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  //   pages.forEach(page => mergedPdf.addPage(page));
  // }
  // return Buffer.from(await mergedPdf.save());

  console.warn('PDF merging not implemented, returning first PDF');
  return pdfBuffers[0];
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get PDF metadata (page count, etc.)
 * Note: This is a placeholder - implement with pdf-lib if needed
 */
export async function getPDFMetadata(pdfBuffer: Buffer): Promise<{
  pageCount: number;
  fileSize: number;
}> {
  // Basic implementation without pdf-lib
  return {
    pageCount: 1, // Would need pdf-lib to get actual count
    fileSize: pdfBuffer.length,
  };
}

/**
 * Convert PDF buffer to base64
 */
export function pdfToBase64(pdfBuffer: Buffer): string {
  return pdfBuffer.toString('base64');
}

/**
 * Convert base64 to PDF buffer
 */
export function base64ToPDF(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

// ============================================
// CLEANUP
// ============================================

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    closeBrowser().catch(console.error);
  });

  process.on('SIGINT', () => {
    closeBrowser().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    closeBrowser().then(() => process.exit(0));
  });
}

// ============================================
// EXPORTS
// ============================================

export const pdfGenerator = {
  generatePDFFromHTML,
  generatePDFFromURL,
  generatePDFFromFile,
  generateDocumentPDF,
  mergePDFs,
  getPDFMetadata,
  pdfToBase64,
  base64ToPDF,
  closeBrowser,
};

export default pdfGenerator;
