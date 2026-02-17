-- ============================================
-- COMPLETE SUPABASE SCHEMA FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- This will fix the 400 Bad Request error when accepting bookings
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: FIX USERS TABLE (if needed)
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- ============================================
-- PART 2: FIX BOOKINGS TABLE
-- ============================================

-- Add driver_id column (CRITICAL FIX)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'driver_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_id UUID REFERENCES users(id);
    RAISE NOTICE 'Added driver_id column to bookings table';
  END IF;
END $$;

-- Add accepted_at column (CRITICAL FIX)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added accepted_at column to bookings table';
  END IF;
END $$;

-- Add offer_id column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'offer_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN offer_id UUID REFERENCES offers(id);
    RAISE NOTICE 'Added offer_id column to bookings table';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_accepted_at ON bookings(accepted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_offer_id ON bookings(offer_id);

-- ============================================
-- PART 3: FIX OFFERS TABLE (if needed)
-- ============================================

-- Check if offers table exists, create if not
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    CREATE TABLE offers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      offered_price DECIMAL(10,2) NOT NULL,
      status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
      distance_km DECIMAL(5,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_offers_booking_id ON offers(booking_id);
    CREATE INDEX idx_offers_driver_id ON offers(driver_id);
    
    RAISE NOTICE 'Created offers table';
  END IF;
END $$;

-- ============================================
-- PART 4: FIX RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Drivers can view their own offers" ON offers;
DROP POLICY IF EXISTS "Customers can view offers on their bookings" ON offers;

-- Create new policies for bookings
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = customer_id 
    OR EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Drivers can update assigned bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view assigned bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
  );

-- Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policies for offers
CREATE POLICY "Drivers can view their own offers"
  ON offers FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Customers can view offers on their bookings"
  ON offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = offers.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create their own offers"
  ON offers FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- ============================================
-- PART 5: VERIFICATION
-- ============================================

-- Show bookings table structure
SELECT 'bookings' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Show offers table structure
SELECT 'offers' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'offers'
ORDER BY ordinal_position;

-- Show users table structure
SELECT 'users' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Show all RLS policies on bookings
SELECT 'bookings RLS policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bookings';

-- Show all RLS policies on offers
SELECT 'offers RLS policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'offers';
