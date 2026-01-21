// DocuSeal API Client for E-Signature Integration

import type {
  DocuSealSubmission,
  DocuSealSubmitter,
  DocuSealTemplate,
  DocuSealWebhookPayload,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'http://localhost:3001';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY || '';
const DOCUSEAL_WEBHOOK_SECRET = process.env.DOCUSEAL_WEBHOOK_SECRET || '';

// ============================================
// ERROR HANDLING
// ============================================

export class DocuSealError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'DocuSealError';
  }
}

// ============================================
// HTTP CLIENT
// ============================================

async function docusealFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DOCUSEAL_API_URL}/api${endpoint}`;

  const headers: HeadersInit = {
    'X-Auth-Token': DOCUSEAL_API_KEY,
    ...options.headers,
  };

  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData: unknown;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = errorText;
    }
    throw new DocuSealError(
      `DocuSeal API error: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

/**
 * List all templates
 */
export async function listTemplates(): Promise<DocuSealTemplate[]> {
  return docusealFetch<DocuSealTemplate[]>('/templates');
}

/**
 * Get a specific template
 */
export async function getTemplate(templateId: number): Promise<DocuSealTemplate> {
  return docusealFetch<DocuSealTemplate>(`/templates/${templateId}`);
}

/**
 * Create a new template from a PDF or HTML document
 */
