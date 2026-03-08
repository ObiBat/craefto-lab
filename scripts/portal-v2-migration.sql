-- Portal v2 Migration: Add new columns to portal_projects
-- Sprint 1 Foundation

ALTER TABLE portal_projects ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE portal_projects ADD COLUMN IF NOT EXISTS linear_project_id TEXT;
ALTER TABLE portal_projects ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE portal_projects ADD COLUMN IF NOT EXISTS next_milestone TEXT;
ALTER TABLE portal_projects ADD COLUMN IF NOT EXISTS next_milestone_date DATE;
