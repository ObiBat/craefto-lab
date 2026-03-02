-- ============================================================================
-- GO LIVE: Replace dummy data with real GlobFam + JapaTak projects
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE MISSING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('change_request', 'feedback', 'question', 'bug_report', 'feature_request')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_request_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES portal_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('contracts', 'brand_assets', 'deliverables', 'reports', 'invoices')),
  uploaded_by UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  download_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  stripe_checkout_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on new tables
ALTER TABLE portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_request_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Users can read own requests" ON portal_requests FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Admins can read all requests" ON portal_requests FOR SELECT USING (EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager')));
CREATE POLICY "Users can create requests" ON portal_requests FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins can manage requests" ON portal_requests FOR ALL USING (EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager')));

CREATE POLICY "Users can read request replies" ON portal_request_replies FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_requests WHERE id = portal_request_replies.request_id AND author_id = auth.uid())
  OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
);
CREATE POLICY "Users can create replies" ON portal_request_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Team can read documents" ON portal_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_documents.project_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage documents" ON portal_documents FOR ALL USING (EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager')));

CREATE POLICY "Team can read invoices" ON portal_invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_invoices.project_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage invoices" ON portal_invoices FOR ALL USING (EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portal_requests_project ON portal_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_requests_author ON portal_requests(author_id);
CREATE INDEX IF NOT EXISTS idx_portal_requests_status ON portal_requests(status);
CREATE INDEX IF NOT EXISTS idx_portal_replies_request ON portal_request_replies(request_id);
CREATE INDEX IF NOT EXISTS idx_portal_documents_project ON portal_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_documents_category ON portal_documents(category);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_project ON portal_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_status ON portal_invoices(status);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portal_requests_updated_at ON portal_requests;
CREATE TRIGGER portal_requests_updated_at BEFORE UPDATE ON portal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 2. CLEAR ALL DUMMY DATA
-- ============================================================================

DELETE FROM portal_timeline_events;
DELETE FROM portal_team_members;
DELETE FROM portal_updates;
DELETE FROM portal_tasks;
DELETE FROM portal_projects;
DELETE FROM portal_users;

-- ============================================================================
-- 3. SEED REAL USERS
-- ============================================================================

-- Admin (Obi)
INSERT INTO portal_users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'obi@craefto.com', 'Obi Batbileg', 'admin');

-- Dorj (PM)
INSERT INTO portal_users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000002', 'craefto@gmail.com', 'Dorj', 'project_manager');

-- ============================================================================
-- 4. SEED REAL PROJECTS
-- ============================================================================

-- GlobFam
INSERT INTO portal_projects (id, name, slug, description, status, progress, start_date, target_date, linear_team_id, linear_project_id) VALUES
  ('00000000-0000-0000-0000-100000000001',
   'GlobFam SaaS Platform',
   'globfam',
   'Cross-border family finance SaaS platform with multi-currency dashboard, visa tracking, compliance monitoring, and financial planning tools.',
   'on_track', 15, '2026-02-23', '2026-05-08',
   '3244cec5-e42b-44d5-849d-8223b40b6825',
   'fbf67e1e-07bc-4998-8a34-0078ff806eb2');

-- JapaTak
INSERT INTO portal_projects (id, name, slug, description, status, progress, start_date, target_date, linear_team_id, linear_project_id) VALUES
  ('00000000-0000-0000-0000-100000000002',
   'Japa-Tak Buyer Insight Platform',
   'japa-tak',
   'Buyer insight platform providing market intelligence, pricing analytics, and competitive data for informed purchasing decisions.',
   'on_track', 6, '2026-02-24', '2026-05-26',
   '226b1bfb-3262-42f7-87c5-359b5621f4b1',
   'ad298d75-46c1-4ef5-a084-f3de353e539c');

-- ============================================================================
-- 5. SEED TEAM MEMBERS
-- ============================================================================

-- Obi on both projects
INSERT INTO portal_team_members (project_id, user_id, role_in_project) VALUES
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000001', 'Lead Developer'),
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000001', 'Lead Developer');

-- Dorj on both projects
INSERT INTO portal_team_members (project_id, user_id, role_in_project) VALUES
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000002', 'Project Manager'),
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000002', 'Project Manager');

-- ============================================================================
-- 6. SEED INITIAL UPDATES
-- ============================================================================

INSERT INTO portal_updates (project_id, author_id, type, title, content, tags) VALUES
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000002', 'milestone',
   'Project kickoff: GlobFam SaaS Platform',
   '<p>Project officially started. Linear workspace configured with full issue breakdown across 7 sprints. Architecture decisions locked: Next.js 15, Supabase, Tailwind CSS v4.</p>',
   ARRAY['milestone', 'kickoff']),
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000002', 'alignment',
   'Sprint structure and timeline confirmed',
   '<p>7 sprints planned from Feb 23 to May 8. Each sprint is 2 weeks. Current focus: Foundation Sprint (auth, database schema, CI/CD pipeline).</p>',
   ARRAY['alignment', 'planning']),
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000002', 'milestone',
   'Project kickoff: Japa-Tak Buyer Insight Platform',
   '<p>Japa-Tak development started. Linear workspace set up with full issue breakdown. Architecture: Next.js, Supabase, data pipeline for market intelligence.</p>',
   ARRAY['milestone', 'kickoff']),
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000002', 'alignment',
   'Technical architecture locked',
   '<p>Stack confirmed: Next.js for frontend, Supabase for auth/database, custom data pipeline for pricing analytics. Target launch: May 26, 2026.</p>',
   ARRAY['alignment', 'architecture']);

-- ============================================================================
-- 7. SEED TIMELINE EVENTS
-- ============================================================================

INSERT INTO portal_timeline_events (project_id, type, title, description, actor_id) VALUES
  ('00000000-0000-0000-0000-100000000001', 'milestone', 'Project started', 'GlobFam SaaS Platform development begins', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-100000000001', 'member_joined', 'Obi Batbileg joined', 'Lead Developer', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-100000000001', 'member_joined', 'Dorj joined', 'Project Manager', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-100000000002', 'milestone', 'Project started', 'Japa-Tak Buyer Insight Platform development begins', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-100000000002', 'member_joined', 'Obi Batbileg joined', 'Lead Developer', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-100000000002', 'member_joined', 'Dorj joined', 'Project Manager', '00000000-0000-0000-0000-000000000002');

