-- =============================================================================
-- Supabase Storage — buckets and RLS policies
-- =============================================================================
-- Run after the main schema. Creates the `kyc-documents` bucket used by
-- the pro KYC submission flow (lib/kyc.ts uploadKYCDocument).
--
-- Storage buckets must be private and only accessible to:
--   - The owning user (their own files under {user_id}/...)
--   - Admin role (full access for review)
-- =============================================================================

-- 1. Create bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760, -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS — users can read/write their own folder, admins can read all
DROP POLICY IF EXISTS "Users can upload own KYC docs" ON storage.objects;
CREATE POLICY "Users can upload own KYC docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can read own KYC docs" ON storage.objects;
CREATE POLICY "Users can read own KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admins can read all KYC docs" ON storage.objects;
CREATE POLICY "Admins can read all KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