export async function createTemplate(
  name: string,
  documentBuffer: Buffer,
  fileName: string = 'document.pdf'
): Promise<DocuSealTemplate> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append(
    'documents[]',
    new Blob([new Uint8Array(documentBuffer)], { type: 'application/pdf' }),
    fileName
  );

  return docusealFetch<DocuSealTemplate>('/templates', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Create a template from HTML content
 */
export async function createTemplateFromHtml(
  name: string,
  htmlContent: string
): Promise<DocuSealTemplate> {
  return docusealFetch<DocuSealTemplate>('/templates/html', {
    method: 'POST',
    body: JSON.stringify({
      name,
      html: htmlContent,
    }),
  });
}

/**
 * Update template fields/configuration
 */
export async function updateTemplate(
  templateId: number,
  updates: Partial<{ name: string; fields: DocuSealTemplate['fields'] }>
): Promise<DocuSealTemplate> {
  return docusealFetch<DocuSealTemplate>(`/templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: number): Promise<void> {
  await docusealFetch(`/templates/${templateId}`, {
    method: 'DELETE',
  });
}

// ============================================
// SUBMISSION MANAGEMENT
// ============================================

export interface CreateSubmissionOptions {
  templateId: number;
  submitters: Array<{
    email: string;
    name: string;
    role: string;
    fields?: Record<string, string>;
  }>;
  sendEmail?: boolean;
  message?: string;
  completedRedirectUrl?: string;
  expireAt?: string;
}

/**
 * Create a new submission (signing request)
 */
export async function createSubmission(
  options: CreateSubmissionOptions
): Promise<DocuSealSubmission> {
  return docusealFetch<DocuSealSubmission>('/submissions', {
    method: 'POST',
    body: JSON.stringify({
      template_id: options.templateId,
      send_email: options.sendEmail ?? true,
      message: options.message,
      completed_redirect_url: options.completedRedirectUrl,
      expire_at: options.expireAt,
      submitters: options.submitters.map((s) => ({
        email: s.email,
        name: s.name,
        role: s.role,
        fields: s.fields,
      })),
    }),
  });
}

/**
 * Create submission with document upload (one-off, doesn't require pre-existing template)
 */
export async function createSubmissionWithDocument(
  documentBuffer: Buffer,
  fileName: string,
  submitters: Array<{
    email: string;
    name: string;
    role: string;
  }>,
  options?: {
    sendEmail?: boolean;
    message?: string;
    expireAt?: string;
  }
): Promise<DocuSealSubmission> {
  const formData = new FormData();

  formData.append(
    'documents[]',
    new Blob([new Uint8Array(documentBuffer)], { type: 'application/pdf' }),
    fileName
  );

  formData.append('send_email', String(options?.sendEmail ?? true));

  if (options?.message) {
    formData.append('message', options.message);
  }

  if (options?.expireAt) {
    formData.append('expire_at', options.expireAt);
  }

  submitters.forEach((submitter, index) => {
    formData.append(`submitters[${index}][email]`, submitter.email);
    formData.append(`submitters[${index}][name]`, submitter.name);
    formData.append(`submitters[${index}][role]`, submitter.role);
  });

  return docusealFetch<DocuSealSubmission>('/submissions', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Get submission status
 */
export async function getSubmission(submissionId: number): Promise<DocuSealSubmission> {
  return docusealFetch<DocuSealSubmission>(`/submissions/${submissionId}`);
}

/**
 * List submissions with optional filters
 */
export async function listSubmissions(params?: {
  templateId?: number;
  status?: 'pending' | 'completed';
  limit?: number;
  after?: number;
}): Promise<DocuSealSubmission[]> {
  const searchParams = new URLSearchParams();

  if (params?.templateId) {
    searchParams.append('template_id', String(params.templateId));
  }
  if (params?.status) {
    searchParams.append('status', params.status);
  }
  if (params?.limit) {
    searchParams.append('limit', String(params.limit));
  }
  if (params?.after) {
    searchParams.append('after', String(params.after));
  }

  const query = searchParams.toString();
  return docusealFetch<DocuSealSubmission[]>(`/submissions${query ? `?${query}` : ''}`);
}

/**
 * Archive a submission
 */
export async function archiveSubmission(submissionId: number): Promise<void> {
  await docusealFetch(`/submissions/${submissionId}`, {
    method: 'DELETE',
  });
}

// ============================================
// SUBMITTER MANAGEMENT
// ============================================

/**
 * Get submitter details
 */
export async function getSubmitter(submitterId: number): Promise<DocuSealSubmitter> {
  return docusealFetch<DocuSealSubmitter>(`/submitters/${submitterId}`);
}

/**
 * Resend email to submitter
 */
export async function resendSubmitterEmail(submitterId: number): Promise<void> {
  await docusealFetch(`/submitters/${submitterId}/send_email`, {
    method: 'POST',
  });
}

// ============================================
// DOCUMENT DOWNLOAD
// ============================================

/**
 * Download signed document
 */
export async function downloadSignedDocument(documentUrl: string): Promise<Buffer> {
  const response = await fetch(documentUrl, {
    headers: {
      'X-Auth-Token': DOCUSEAL_API_KEY,
    },
  });

  if (!response.ok) {
    throw new DocuSealError(
      `Failed to download document: ${response.statusText}`,
      response.status
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get the combined signed document URL from a submission
 */
export function getSignedDocumentUrl(submission: DocuSealSubmission): string | null {
  return submission.combined_document_url || null;
}

/**
 * Get audit log URL for a submission
 */
export function getAuditLogUrl(submission: DocuSealSubmission): string {
  return submission.audit_log_url;
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

/**
 * Verify webhook signature (if DocuSeal provides signature verification)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!DOCUSEAL_WEBHOOK_SECRET) {
    console.warn('DocuSeal webhook secret not configured');
    return true; // Allow in development
  }

  // DocuSeal uses simple token-based verification
  // The signature header should match the configured secret
  return signature === DOCUSEAL_WEBHOOK_SECRET;
}

/**
 * Parse webhook payload
 */
export function parseWebhookPayload(body: string): DocuSealWebhookPayload {
  try {
    return JSON.parse(body) as DocuSealWebhookPayload;
  } catch {
    throw new DocuSealError('Invalid webhook payload');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if all submitters have completed signing
 */
export function isSubmissionComplete(submission: DocuSealSubmission): boolean {
  return submission.status === 'completed';
}

/**
 * Get signing progress
 */
export function getSigningProgress(
  submission: DocuSealSubmission
): { completed: number; total: number; percentage: number } {
  const total = submission.submitters.length;
  const completed = submission.submitters.filter(
    (s) => s.status === 'completed'
  ).length;

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Map DocuSeal submitter status to our SignatureStatus type
 */
export function mapSubmitterStatus(
  docusealStatus: DocuSealSubmitter['status']
): 'pending' | 'sent' | 'viewed' | 'signed' {
  switch (docusealStatus) {
    case 'pending':
      return 'pending';
    case 'sent':
      return 'sent';
    case 'opened':
      return 'viewed';
    case 'completed':
      return 'signed';
    default:
      return 'pending';
  }
}

// ============================================
// CONNECTION CHECK
// ============================================

/**
 * Check if DocuSeal is available and properly configured
 */
export async function checkConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await listTemplates();
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// EXPORT CLIENT OBJECT
// ============================================

export const docusealClient = {
  // Templates
  listTemplates,
  getTemplate,
  createTemplate,
  createTemplateFromHtml,
  updateTemplate,
  deleteTemplate,

  // Submissions
  createSubmission,
  createSubmissionWithDocument,
  getSubmission,
  listSubmissions,
  archiveSubmission,

  // Submitters
  getSubmitter,
  resendSubmitterEmail,

  // Documents
  downloadSignedDocument,
  getSignedDocumentUrl,
  getAuditLogUrl,

  // Webhooks
  verifyWebhookSignature,
  parseWebhookPayload,

  // Helpers
  isSubmissionComplete,
  getSigningProgress,
  mapSubmitterStatus,
  checkConnection,
};

export default docusealClient;
