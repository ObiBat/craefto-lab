-- Craefto Lab Backend Schema
-- Phase 1: Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PIPELINE STAGES
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL,
  color TEXT DEFAULT '#4A4A4A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, slug, "order", color) VALUES
  ('New', 'new', 1, '#6B7280'),
  ('Contacted', 'contacted', 2, '#3B82F6'),
  ('Qualified', 'qualified', 3, '#8B5CF6'),
  ('Proposal Sent', 'proposal', 4, '#F59E0B'),
  ('Negotiation', 'negotiation', 5, '#EC4899'),
  ('Won', 'won', 6, '#10B981'),
  ('Lost', 'lost', 7, '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  website TEXT,

  -- Lead Details
  service_interest TEXT,
  budget_range TEXT,
  timeline TEXT,
  message TEXT,

  -- Source Tracking
  source TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  referrer TEXT,
  landing_page TEXT,

  -- Pipeline
  stage_id UUID REFERENCES pipeline_stages(id),
  score INTEGER DEFAULT 10,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'spam')),
  is_qualified BOOLEAN DEFAULT FALSE,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Set default stage for new leads
CREATE OR REPLACE FUNCTION set_default_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage_id IS NULL THEN
    SELECT id INTO NEW.stage_id FROM pipeline_stages WHERE slug = 'new' LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_default_stage
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_default_stage();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- LEAD ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Activity Type
  type TEXT NOT NULL CHECK (type IN (
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
    'file_uploaded'
  )),

  -- Activity Details
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Actor
  actor_type TEXT DEFAULT 'system' CHECK (actor_type IN ('system', 'admin', 'lead')),
  actor_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ============================================
-- EMAIL LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Email Details
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,

  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),

  -- Resend Integration
  resend_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- ============================================
-- PAGE VIEWS (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page Info
  path TEXT NOT NULL,
  title TEXT,
  referrer TEXT,

  -- UTM Parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Visitor Info
  visitor_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,

  -- Lead Attribution
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,

  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'follow_up' CHECK (type IN ('follow_up', 'call', 'email', 'meeting', 'proposal', 'other')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Scheduling
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to lead_activities"
  ON lead_activities FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to email_logs"
  ON email_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to page_views"
  ON page_views FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to tasks"
  ON tasks FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to pipeline_stages"
  ON pipeline_stages FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anon to insert leads (for contact form)
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Allow anon to insert page views (for analytics)
CREATE POLICY "Anyone can log page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Allow public to read pipeline stages
CREATE POLICY "Anyone can read pipeline stages"
  ON pipeline_stages FOR SELECT
  USING (true);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Lead summary view
CREATE OR REPLACE VIEW lead_summary AS
SELECT
  l.*,
  ps.name as stage_name,
  ps.color as stage_color,
  (SELECT COUNT(*) FROM lead_activities WHERE lead_id = l.id) as activity_count,
  (SELECT MAX(created_at) FROM lead_activities WHERE lead_id = l.id) as last_activity_at
FROM leads l
LEFT JOIN pipeline_stages ps ON l.stage_id = ps.id
WHERE l.status = 'active';

-- Daily stats view
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE is_qualified = true) as qualified_leads,
  COUNT(DISTINCT email) as unique_emails
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
