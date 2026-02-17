-- ============================================
-- DRIVER PROFILE COMPLETE SETUP - SUPABASE SQL
-- ============================================
-- Run this ENTIRE script in your Supabase SQL Editor
-- This will create all tables needed for the driver profile page
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: ENSURE USERS TABLE EXISTS WITH ALL FIELDS
-- ============================================

-- Check if users table exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE TABLE users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      phone_number TEXT,
      user_type TEXT CHECK (user_type IN ('customer', 'driver', 'admin')),
      avatar_url TEXT,
      bio TEXT,
      rating DECIMAL(3,2) DEFAULT 5.0,
      total_reviews INTEGER DEFAULT 0,
      wallet_balance DECIMAL(10,2) DEFAULT 0,
      status TEXT CHECK (status IN ('active', 'suspended', 'pending_approval', 'verified')),
      language TEXT CHECK (language IN ('en', 'ar')) DEFAULT 'en',
      location TEXT,
      is_available BOOLEAN DEFAULT false,
      verification_status TEXT DEFAULT 'not_submitted' CHECK (verification_status IN (
        'not_submitted',
        'pending_approval',
        'verified',
        'rejected'
      )),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Created users table';
  ELSE
    -- Add missing columns if they don't exist
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted';
    RAISE NOTICE 'Updated users table with missing columns';
  END IF;
END $$;

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- PART 2: CREATE DRIVER_VERIFICATIONS TABLE
-- ============================================

DROP TABLE IF EXISTS driver_verifications CASCADE;

CREATE TABLE driver_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- License verification
  license_number TEXT,
  license_expiry DATE,
  license_verified BOOLEAN DEFAULT false,
  license_verified_at TIMESTAMP WITH TIME ZONE,
  license_document_url TEXT,
  
  -- Vehicle verification
  vehicle_verified BOOLEAN DEFAULT false,
  vehicle_verified_at TIMESTAMP WITH TIME ZONE,
  vehicle_registration_url TEXT,
  
  -- Insurance verification
  insurance_verified BOOLEAN DEFAULT false,
  insurance_verified_at TIMESTAMP WITH TIME ZONE,
  insurance_document_url TEXT,
  insurance_policy_number TEXT,
  insurance_expiry DATE,
  
  -- Background check
  background_check_verified BOOLEAN DEFAULT false,
  background_check_verified_at TIMESTAMP WITH TIME ZONE,
  background_check_reference TEXT,
  
  -- Overall status
  overall_status TEXT DEFAULT 'incomplete' CHECK (overall_status IN (
    'incomplete',
    'pending_review',
    'verified',
    'rejected'
  )),
  
  -- Metadata
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_driver_verifications_driver_id ON driver_verifications(driver_id);
CREATE INDEX idx_driver_verifications_overall_status ON driver_verifications(overall_status);

-- ============================================
-- PART 3: CREATE DRIVER_STATS TABLE
-- ============================================

DROP TABLE IF EXISTS driver_stats CASCADE;

CREATE TABLE driver_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Trip statistics
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  cancelled_rides INTEGER DEFAULT 0,
  
  -- Time-based stats
  years_active NUMERIC(4,2) DEFAULT 0,
  hours_online NUMERIC(10,2) DEFAULT 0,
  
  -- Rating stats
  average_rating NUMERIC(3,2) DEFAULT 5.0,
  total_ratings INTEGER DEFAULT 0,
  
  -- Earnings (can be expanded)
  total_earnings DECIMAL(12,2) DEFAULT 0,
  pending_earnings DECIMAL(12,2) DEFAULT 0,
  
  -- Gamification
  points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Badges (JSON array of badge IDs)
  badges JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_driver_stats_driver_id ON driver_stats(driver_id);
CREATE INDEX idx_driver_stats_rank ON driver_stats(rank);
CREATE INDEX idx_driver_stats_tier ON driver_stats(tier);

-- ============================================
-- PART 4: CREATE VEHICLES TABLE
-- ============================================

DROP TABLE IF EXISTS vehicles CASCADE;

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vehicle details
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  
  -- Service classification
  service_class TEXT DEFAULT 'Comfort' CHECK (service_class IN (
    'Economy',
    'Comfort',
    'Premium',
    'Van',
    'Green'
  )),
  
  -- Vehicle identification
  vin TEXT,
  registration_number TEXT,
  
  -- Status
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending',
    'verified',
    'rejected'
  )),
  
  -- Documents
  registration_document_url TEXT,
  insurance_document_url TEXT,
  inspection_document_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_is_primary ON vehicles(is_primary);
