-- Craefto Lab Documents & E-Signature System
-- Phase: Document Automation

-- ============================================
-- DOCUMENT NUMBER SEQUENCES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS proposal_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS sow_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS change_order_number_seq START 1;

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',

  -- Document identification
  document_number TEXT UNIQUE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('proposal', 'sow', 'invoice', 'change_order')),

  -- Content
  title TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  html_content TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_review',
    'sent',
    'pending_signature',
    'partially_signed',
    'signed',
    'declined',
    'expired',
    'archived'
  )),

  -- Template tracking
  template_id TEXT,
  template_version INTEGER DEFAULT 1,

  -- DocuSeal integration
  docuseal_submission_id TEXT,
  docuseal_template_id TEXT,

  -- File storage (Supabase Storage paths)
  pdf_storage_path TEXT,
  signed_pdf_storage_path TEXT,

  -- Dates
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_docuseal_submission ON documents(docuseal_submission_id);

-- ============================================
-- DOCUMENT SIGNATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Signer info
  signer_role TEXT NOT NULL CHECK (signer_role IN ('client', 'provider')),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,

  -- DocuSeal tracking
  docuseal_submitter_id TEXT,

  -- Signature status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'viewed',
    'signed',
    'declined'
  )),

  -- Audit trail
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Signature data
  ip_address TEXT,
  user_agent TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for signatures
CREATE INDEX IF NOT EXISTS idx_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_email ON document_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON document_signatures(status);

-- ============================================
-- DOCUMENT VERSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Version info
  version_number INTEGER NOT NULL,

  -- Content snapshot
  content_json JSONB NOT NULL,
  html_content TEXT,

  -- Change tracking
  changed_by TEXT NOT NULL DEFAULT 'admin',
  change_summary TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for versions
CREATE INDEX IF NOT EXISTS idx_versions_document_id ON document_versions(document_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_versions_document_version ON document_versions(document_id, version_number);

-- ============================================
-- INVOICES TABLE (extends documents)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  document_id UUID UNIQUE NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  sow_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,

  -- Financial data
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',

  -- Line items
  line_items JSONB NOT NULL DEFAULT '[]',

  -- Payment terms
  payment_terms TEXT DEFAULT 'NET14',
  due_date DATE NOT NULL,

  -- Payment tracking
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid',
    'partial',
    'paid',
    'overdue',
    'refunded',
    'cancelled'
  )),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,

  -- Stripe integration (optional)
  stripe_payment_link TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Milestone tracking (for 50/25/25 structure)
  milestone_type TEXT CHECK (milestone_type IN ('deposit', 'milestone', 'final', 'custom')),
  milestone_number INTEGER,
  total_milestones INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_document_id ON invoices(document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sow_id ON invoices(sow_document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- ============================================
-- DOCUMENT ACTIVITIES TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS document_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Activity info
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created',
    'updated',
    'content_edited',
    'status_changed',
    'sent',
    'viewed',
    'signed',
    'declined',
    'expired',
    'downloaded',
    'archived',
    'restored',
    'comment_added',
    'payment_received'
  )),
  actor TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Previous/new values for tracking changes
  previous_value JSONB,
  new_value JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for activities
CREATE INDEX IF NOT EXISTS idx_doc_activities_document_id ON document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_activities_created_at ON document_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_activities_type ON document_activities(activity_type);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate document numbers
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq_val INTEGER;
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  CASE doc_type
    WHEN 'proposal' THEN
      prefix := 'PROP';
      seq_val := nextval('proposal_number_seq');
    WHEN 'sow' THEN
      prefix := 'SOW';
      seq_val := nextval('sow_number_seq');
    WHEN 'invoice' THEN
      prefix := 'INV';
      seq_val := nextval('invoice_number_seq');
    WHEN 'change_order' THEN
      prefix := 'CO';
      seq_val := nextval('change_order_number_seq');
    ELSE
      RAISE EXCEPTION 'Invalid document type: %', doc_type;
  END CASE;

  RETURN prefix || '-' || year_part || '-' || LPAD(seq_val::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate document number on insert
CREATE OR REPLACE FUNCTION auto_generate_document_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_number IS NULL OR NEW.document_number = '' THEN
    NEW.document_number := generate_document_number(NEW.document_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_document_number
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_document_number();

-- Update timestamp trigger for documents
CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update timestamp trigger for signatures
CREATE TRIGGER trigger_signatures_updated_at
  BEFORE UPDATE ON document_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update timestamp trigger for invoices
CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activities ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to documents"
  ON documents FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to signatures"
  ON document_signatures FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to versions"
  ON document_versions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to activities"
  ON document_activities FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE BUCKET (for PDFs)
-- ============================================
-- Note: Run this in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies would be:
-- CREATE POLICY "Service role can manage documents bucket"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'documents' AND auth.role() = 'service_role');
