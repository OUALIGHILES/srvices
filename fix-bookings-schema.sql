-- ============================================
-- COMPLETE FIX FOR BOOKINGS TABLE
-- Run this in Supabase SQL Editor to fix the 400 Bad Request error
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Drop existing RLS policies temporarily
-- ============================================

DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- ============================================
-- STEP 2: Add missing columns to bookings table
-- ============================================

-- Add driver_id column to track which driver accepted the booking
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'driver_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Add accepted_at column to track when the booking was accepted
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add offer_id column to track which offer was accepted
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'offer_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN offer_id UUID REFERENCES offers(id);
  END IF;
END $$;

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_accepted_at ON bookings(accepted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_offer_id ON bookings(offer_id);

-- ============================================
-- STEP 4: Recreate RLS policies with proper permissions
-- ============================================

-- Allow customers to view their own bookings
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

-- Allow customers to create bookings
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Allow customers to update their own bookings
CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id);

-- Allow drivers to update bookings they have offers on (for accepting offers)
CREATE POLICY "Drivers can update assigned bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
  );

-- Allow drivers to view bookings they have offers on
CREATE POLICY "Drivers can view assigned bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
  );

-- ============================================
-- STEP 5: Add column comments for documentation
-- ============================================

COMMENT ON COLUMN bookings.driver_id IS 'The driver who accepted this booking';
COMMENT ON COLUMN bookings.accepted_at IS 'Timestamp when the booking was accepted';
COMMENT ON COLUMN bookings.offer_id IS 'The offer that was accepted for this booking';

-- ============================================
-- STEP 6: Verify the changes
-- ============================================

-- Show the bookings table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Show all indexes on bookings table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'bookings';

-- Show all RLS policies on bookings table
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';
