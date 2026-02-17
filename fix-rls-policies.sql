-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop all problematic policies first
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can view their own offers" ON offers;
DROP POLICY IF EXISTS "Customers can view offers on their bookings" ON offers;
DROP POLICY IF EXISTS "Drivers can create their own offers" ON offers;

-- ============================================
-- SIMPLER RLS POLICIES FOR BOOKINGS
-- ============================================

-- Allow authenticated users to view all bookings (drivers need to see available bookings)
CREATE POLICY "Enable read access for all authenticated users"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

-- Allow customers to create their own bookings
CREATE POLICY "Enable insert for authenticated users"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- Allow customers to update their own bookings
CREATE POLICY "Enable update for customers on their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Allow system to update bookings (for driver acceptance)
CREATE POLICY "Enable update for driver assignment"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SIMPLER RLS POLICIES FOR OFFERS
-- ============================================

-- Allow authenticated users to view all offers
CREATE POLICY "Enable read access for all offers"
  ON offers FOR SELECT
  TO authenticated
  USING (true);

-- Allow drivers to create their own offers
CREATE POLICY "Enable insert for drivers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = driver_id);

-- Allow drivers to update their own offers
CREATE POLICY "Enable update for drivers on their own offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

-- ============================================
-- RLS POLICIES FOR USERS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow authenticated users to view all users (needed for displaying customer/driver info)
CREATE POLICY "Enable read access for all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update for own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all RLS policies on bookings
SELECT 'bookings RLS policies:' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'bookings';

-- Show all RLS policies on offers
SELECT 'offers RLS policies:' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'offers';

-- Show all RLS policies on users
SELECT 'users RLS policies:' as info;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'users';
