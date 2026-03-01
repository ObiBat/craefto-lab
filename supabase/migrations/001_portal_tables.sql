-- ============================================================================
-- STAKEHOLDER UPDATES PORTAL — Database Schema
-- ============================================================================

-- Enums
CREATE TYPE portal_user_role AS ENUM ('admin', 'project_manager', 'stakeholder', 'team_member');
CREATE TYPE portal_project_status AS ENUM ('on_track', 'at_risk', 'blocked', 'completed', 'paused');
CREATE TYPE portal_update_type AS ENUM ('alignment', 'decision', 'blocker', 'milestone', 'task_update');
CREATE TYPE portal_task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
CREATE TYPE portal_task_priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');

-- ============================================================================
-- PORTAL USERS (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE portal_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role portal_user_role NOT NULL DEFAULT 'stakeholder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PROJECTS
-- ============================================================================
CREATE TABLE portal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status portal_project_status NOT NULL DEFAULT 'on_track',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  target_date DATE,
  linear_team_id TEXT,
  linear_project_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_projects_slug ON portal_projects(slug);
CREATE INDEX idx_portal_projects_status ON portal_projects(status);

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE portal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status portal_task_status NOT NULL DEFAULT 'backlog',
  priority portal_task_priority NOT NULL DEFAULT 'none',
  assignee_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  linear_issue_id TEXT,
  linear_identifier TEXT,
  due_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_tasks_project ON portal_tasks(project_id);
CREATE INDEX idx_portal_tasks_status ON portal_tasks(status);
CREATE INDEX idx_portal_tasks_assignee ON portal_tasks(assignee_id);

-- ============================================================================
-- UPDATES
-- ============================================================================
CREATE TABLE portal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  type portal_update_type NOT NULL DEFAULT 'alignment',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  mentions UUID[] NOT NULL DEFAULT '{}',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_updates_project ON portal_updates(project_id);
CREATE INDEX idx_portal_updates_author ON portal_updates(author_id);
CREATE INDEX idx_portal_updates_type ON portal_updates(type);
CREATE INDEX idx_portal_updates_created ON portal_updates(created_at DESC);

-- ============================================================================
-- TEAM MEMBERS (project <-> user mapping)
-- ============================================================================
CREATE TABLE portal_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  role_in_project TEXT NOT NULL DEFAULT 'Member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_portal_team_project ON portal_team_members(project_id);
CREATE INDEX idx_portal_team_user ON portal_team_members(user_id);

-- ============================================================================
-- TIMELINE EVENTS (activity log)
-- ============================================================================
CREATE TABLE portal_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'update', 'task_completed', 'status_change', 'member_joined', 'milestone'
  title TEXT NOT NULL,
  description TEXT,
  actor_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_timeline_project ON portal_timeline_events(project_id);
CREATE INDEX idx_portal_timeline_created ON portal_timeline_events(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION portal_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_portal_users_updated_at
  BEFORE UPDATE ON portal_users
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

CREATE TRIGGER set_portal_projects_updated_at
  BEFORE UPDATE ON portal_projects
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

CREATE TRIGGER set_portal_tasks_updated_at
  BEFORE UPDATE ON portal_tasks
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

CREATE TRIGGER set_portal_updates_updated_at
  BEFORE UPDATE ON portal_updates
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_timeline_events ENABLE ROW LEVEL SECURITY;

-- Portal users can read their own profile
CREATE POLICY "Users can read own profile"
  ON portal_users FOR SELECT
  USING (auth.uid() = id);

-- Admin and PM can read all users
CREATE POLICY "Admin/PM can read all users"
  ON portal_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
    )
  );

-- Authenticated users can read all projects
CREATE POLICY "Authenticated users can read projects"
  ON portal_projects FOR SELECT
  TO authenticated
  USING (true);

-- Admin and PM can manage projects
CREATE POLICY "Admin/PM can manage projects"
  ON portal_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
    )
  );

-- Authenticated users can read tasks
CREATE POLICY "Authenticated users can read tasks"
  ON portal_tasks FOR SELECT
  TO authenticated
  USING (true);

-- Admin, PM, and team members can manage tasks
CREATE POLICY "Admin/PM can manage tasks"
  ON portal_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
    )
  );

-- Authenticated users can read updates
CREATE POLICY "Authenticated users can read updates"
  ON portal_updates FOR SELECT
  TO authenticated
  USING (true);

-- Admin, PM, and team members can create updates
CREATE POLICY "Authenticated users can create updates"
  ON portal_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can edit their own updates
CREATE POLICY "Authors can edit own updates"
  ON portal_updates FOR UPDATE
  USING (auth.uid() = author_id);

-- Authenticated users can read team members
CREATE POLICY "Authenticated users can read team members"
  ON portal_team_members FOR SELECT
  TO authenticated
  USING (true);

-- Admin/PM can manage team members
CREATE POLICY "Admin/PM can manage team members"
  ON portal_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
    )
  );

-- Authenticated users can read timeline events
CREATE POLICY "Authenticated users can read timeline"
  ON portal_timeline_events FOR SELECT
  TO authenticated
  USING (true);

-- Admin/PM can create timeline events
CREATE POLICY "Admin/PM can create timeline events"
  ON portal_timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
    )
  );

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE portal_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_timeline_events;
