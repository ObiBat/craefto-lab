-- ============================================================
-- 011 · Job Applications System
-- ============================================================

-- Table: job_applications
CREATE TABLE IF NOT EXISTS job_applications (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  role_slug       text        NOT NULL,
  role_title      text        NOT NULL,
  full_name       text        NOT NULL,
  email           text        NOT NULL,
  phone           text,
  location        text,
  portfolio_url   text,
  linkedin_url    text,
  github_url      text,
  resume_url      text,
  resume_filename text,
  cover_letter_url      text,
  cover_letter_filename text,
  answers         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  status          text        NOT NULL DEFAULT 'new',
  rating          smallint    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  admin_notes     text,
  source          text        DEFAULT 'craefto.com',
  ip_address      text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_status CHECK (
    status IN ('new','reviewing','shortlisted','interview','offer','rejected','hired','archived')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_role_slug   ON job_applications (role_slug);
CREATE INDEX IF NOT EXISTS idx_job_applications_status      ON job_applications (status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at  ON job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_email       ON job_applications (email);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON job_applications;
CREATE TRIGGER trg_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_updated_at();

-- RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_all_job_applications"
  ON job_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public cannot select
-- (no public policy = denied by default with RLS enabled)

-- ============================================================
-- Storage bucket: job-applications
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-applications',
  'job-applications',
  true,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can upload (public form)
CREATE POLICY "public_upload_job_applications"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'job-applications');

-- Public read
CREATE POLICY "public_read_job_applications"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'job-applications');
