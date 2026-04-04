-- =====================================================
-- 010: Ops Overhaul - Contractors, Assignments, Time Tracking
-- =====================================================

-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CONTRACTORS / TEAM MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  hourly_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  timezone TEXT,
  country TEXT,
  portfolio_url TEXT,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable', 'on_leave')),
  capacity_hours_weekly INTEGER DEFAULT 40,
  notes TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PROJECT ASSIGNMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  role TEXT,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contractor_id)
);

-- =====================================================
-- 3. TIME LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES project_assignments(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description TEXT,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ALTER PROJECTS TABLE - Add financial columns
-- =====================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS margin_percent DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- =====================================================
-- 5. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);
CREATE INDEX IF NOT EXISTS idx_contractors_availability ON contractors(availability);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_contractor ON project_assignments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_status ON project_assignments(status);

CREATE INDEX IF NOT EXISTS idx_time_logs_project ON time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_contractor ON time_logs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(date);
CREATE INDEX IF NOT EXISTS idx_time_logs_assignment ON time_logs(assignment_id);

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies
CREATE POLICY "Service role full access on contractors"
  ON contractors FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on project_assignments"
  ON project_assignments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on time_logs"
  ON time_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 7. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_contractors_updated_at') THEN
    CREATE TRIGGER set_contractors_updated_at
      BEFORE UPDATE ON contractors
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