CREATE INDEX idx_vehicles_verification_status ON vehicles(verification_status);

-- ============================================
-- PART 5: CREATE DRIVER_DOCUMENTS TABLE (Enhanced)
-- ============================================

DROP TABLE IF EXISTS driver_documents CASCADE;

CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'license_front',
    'license_back',
    'identity_front',
    'identity_back',
    'vehicle_registration',
    'insurance',
    'vehicle_photo',
    'other'
  )),
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, document_type)
);

-- Create indexes
CREATE INDEX idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON driver_documents(status);
CREATE INDEX idx_driver_documents_document_type ON driver_documents(document_type);
CREATE INDEX idx_driver_documents_created_at ON driver_documents(created_at);

-- ============================================
-- PART 6: RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Drivers can view their own verification" ON driver_verifications;
DROP POLICY IF EXISTS "Drivers can update their own verification" ON driver_verifications;
DROP POLICY IF EXISTS "Drivers can view their own stats" ON driver_stats;
DROP POLICY IF EXISTS "Drivers can view their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Drivers can manage their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Drivers can view their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can insert their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Drivers can update their own documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can view all driver verifications" ON driver_verifications;
DROP POLICY IF EXISTS "Admins can update all driver verifications" ON driver_verifications;
DROP POLICY IF EXISTS "Admins can view all documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON driver_documents;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile (for initial creation)
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Driver verifications policies
CREATE POLICY "Drivers can view their own verification"
  ON driver_verifications FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own verification"
  ON driver_verifications FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own verification"
  ON driver_verifications FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Driver stats policies
CREATE POLICY "Drivers can view their own stats"
  ON driver_stats FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own stats"
  ON driver_stats FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own stats"
  ON driver_stats FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Vehicles policies
CREATE POLICY "Drivers can view their own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can manage their own vehicles"
  ON vehicles FOR ALL
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Driver documents policies
CREATE POLICY "Drivers can view their own documents"
  ON driver_documents FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own documents"
  ON driver_documents FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own documents"
  ON driver_documents FOR UPDATE
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Admin policies for driver_verifications
CREATE POLICY "Admins can view all driver verifications"
  ON driver_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all driver verifications"
  ON driver_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Admin policies for driver_documents
CREATE POLICY "Admins can view all documents"
  ON driver_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all documents"
  ON driver_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Admin policies for driver_stats
CREATE POLICY "Admins can view all driver stats"
  ON driver_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all driver stats"
  ON driver_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Admin policies for vehicles
CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- ============================================
-- PART 7: CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_verifications_updated_at ON driver_verifications;
CREATE TRIGGER update_driver_verifications_updated_at
BEFORE UPDATE ON driver_verifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_stats_updated_at ON driver_stats;
CREATE TRIGGER update_driver_stats_updated_at
BEFORE UPDATE ON driver_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_documents_updated_at ON driver_documents;
CREATE TRIGGER update_driver_documents_updated_at
BEFORE UPDATE ON driver_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create default driver stats when a new driver is created
CREATE OR REPLACE FUNCTION create_driver_stats_on_user_create()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'driver' THEN
    INSERT INTO driver_stats (driver_id, years_active)
    VALUES (NEW.id, 0)
    ON CONFLICT (driver_id) DO NOTHING;
    
    INSERT INTO driver_verifications (driver_id)
    VALUES (NEW.id)
    ON CONFLICT (driver_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create driver stats when user becomes a driver
DROP TRIGGER IF EXISTS create_driver_stats_trigger ON users;
CREATE TRIGGER create_driver_stats_trigger
AFTER INSERT OR UPDATE OF user_type ON users
FOR EACH ROW
WHEN (NEW.user_type = 'driver')
EXECUTE FUNCTION create_driver_stats_on_user_create();

-- Function to update driver verification status based on documents
CREATE OR REPLACE FUNCTION update_driver_verification_from_documents()
RETURNS TRIGGER AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_any_rejected BOOLEAN;
  v_any_pending BOOLEAN;
BEGIN
  -- Check if all required documents are approved
  SELECT 
    COUNT(*) FILTER (WHERE status = 'approved') = 4,
    COUNT(*) FILTER (WHERE status = 'rejected') > 0,
    COUNT(*) FILTER (WHERE status = 'pending') > 0
  INTO v_all_approved, v_any_rejected, v_any_pending
  FROM (
    SELECT DISTINCT ON (document_type) document_type, status
    FROM driver_documents
    WHERE driver_id = NEW.driver_id
    AND document_type IN ('license_front', 'identity_front', 'vehicle_registration', 'insurance')
  ) sub;
  
  -- Update driver_verifications table
  IF v_all_approved THEN
    UPDATE driver_verifications
    SET overall_status = 'verified',
        license_verified = COALESCE(license_verified, (
          SELECT status = 'approved' FROM driver_documents 
          WHERE driver_id = NEW.driver_id AND document_type IN ('license_front', 'license_back')
          ORDER BY created_at DESC LIMIT 1
        )),
        vehicle_verified = COALESCE(vehicle_verified, (
          SELECT status = 'approved' FROM driver_documents 
          WHERE driver_id = NEW.driver_id AND document_type = 'vehicle_registration'
          ORDER BY created_at DESC LIMIT 1
        )),
        insurance_verified = COALESCE(insurance_verified, (
          SELECT status = 'approved' FROM driver_documents 
          WHERE driver_id = NEW.driver_id AND document_type = 'insurance'
          ORDER BY created_at DESC LIMIT 1
        ))
    WHERE driver_id = NEW.driver_id;
    
    UPDATE users
    SET verification_status = 'verified',
        status = 'active'
    WHERE id = NEW.driver_id;
    
  ELSIF v_any_rejected THEN
    UPDATE driver_verifications
    SET overall_status = 'rejected'
    WHERE driver_id = NEW.driver_id;
    
    UPDATE users
    SET verification_status = 'rejected'
    WHERE id = NEW.driver_id;
    
  ELSIF v_any_pending THEN
    UPDATE driver_verifications
    SET overall_status = 'pending_review'
    WHERE driver_id = NEW.driver_id;
    
    UPDATE users
    SET verification_status = 'pending_approval'
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update verification status when document changes
DROP TRIGGER IF EXISTS update_verification_from_documents_trigger ON driver_documents;
CREATE TRIGGER update_verification_from_documents_trigger
AFTER INSERT OR UPDATE OF status ON driver_documents
FOR EACH ROW
EXECUTE FUNCTION update_driver_verification_from_documents();

-- Function to calculate years active for a driver
CREATE OR REPLACE FUNCTION calculate_driver_years_active(p_driver_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_years NUMERIC;
BEGIN
  SELECT EXTRACT(YEAR FROM AGE(NOW(), created_at))::NUMERIC
  INTO v_years
  FROM users
  WHERE id = p_driver_id;
  
  RETURN COALESCE(v_years, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PART 8: CREATE HELPER FUNCTIONS FOR API
-- ============================================

-- Function to get complete driver profile
CREATE OR REPLACE FUNCTION get_driver_profile(p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user JSONB;
  v_verification JSONB;
  v_stats JSONB;
  v_vehicles JSONB;
  v_result JSONB;
BEGIN
  -- Get user data
  SELECT jsonb_build_object(
    'id', id,
    'full_name', full_name,
    'email', email,
    'phone', phone_number,
    'avatar_url', avatar_url,
    'location', location,
    'rating', rating,
    'is_available', is_available,
    'verification_status', verification_status,
    'status', status,
    'user_type', user_type,
    'created_at', created_at
  ) INTO v_user
  FROM users
  WHERE id = p_driver_id;
  
  -- Get verification data
  SELECT jsonb_build_object(
    'license_verified', COALESCE(license_verified, false),
    'vehicle_verified', COALESCE(vehicle_verified, false),
    'insurance_verified', COALESCE(insurance_verified, false),
    'background_check_verified', COALESCE(background_check_verified, false),
    'overall_status', COALESCE(overall_status, 'incomplete'),
    'rejection_reason', rejection_reason
  ) INTO v_verification
  FROM driver_verifications
  WHERE driver_id = p_driver_id;
  
  -- Get stats data
  SELECT jsonb_build_object(
    'total_rides', COALESCE(total_rides, 0),
    'completed_rides', COALESCE(completed_rides, 0),
    'years_active', COALESCE(years_active, 0),
    'points', COALESCE(points, 0),
    'rank', COALESCE(rank, 0),
    'tier', COALESCE(tier, 'bronze'),
    'total_earnings', COALESCE(total_earnings, 0),
    'average_rating', COALESCE(average_rating, 5.0)
  ) INTO v_stats
  FROM driver_stats
  WHERE driver_id = p_driver_id;
  
  -- Get vehicles
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'make', make,
        'model', model,
        'year', year,
        'color', color,
        'license_plate', license_plate,
        'service_class', service_class,
        'is_primary', is_primary,
        'verification_status', verification_status
      )
    ),
    '[]'::jsonb
  ) INTO v_vehicles
  FROM vehicles
  WHERE driver_id = p_driver_id;
  
  -- Build result
  SELECT jsonb_build_object(
    'user', COALESCE(v_user, '{}'::jsonb),
    'verification', COALESCE(v_verification, '{}'::jsonb),
    'stats', COALESCE(v_stats, '{}'::jsonb),
    'vehicles', COALESCE(v_vehicles, '[]'::jsonb)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to update driver profile
CREATE OR REPLACE FUNCTION update_driver_profile(
  p_driver_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_location TEXT,
  p_bio TEXT,
  p_is_available BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET 
    full_name = COALESCE(NULLIF(p_full_name, ''), full_name),
    phone_number = COALESCE(NULLIF(p_phone, ''), phone_number),
    location = COALESCE(NULLIF(p_location, ''), location),
    bio = COALESCE(NULLIF(p_bio, ''), bio),
    is_available = COALESCE(p_is_available, is_available),
    updated_at = NOW()
  WHERE id = p_driver_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add/update vehicle
CREATE OR REPLACE FUNCTION upsert_driver_vehicle(
  p_driver_id UUID,
  p_vehicle_id UUID,
  p_make TEXT,
  p_model TEXT,
  p_year INTEGER,
  p_color TEXT,
  p_license_plate TEXT,
  p_service_class TEXT,
  p_is_primary BOOLEAN
)
RETURNS UUID AS $$
DECLARE
  v_vehicle_id UUID;
BEGIN
  -- If updating existing vehicle
  IF p_vehicle_id IS NOT NULL THEN
    UPDATE vehicles
    SET 
      make = p_make,
      model = p_model,
      year = p_year,
      color = p_color,
      license_plate = p_license_plate,
      service_class = p_service_class,
      updated_at = NOW()
    WHERE id = p_vehicle_id AND driver_id = p_driver_id
    RETURNING id INTO v_vehicle_id;
  ELSE
    -- If setting as primary, unset other primary vehicles
    IF p_is_primary THEN
      UPDATE vehicles
      SET is_primary = false
      WHERE driver_id = p_driver_id;
    END IF;
    
    -- Insert new vehicle
    INSERT INTO vehicles (
      driver_id, make, model, year, color, 
      license_plate, service_class, is_primary
    ) VALUES (
      p_driver_id, p_make, p_model, p_year, p_color,
      p_license_plate, p_service_class, p_is_primary
    )
    RETURNING id INTO v_vehicle_id;
  END IF;
  
  RETURN v_vehicle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 9: GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON driver_verifications TO authenticated;
GRANT ALL ON driver_stats TO authenticated;
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON driver_documents TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_driver_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_driver_profile TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_driver_vehicle TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_driver_years_active TO authenticated;

-- ============================================
-- PART 10: VERIFICATION QUERIES
-- ============================================

-- Show table structures
SELECT '===== USERS TABLE =====' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT '===== DRIVER_VERIFICATIONS TABLE =====' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'driver_verifications'
ORDER BY ordinal_position;

SELECT '===== DRIVER_STATS TABLE =====' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'driver_stats'
ORDER BY ordinal_position;

SELECT '===== VEHICLES TABLE =====' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

SELECT '===== DRIVER_DOCUMENTS TABLE =====' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'driver_documents'
ORDER BY ordinal_position;

-- Show all RLS policies
SELECT '===== RLS POLICIES =====' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- The driver profile system is now set up with:
--
-- 1. users table - Extended with verification fields
-- 2. driver_verifications table - Track verification status
-- 3. driver_stats table - Track driver statistics and gamification
-- 4. vehicles table - Manage driver vehicles
-- 5. driver_documents table - Document upload and verification
-- 6. RLS policies - Secure data access
-- 7. Triggers - Automatic updates
-- 8. Helper functions - Easy API integration
-- ============================================
