-- ============================================================
-- 012 · Tighten job-applications storage policy
-- ============================================================
-- The original public INSERT policy let any browser upload directly to the
-- bucket using only the anon key. The application now issues short-lived
-- signed upload URLs from the server (`/api/careers/upload-url`), so public
-- INSERT is no longer needed. Signed upload URLs are authorized by the
-- token they carry and bypass RLS, so this policy can be removed safely.

DROP POLICY IF EXISTS "public_upload_job_applications" ON storage.objects;

-- Public read remains in place so the admin notification email and the
-- review dashboard can link directly to uploaded resumes / cover letters.
