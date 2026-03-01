-- ============================================================================
-- SPRINT 2: Row Level Security Hardening
-- Drops existing policies from 001 and creates refined policies
-- ============================================================================

-- ============================================================================
-- DROP EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON portal_users;
DROP POLICY IF EXISTS "Admin/PM can read all users" ON portal_users;
DROP POLICY IF EXISTS "Authenticated users can read projects" ON portal_projects;
DROP POLICY IF EXISTS "Admin/PM can manage projects" ON portal_projects;
DROP POLICY IF EXISTS "Authenticated users can read tasks" ON portal_tasks;
DROP POLICY IF EXISTS "Admin/PM can manage tasks" ON portal_tasks;
DROP POLICY IF EXISTS "Authenticated users can read updates" ON portal_updates;
DROP POLICY IF EXISTS "Authenticated users can create updates" ON portal_updates;
DROP POLICY IF EXISTS "Authors can edit own updates" ON portal_updates;
DROP POLICY IF EXISTS "Authenticated users can read team members" ON portal_team_members;
DROP POLICY IF EXISTS "Admin/PM can manage team members" ON portal_team_members;
DROP POLICY IF EXISTS "Authenticated users can read timeline" ON portal_timeline_events;
DROP POLICY IF EXISTS "Admin/PM can create timeline events" ON portal_timeline_events;

-- ============================================================================
-- PORTAL_USERS
-- All authenticated users can read all profiles.
-- Users can only update their own profile.
-- ============================================================================

CREATE POLICY "portal_users_select"
  ON portal_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "portal_users_update_own"
  ON portal_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PORTAL_PROJECTS
-- All authenticated users can read.
-- Admin and project_manager can insert/update.
-- ============================================================================

CREATE POLICY "portal_projects_select"
  ON portal_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "portal_projects_insert"
  ON portal_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager')
    )
  );

CREATE POLICY "portal_projects_update"
  ON portal_projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager')
    )
  );

-- ============================================================================
-- PORTAL_TASKS
-- All authenticated users can read.
-- Admin, project_manager, and team_member can insert/update.
-- ============================================================================

CREATE POLICY "portal_tasks_select"
  ON portal_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "portal_tasks_insert"
  ON portal_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager', 'team_member')
    )
  );

CREATE POLICY "portal_tasks_update"
  ON portal_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager', 'team_member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager', 'team_member')
    )
  );

-- ============================================================================
-- PORTAL_UPDATES
-- All authenticated users can read.
-- Admin, project_manager, and team_member can insert (must be own author_id).
-- Only the author can update their own update.
-- ============================================================================

CREATE POLICY "portal_updates_select"
  ON portal_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "portal_updates_insert"
  ON portal_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role IN ('admin', 'project_manager', 'team_member')
    )
  );

CREATE POLICY "portal_updates_update_own"
  ON portal_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- ============================================================================
-- PORTAL_TEAM_MEMBERS
-- All authenticated users can read.
-- Only admin can insert/update/delete.
-- ============================================================================

CREATE POLICY "portal_team_members_select"
  ON portal_team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "portal_team_members_insert"
  ON portal_team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "portal_team_members_update"
  ON portal_team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "portal_team_members_delete"
  ON portal_team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================================
-- PORTAL_TIMELINE_EVENTS
-- All authenticated users can read.
-- No direct user inserts — system (service role) only.
-- ============================================================================

CREATE POLICY "portal_timeline_events_select"
  ON portal_timeline_events FOR SELECT
  TO authenticated
  USING (true);
