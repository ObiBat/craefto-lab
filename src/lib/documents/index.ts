// Document Automation & E-Signature System
// Main exports

// Types
export * from './types';

// Template definitions and defaults
export {
  DOCUMENT_TEMPLATES,
  SERVICE_TYPE_NAMES,
  SERVICE_PROJECT_NAMES,
  BUDGET_TO_TIER,
  TIMELINE_TO_WEEKS,
  generateProjectName,
  formatDate,
  formatCurrency,
  addDays,
  addWeeks,
  getDefaultTimelinePhases,
  getDefaultScopeItems,
  getDefaultPricingTiers,
  getDefaultPaymentSchedule,
  getDefaultSOWPhases,
  getDefaultExclusions,
  generateDefaultProposalContent,
  generateDefaultSOWContent,
  generateDefaultInvoiceContent,
} from './templates';

// Document generation
export {
  populatePlaceholders,
  loadTemplate,
  generateDocument,
  generatePreviewContent,
  validateContent,
  normalizeKey,
  flattenContent,
} from './generator';

// DocuSeal e-signature client
export {
  docusealClient,
  DocuSealError,
  listTemplates,
  getTemplate,
  createTemplate,
  createTemplateFromHtml,
  updateTemplate,
  deleteTemplate,
  createSubmission,
  createSubmissionWithDocument,
  getSubmission,
  listSubmissions,
  archiveSubmission,
  getSubmitter,
  resendSubmitterEmail,
  downloadSignedDocument,
  getSignedDocumentUrl,
  getAuditLogUrl,
  verifyWebhookSignature,
  parseWebhookPayload,
  isSubmissionComplete,
  getSigningProgress,
  mapSubmitterStatus,
  checkConnection,
} from './docuseal';

// PDF generation
export {
  pdfGenerator,
  generatePDFFromHTML,
  generatePDFFromURL,
  generatePDFFromFile,
  generateDocumentPDF,
  mergePDFs,
  getPDFMetadata,
  pdfToBase64,
  base64ToPDF,
  closeBrowser,
} from './pdf';
