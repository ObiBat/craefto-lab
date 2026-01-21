// Document Automation & E-Signature System Types

// ============================================
// ENUMS
// ============================================

export type DocumentType = 'proposal' | 'sow' | 'invoice' | 'change_order';

export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'sent'
  | 'pending_signature'
  | 'partially_signed'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'archived';

export type SignatureStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';

export type SignerRole = 'client' | 'provider';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded' | 'cancelled';

export type MilestoneType = 'deposit' | 'milestone' | 'final' | 'custom';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'content_edited'
  | 'status_changed'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'downloaded'
  | 'archived'
  | 'restored'
  | 'comment_added'
  | 'payment_received';

// ============================================
// LEAD DATA (for document population)
// ============================================

export interface LeadForDocument {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  website: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  score: number;
  stage?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface LeadAnalysisForDocument {
  fit_score: number;
  scope_creep_risk: number;
  complexity: string;
  project_type: string;
  recommended_stack: string[];
  red_flags: string[];
  green_flags: string[];
}

// ============================================
// PROPOSAL CONTENT
// ============================================

export interface TimelinePhase {
  name: string;
  duration: string;
  color: string;
  description?: string;
}

export interface ScopeItem {
  deliverable: string;
  description: string;
  included: boolean;
  category?: string;
}

export interface PricingTier {
  name: string;
  price: number;
  duration: string;
  features: string[];
  recommended: boolean;
}

export interface PaymentMilestone {
  description: string;
  percentage: number;
  amount: number;
  dueOn: string; // 'signing' | 'design_approval' | 'completion' | date string
}

export interface CaseStudyRef {
  name: string;
  industry?: string;
  result: string;
  url?: string;
}

export interface ProposalContent {
  // Cover
  projectName: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  date: string;
  validUntil: string;

  // Executive Summary
  executiveSummary: string;
  keyOutcomes: string[];

  // Understanding
  understanding: string;
  problemStatement: string;
  successDefinition: string;

  // Approach
  approach: string;
  timeline: TimelinePhase[];

  // Scope
  scope: ScopeItem[];
  exclusions: string[];

  // Pricing
  pricingTiers: PricingTier[];
  selectedTier: string;
  paymentSchedule: PaymentMilestone[];

  // Why Us
  caseStudies: CaseStudyRef[];
  differentiators?: string[];

  // Next Steps
  nextSteps: string[];
}

// ============================================
// SOW CONTENT
// ============================================

export interface SOWPhase {
  name: string;
  number: number;
  deliverables: string[];
  duration?: string;
}

export interface SOWMilestone {
  name: string;
  deliverables: string;
  targetDate: string;
}

export interface SOWAssumption {
  text: string;
  category?: string;
}

export interface SOWContent {
  // Project Overview
  projectName: string;
  sowNumber: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  effectiveDate: string;
  projectDuration: string;
  estimatedCompletion: string;
  projectOverview: string;

  // Scope
  phases: SOWPhase[];
  exclusions: string[];
  assumptions: SOWAssumption[];

  // Timeline
  milestones: SOWMilestone[];

  // Investment
  paymentSchedule: PaymentMilestone[];
  totalInvestment: number;

  // Revisions
  revisionRounds: number;
  feedbackDays: number;
  extraRevisionRate: number;

  // Client Responsibilities
  clientResponsibilities: string[];
  primaryContact: string;
  contentDeliveryDays: number;
}

// ============================================
// INVOICE CONTENT
// ============================================

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceContent {
  // Invoice Details
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;

  // Client Info
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  clientABN?: string;

  // Provider Info
  providerCompany: string;
  providerAddress: string;
  providerABN: string;
  providerBankDetails?: {
    bankName: string;
    accountName: string;
    bsb: string;
    accountNumber: string;
  };

  // Line Items
  lineItems: InvoiceLineItem[];

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;

  // Reference
  projectName?: string;
  sowNumber?: string;
  milestoneDescription?: string;

  // Notes
  notes?: string;
  paymentInstructions?: string;
}

// ============================================
// CHANGE ORDER CONTENT
// ============================================

export interface ChangeOrderContent {
  changeOrderNumber: string;
  sowNumber: string;
  projectName: string;
  date: string;

  // Change Details
  description: string;
  requestedBy: string;
  requestDate: string;
  requestMethod: string; // 'email' | 'call' | 'meeting'

  // Impact Assessment
  scopeImpact: string;
  timelineImpact: string; // e.g., '+2 weeks'
  budgetImpact: number;

  // Updated Values
  newTimeline?: string;
  newCompletionDate?: string;
  additionalDeliverables?: string[];

