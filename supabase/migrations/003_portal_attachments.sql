-- ============================================================================
-- Portal Attachments — Sprint 3: Rich Content & Files
-- ============================================================================

-- Add attachments JSONB column to portal_updates
-- Stores array of {id, name, url, type, size} objects
ALTER TABLE portal_updates
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Create storage bucket for portal file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portal-attachments',
  'portal-attachments',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portal-attachments');

-- Storage policy: anyone can read (public bucket)
CREATE POLICY "Public read access for portal attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portal-attachments');

-- Storage policy: owners can delete their uploads
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portal-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
