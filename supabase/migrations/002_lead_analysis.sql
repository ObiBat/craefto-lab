-- Lead Analysis Table (AI Intelligence)
-- Phase 2: Client Intelligence Integration

-- ============================================
-- LEAD ANALYSIS
-- ============================================
CREATE TABLE IF NOT EXISTS lead_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE UNIQUE,

  -- Core Scores
  fit_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  scope_creep_risk DECIMAL(3,2) NOT NULL DEFAULT 0.3,

  -- Classification
  project_type TEXT NOT NULL DEFAULT 'Discovery',
  complexity TEXT NOT NULL DEFAULT 'Medium' CHECK (complexity IN ('Low', 'Medium', 'High')),

  -- Recommendations
  recommended_stack TEXT[] DEFAULT '{}',

  -- Flags
  red_flags TEXT[] DEFAULT '{}',
  green_flags TEXT[] DEFAULT '{}',

  -- Review Status
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT,

  -- Analysis Metadata
  analysis_mode TEXT DEFAULT 'rule_based' CHECK (analysis_mode IN ('rule_based', 'ml_service', 'manual')),
  confidence_score DECIMAL(3,2),
  raw_response JSONB,

  -- Timestamps
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_lead_analysis_lead_id ON lead_analysis(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_analysis_fit_score ON lead_analysis(fit_score);
CREATE INDEX IF NOT EXISTS idx_lead_analysis_requires_review ON lead_analysis(requires_review);

-- Update timestamp trigger
CREATE TRIGGER trigger_lead_analysis_updated_at
  BEFORE UPDATE ON lead_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE lead_analysis ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access to lead_analysis"
  ON lead_analysis FOR ALL
  USING (auth.role() = 'service_role');

-- Add ai_analysis to lead_activities type enum
ALTER TABLE lead_activities DROP CONSTRAINT IF EXISTS lead_activities_type_check;
ALTER TABLE lead_activities ADD CONSTRAINT lead_activities_type_check CHECK (type IN (
  'form_submission',
  'email_sent',
  'email_opened',
  'email_clicked',
  'note_added',
  'call_logged',
  'meeting_scheduled',
  'stage_changed',
  'score_updated',
  'page_viewed',
  'file_uploaded',
  'ai_analysis'
));
