-- ============================================================================
-- PORTAL TABLES — Stakeholder Updates Portal
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PORTAL USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'stakeholder' CHECK (role IN ('admin', 'project_manager', 'team_member', 'stakeholder')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_role ON portal_users(role);

-- ============================================================================
-- PORTAL PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'blocked', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  target_date DATE,
  linear_team_id TEXT,
  linear_project_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_projects_slug ON portal_projects(slug);
CREATE INDEX idx_portal_projects_status ON portal_projects(status);
CREATE INDEX idx_portal_projects_linear_team ON portal_projects(linear_team_id);
CREATE INDEX idx_portal_projects_linear_project ON portal_projects(linear_project_id);

-- ============================================================================
-- PORTAL TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'none')),
  assignee_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  linear_issue_id TEXT,
  linear_identifier TEXT,
  due_date TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_tasks_project ON portal_tasks(project_id);
CREATE INDEX idx_portal_tasks_status ON portal_tasks(status);
CREATE INDEX idx_portal_tasks_assignee ON portal_tasks(assignee_id);
CREATE INDEX idx_portal_tasks_linear ON portal_tasks(linear_issue_id);

-- ============================================================================
-- PORTAL UPDATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'alignment' CHECK (type IN ('alignment', 'decision', 'blocker', 'milestone', 'task_update')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  approval_status TEXT CHECK (approval_status IN ('pending_review', 'approved', 'changes_requested')),
  approval_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_updates_project ON portal_updates(project_id);
CREATE INDEX idx_portal_updates_author ON portal_updates(author_id);
CREATE INDEX idx_portal_updates_type ON portal_updates(type);
CREATE INDEX idx_portal_updates_created ON portal_updates(created_at DESC);

-- ============================================================================
-- PORTAL TEAM MEMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  role_in_project TEXT DEFAULT 'Member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_portal_team_project ON portal_team_members(project_id);
CREATE INDEX idx_portal_team_user ON portal_team_members(user_id);

-- ============================================================================
-- PORTAL TIMELINE EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('update', 'task_completed', 'status_change', 'member_joined', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_timeline_project ON portal_timeline_events(project_id);
CREATE INDEX idx_portal_timeline_created ON portal_timeline_events(created_at DESC);

-- ============================================================================
-- CLIENT REQUESTS
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

CREATE INDEX idx_portal_requests_project ON portal_requests(project_id);
CREATE INDEX idx_portal_requests_author ON portal_requests(author_id);
CREATE INDEX idx_portal_requests_status ON portal_requests(status);

-- ============================================================================
-- REQUEST REPLIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_request_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES portal_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_replies_request ON portal_request_replies(request_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
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

CREATE INDEX idx_portal_documents_project ON portal_documents(project_id);
CREATE INDEX idx_portal_documents_category ON portal_documents(category);

-- ============================================================================
-- INVOICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS portal_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- AUD cents
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  stripe_checkout_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_invoices_project ON portal_invoices(project_id);
CREATE INDEX idx_portal_invoices_status ON portal_invoices(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_request_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoices ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON portal_users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON portal_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read projects they are members of
CREATE POLICY "Team members can read projects" ON portal_projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_projects.id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert/update projects
CREATE POLICY "Admins can manage projects" ON portal_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
  );

-- Tasks: read if team member, write if admin/pm
CREATE POLICY "Team can read tasks" ON portal_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_tasks.project_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage tasks" ON portal_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
  );

-- Updates: read if team member, create if admin/pm/team
CREATE POLICY "Team can read updates" ON portal_updates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_updates.project_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Team can create updates" ON portal_updates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager', 'team_member'))
  );

-- Team members: read for project members
CREATE POLICY "Team can read team members" ON portal_team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members tm WHERE tm.project_id = portal_team_members.project_id AND tm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage team members" ON portal_team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
  );

-- Timeline: same as project access
CREATE POLICY "Team can read timeline" ON portal_timeline_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_timeline_events.project_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Requests: author can read own, admins can read all
CREATE POLICY "Users can read own requests" ON portal_requests
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Admins can read all requests" ON portal_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
  );

CREATE POLICY "Users can create requests" ON portal_requests
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Request replies: same access as parent request
CREATE POLICY "Users can read request replies" ON portal_request_replies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_requests WHERE id = portal_request_replies.request_id AND (author_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role IN ('admin', 'project_manager'))
  );

-- Documents: project members can read
CREATE POLICY "Team can read documents" ON portal_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_documents.project_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Invoices: project members can read
CREATE POLICY "Team can read invoices" ON portal_invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_team_members WHERE project_id = portal_invoices.project_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portal_users_updated_at BEFORE UPDATE ON portal_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portal_projects_updated_at BEFORE UPDATE ON portal_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portal_tasks_updated_at BEFORE UPDATE ON portal_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portal_updates_updated_at BEFORE UPDATE ON portal_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portal_requests_updated_at BEFORE UPDATE ON portal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE portal_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_timeline_events;