  // Client Info
  clientCompany: string;
  clientName: string;
}

// ============================================
// MAIN DOCUMENT INTERFACE
// ============================================

export interface Document {
  id: string;
  lead_id: string | null;
  created_by: string;
  document_number: string;
  document_type: DocumentType;
  title: string;
  content_json: ProposalContent | SOWContent | InvoiceContent | ChangeOrderContent;
  html_content: string | null;
  status: DocumentStatus;
  template_id: string | null;
  template_version: number;
  docuseal_submission_id: string | null;
  docuseal_template_id: string | null;
  pdf_storage_path: string | null;
  signed_pdf_storage_path: string | null;
  sent_at: string | null;
  expires_at: string | null;
  signed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;

  // Relations (populated by joins)
  lead?: LeadForDocument;
  signatures?: DocumentSignature[];
  invoice?: Invoice;
  activities?: DocumentActivity[];
}

export interface DocumentSignature {
  id: string;
  document_id: string;
  signer_role: SignerRole;
  signer_name: string;
  signer_email: string;
  docuseal_submitter_id: string | null;
  status: SignatureStatus;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content_json: ProposalContent | SOWContent | InvoiceContent | ChangeOrderContent;
  html_content: string | null;
  changed_by: string;
  change_summary: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  document_id: string;
  sow_document_id: string | null;
  invoice_number: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  line_items: InvoiceLineItem[];
  payment_terms: string;
  due_date: string;
  payment_status: PaymentStatus;
  amount_paid: number;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  stripe_payment_link: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  milestone_type: MilestoneType | null;
  milestone_number: number | null;
  total_milestones: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  activity_type: ActivityType;
  actor: string;
  description: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================
// DOCUSEAL TYPES
// ============================================

export interface DocuSealSubmitter {
  id: number;
  submission_id: number;
  email: string;
  name: string;
  role: string;
  status: 'pending' | 'sent' | 'opened' | 'completed';
  completed_at: string | null;
  documents: Array<{
    name: string;
    url: string;
  }>;
}

export interface DocuSealSubmission {
  id: number;
  source: string;
  submitters: DocuSealSubmitter[];
  template_id: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  status: 'pending' | 'completed';
  audit_log_url: string;
  combined_document_url: string | null;
}

export interface DocuSealTemplate {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

export interface DocuSealWebhookPayload {
  event_type:
    | 'submission.created'
    | 'submission.completed'
    | 'submitter.completed'
    | 'submitter.opened'
    | 'submitter.sent';
  timestamp: string;
  data: {
    id: number;
    submission_id?: number;
    email?: string;
    name?: string;
    status?: string;
    completed_at?: string;
    documents?: Array<{ name: string; url: string }>;
    [key: string]: unknown;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateDocumentRequest {
  lead_id?: string;
  document_type: DocumentType;
  title?: string;
  content_json?: Partial<ProposalContent | SOWContent | InvoiceContent | ChangeOrderContent>;
  template_id?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content_json?: Partial<ProposalContent | SOWContent | InvoiceContent | ChangeOrderContent>;
  status?: DocumentStatus;
  html_content?: string;
}

export interface SendForSignatureRequest {
  signers: Array<{
    name: string;
    email: string;
    role: SignerRole;
  }>;
  message?: string;
  expires_in_days?: number;
}

export interface GenerateDocumentRequest {
  lead_id: string;
  document_type: DocumentType;
  template_id?: string;
  customizations?: Partial<ProposalContent | SOWContent | InvoiceContent>;
}

export interface DocumentListParams {
  type?: DocumentType;
  status?: DocumentStatus;
  lead_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'document_number';
  sort_order?: 'asc' | 'desc';
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface TemplatePlaceholder {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'richtext' | 'array' | 'select';
  required: boolean;
  default?: string | number | boolean;
  options?: string[]; // For select type
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  html_path: string;
  placeholders: TemplatePlaceholder[];
  version: number;
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isProposalContent(content: unknown): content is ProposalContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'projectName' in content &&
    'pricingTiers' in content
  );
}

export function isSOWContent(content: unknown): content is SOWContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'sowNumber' in content &&
    'phases' in content
  );
}

export function isInvoiceContent(content: unknown): content is InvoiceContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'invoiceNumber' in content &&
    'lineItems' in content
  );
}

export function isChangeOrderContent(content: unknown): content is ChangeOrderContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'changeOrderNumber' in content &&
    'scopeImpact' in content
  );
}

// ============================================
// STATUS HELPERS
// ============================================

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  sent: 'Sent',
  pending_signature: 'Awaiting Signature',
  partially_signed: 'Partially Signed',
  signed: 'Signed',
  declined: 'Declined',
  expired: 'Expired',
  archived: 'Archived',
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'gray',
  pending_review: 'yellow',
  sent: 'blue',
  pending_signature: 'orange',
  partially_signed: 'purple',
  signed: 'green',
  declined: 'red',
  expired: 'gray',
  archived: 'gray',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'yellow',
  partial: 'orange',
  paid: 'green',
  overdue: 'red',
  refunded: 'purple',
  cancelled: 'gray',
};
