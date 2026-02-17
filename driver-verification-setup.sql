-- ============================================
-- DRIVER VERIFICATION SYSTEM - SUPABASE SQL
-- ============================================
-- Run this script in your Supabase SQL Editor to set up 
-- the driver verification system with proper tables,
-- storage buckets, and RLS policies.

-- ============================================
-- 1. UPDATE driver_documents TABLE
-- ============================================

-- Drop existing table if it exists to recreate with new schema
DROP TABLE IF EXISTS driver_documents CASCADE;

-- Create enhanced driver_documents table
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'identity_front', 
    'identity_back', 
    'vehicle_registration', 
    'insurance'
  )),
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, document_type)
);

-- Create indexes for better query performance
CREATE INDEX idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON driver_documents(status);
CREATE INDEX idx_driver_documents_document_type ON driver_documents(document_type);
CREATE INDEX idx_driver_documents_created_at ON driver_documents(created_at);

-- ============================================
-- 2. ADD VERIFICATION FIELDS TO users TABLE
-- ============================================

-- Add verification status columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted' CHECK (verification_status IN (
  'not_submitted',
  'pending_approval',
  'verified',
  'rejected'
));

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ============================================
-- 3. CREATE STORAGE BUCKET FOR DOCUMENTS
-- ============================================

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver-documents',
  'driver-documents',
  false,
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

-- ============================================
-- 4. STORAGE RLS POLICIES
-- ============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow admins to view all documents
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Policy: Allow users to update their own documents
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 5. DRIVER DOCUMENTS RLS POLICIES
-- ============================================

-- Enable RLS on driver_documents
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can view their own documents
DROP POLICY IF EXISTS "Drivers can view their own documents" ON driver_documents;
CREATE POLICY "Drivers can view their own documents"
ON driver_documents FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

-- Policy: Drivers can insert their own documents
DROP POLICY IF EXISTS "Drivers can insert their own documents" ON driver_documents;
CREATE POLICY "Drivers can insert their own documents"
ON driver_documents FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- Policy: Drivers can update their own documents (before submission)
DROP POLICY IF EXISTS "Drivers can update their own documents" ON driver_documents;
CREATE POLICY "Drivers can update their own documents"
ON driver_documents FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Policy: Admins can view all documents
DROP POLICY IF EXISTS "Admins can view all documents" ON driver_documents;
CREATE POLICY "Admins can view all documents"
ON driver_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Policy: Admins can update document status (approve/reject)
DROP POLICY IF EXISTS "Admins can update document status" ON driver_documents;
CREATE POLICY "Admins can update document status"
ON driver_documents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- ============================================
-- 6. CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update user verification status based on documents
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required documents are approved
  IF EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.document_type = 'identity_front'
    AND dd.status = 'approved'
  ) AND EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.document_type = 'identity_back'
    AND dd.status = 'approved'
  ) AND EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.document_type = 'vehicle_registration'
    AND dd.status = 'approved'
  ) AND EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.document_type = 'insurance'
    AND dd.status = 'approved'
  ) THEN
    -- All documents approved, update user status
    UPDATE users 
    SET verification_status = 'verified',
        status = 'active'
    WHERE id = NEW.driver_id;
  ELSIF EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.status = 'rejected'
  ) THEN
    -- At least one document rejected
    UPDATE users 
    SET verification_status = 'rejected'
    WHERE id = NEW.driver_id;
  ELSIF EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.status = 'pending'
  ) THEN
    -- At least one document pending
    UPDATE users 
    SET verification_status = 'pending_approval'
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user verification status when document status changes
DROP TRIGGER IF EXISTS update_verification_status_trigger ON driver_documents;
CREATE TRIGGER update_verification_status_trigger
AFTER INSERT OR UPDATE OF status ON driver_documents
FOR EACH ROW
EXECUTE FUNCTION update_user_verification_status();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for driver_documents updated_at
DROP TRIGGER IF EXISTS update_driver_documents_updated_at ON driver_documents;
CREATE TRIGGER update_driver_documents_updated_at
BEFORE UPDATE ON driver_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. CREATE ADMIN FUNCTIONS
-- ============================================

-- Function for admins to approve/reject documents
CREATE OR REPLACE FUNCTION review_driver_document(
  p_document_id UUID,
  p_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_driver_id UUID;
BEGIN
  -- Validate status
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be "approved" or "rejected"';
  END IF;
  
  -- Get driver_id from document
  SELECT driver_id INTO v_driver_id
  FROM driver_documents
  WHERE id = p_document_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  
  -- Update document
  UPDATE driver_documents
  SET status = p_status,
      rejection_reason = p_rejection_reason,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_document_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get driver verification progress
CREATE OR REPLACE FUNCTION get_driver_verification_progress(p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total INTEGER := 4;
  v_approved INTEGER;
  v_pending INTEGER;
  v_rejected INTEGER;
BEGIN
  -- Count document statuses
  SELECT 
    COUNT(*) FILTER (WHERE status = 'approved')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER
  INTO v_approved, v_pending, v_rejected
  FROM (
    SELECT DISTINCT ON (document_type) status
    FROM driver_documents
    WHERE driver_id = p_driver_id
  ) sub;
  
  -- Build result JSON
  SELECT jsonb_build_object(
    'total_documents', v_total,
    'approved', COALESCE(v_approved, 0),
    'pending', COALESCE(v_pending, 0),
    'rejected', COALESCE(v_rejected, 0),
    'progress_percentage', ROUND((COALESCE(v_approved, 0)::NUMERIC / v_total::NUMERIC) * 100, 0)::INTEGER,
    'can_submit', COALESCE(v_approved, 0) = v_total,
    'identity_status', (
      SELECT status FROM driver_documents 
      WHERE driver_id = p_driver_id AND document_type = 'identity_front'
      ORDER BY created_at DESC LIMIT 1
    ),
    'vehicle_status', (
      SELECT status FROM driver_documents 
      WHERE driver_id = p_driver_id AND document_type = 'vehicle_registration'
      ORDER BY created_at DESC LIMIT 1
    ),
    'insurance_status', (
      SELECT status FROM driver_documents 
      WHERE driver_id = p_driver_id AND document_type = 'insurance'
      ORDER BY created_at DESC LIMIT 1
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SEED SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Uncomment below to insert sample verification data for testing
-- Make sure to replace 'YOUR-USER-UUID-HERE' with an actual driver user ID

/*
INSERT INTO driver_documents (driver_id, document_type, document_url, status, metadata)
VALUES 
  ('YOUR-USER-UUID-HERE', 'identity_front', 'https://example.com/id-front.jpg', 'pending', 
   '{"document_type": "Driver''s License", "license_number": "D1234567"}'),
  ('YOUR-USER-UUID-HERE', 'identity_back', 'https://example.com/id-back.jpg', 'pending', 
   '{"document_type": "Driver''s License", "license_number": "D1234567"}')
ON CONFLICT (driver_id, document_type) DO NOTHING;
*/

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON driver_documents TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION review_driver_document TO authenticated;
GRANT EXECUTE ON FUNCTION get_driver_verification_progress TO authenticated;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- The driver verification system is now set up with:
-- 
-- 1. Enhanced driver_documents table with metadata support
-- 2. Storage bucket for secure document uploads
-- 3. RLS policies for data security
-- 4. Automatic verification status updates
-- 5. Admin review functions
-- 6. Progress tracking function
--
-- Next steps:
-- 1. Create an admin user in Supabase Auth
-- 2. Set the user_type to 'admin' in the users table
-- 3. Test the verification flow from the driver dashboard
-- ============================================
