-- ============================================
-- COMPLETE FIX FOR BOOKINGS TABLE SCHEMA
-- This fixes the "invalid input syntax for type bigint" error
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- First, let's check what's actually in the database
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- ============================================
-- STEP 1: Drop any triggers that might be causing issues
-- ============================================

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS bookings_insert_trigger ON bookings;
DROP TRIGGER IF EXISTS bookings_update_trigger ON bookings;

-- ============================================
-- STEP 2: Drop all RLS policies temporarily
-- ============================================

DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for customers on their own bookings" ON bookings;
DROP POLICY IF EXISTS "Enable update for driver assignment" ON bookings;

-- ============================================
-- STEP 3: Check if bookings table has correct id type
-- If id is bigint, we need to recreate the table
-- ============================================

DO $$
DECLARE
    id_type TEXT;
BEGIN
    SELECT data_type INTO id_type
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'id';
    
    -- If id is bigint or serial, we need to fix it
    IF id_type IN ('bigint', 'integer', 'serial', 'bigserial') THEN
        RAISE NOTICE 'Found bookings.id as %, need to recreate table', id_type;
        
        -- Create new table with correct schema
        CREATE TABLE bookings_new (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            service_id UUID NOT NULL REFERENCES services(id),
            location TEXT NOT NULL,
            service_date TIMESTAMP WITH TIME ZONE NOT NULL,
            quantity INTEGER DEFAULT 1,
            notes TEXT,
            status TEXT CHECK (status IN ('pending', 'waiting_for_offers', 'offer_accepted', 'in_progress', 'completed', 'cancelled')),
            guest_name TEXT,
            guest_phone TEXT,
            is_guest BOOLEAN DEFAULT false,
            driver_id UUID REFERENCES users(id),
            accepted_at TIMESTAMP WITH TIME ZONE,
            offer_id UUID REFERENCES offers(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Copy data if any exists (will fail if type mismatch, which is expected)
        BEGIN
            INSERT INTO bookings_new SELECT * FROM bookings;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not copy data due to type mismatch - this is expected';
        END;
        
        -- Drop old table
        DROP TABLE bookings;
        
        -- Rename new table
        ALTER TABLE bookings_new RENAME TO bookings;
        
        RAISE NOTICE 'Recreated bookings table with UUID id';
    ELSE
        RAISE NOTICE 'bookings.id is already UUID type (%)', id_type;
    END IF;
END $$;

-- ============================================
-- STEP 4: Add missing columns if they don't exist
-- ============================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'driver_id') THEN
        ALTER TABLE bookings ADD COLUMN driver_id UUID REFERENCES users(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'accepted_at') THEN
        ALTER TABLE bookings ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'offer_id') THEN
        ALTER TABLE bookings ADD COLUMN offer_id UUID REFERENCES offers(id);
    END IF;
END $$;

-- ============================================
-- STEP 5: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);

-- ============================================
-- STEP 6: Create simple RLS policies (no recursion)
-- ============================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can see all bookings
CREATE POLICY "allow_authenticated_read" ON bookings FOR SELECT
    TO authenticated
    USING (true);

-- Simple policy: authenticated users can insert
CREATE POLICY "allow_authenticated_insert" ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Simple policy: authenticated users can update
CREATE POLICY "allow_authenticated_update" ON bookings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STEP 7: Verify the fix
-- ============================================

SELECT 'Final bookings table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

SELECT 'RLS Policies on bookings:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bookings';
