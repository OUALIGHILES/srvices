-- ============================================
-- COMPLETE DRIVER VERIFICATION SYSTEM
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. FIRST: Create the storage bucket
-- ============================================

-- Insert the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver-documents',
  'driver-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Create driver_documents table
-- ============================================

CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_document_type ON driver_documents(document_type);

-- ============================================
-- 3. Add verification columns to users table
-- ============================================

DO $$ 
BEGIN
  -- Add verification_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'users' 
                 AND column_name = 'verification_status') THEN
    ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'not_submitted';
  END IF;

  -- Add is_available column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'users' 
                 AND column_name = 'is_available') THEN
    ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ============================================
-- 4. Storage RLS Policies
-- ============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow admins to view all documents
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
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 5. Driver Documents RLS Policies
-- ============================================

-- Enable RLS on driver_documents
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Drivers can view their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can insert their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can update their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can update document status" ON driver_documents;

-- Policy: Drivers can view their own documents
CREATE POLICY "Drivers can view their own documents"
ON driver_documents FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

-- Policy: Drivers can insert their own documents
CREATE POLICY "Drivers can insert their own documents"
ON driver_documents FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- Policy: Drivers can update their own documents
CREATE POLICY "Drivers can update their own documents"
ON driver_documents FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Policy: Admins can view all documents
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

-- Policy: Admins can update document status
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
-- 6. Functions and Triggers
-- ============================================

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

-- Function to update user verification status
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
    UPDATE users 
    SET verification_status = 'verified',
        status = 'active'
    WHERE id = NEW.driver_id;
  ELSIF EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.status = 'rejected'
  ) THEN
    UPDATE users 
    SET verification_status = 'rejected'
    WHERE id = NEW.driver_id;
  ELSIF EXISTS (
    SELECT 1 FROM driver_documents dd
    WHERE dd.driver_id = NEW.driver_id
    AND dd.status = 'pending'
  ) THEN
    UPDATE users 
    SET verification_status = 'pending_approval'
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user verification status
DROP TRIGGER IF EXISTS update_verification_status_trigger ON driver_documents;
CREATE TRIGGER update_verification_status_trigger
AFTER INSERT OR UPDATE OF status ON driver_documents
FOR EACH ROW
EXECUTE FUNCTION update_user_verification_status();

-- ============================================
-- 7. Admin Review Function
-- ============================================

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

-- ============================================
-- 8. Grant Permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON driver_documents TO authenticated;
GRANT EXECUTE ON FUNCTION review_driver_document TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_verification_status TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- The verification system is now ready with:
-- ✓ Storage bucket for documents
-- ✓ driver_documents table
-- ✓ RLS policies for security
-- ✓ Automatic status updates
-- ✓ Admin review function
-- ============================================
