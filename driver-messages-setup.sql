-- ============================================
-- DRIVER MESSAGES PAGE - COMPLETE SQL SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: MESSAGES TABLE
-- ============================================

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id 
    OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- ============================================
-- PART 2: ISSUE REPORTS TABLE
-- ============================================

-- Create issue_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('general', 'damage', 'delay', 'customer_issue', 'payment', 'other')),
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_review', 'resolved', 'closed')) DEFAULT 'pending',
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issue_reports_booking_id ON issue_reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_driver_id ON issue_reports(driver_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status);

-- Enable RLS
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Drivers can view their own issue reports" ON issue_reports;
DROP POLICY IF EXISTS "Drivers can create issue reports" ON issue_reports;
DROP POLICY IF EXISTS "Admins can view all issue reports" ON issue_reports;
DROP POLICY IF EXISTS "Admins can update issue reports" ON issue_reports;

-- Create RLS policies for issue_reports
CREATE POLICY "Drivers can view their own issue reports"
  ON issue_reports FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create issue reports"
  ON issue_reports FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- ============================================
-- PART 3: ENSURE BOOKINGS TABLE HAS REQUIRED COLUMNS
-- ============================================

-- Add driver_id column if not exists
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

-- Add accepted_at column if not exists
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);

-- ============================================
-- PART 4: ENSURE USERS TABLE HAS REQUIRED COLUMNS
-- ============================================

-- Add driver_id column for display purposes (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'driver_id'
  ) THEN
    ALTER TABLE users ADD COLUMN driver_id TEXT;
    RAISE NOTICE 'Added driver_id column to users table';
  END IF;
END $$;

-- Add is_available column for driver status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_available column to users table';
  END IF;
END $$;

-- ============================================
-- PART 5: HELPER FUNCTION TO GET CONVERSATIONS
-- ============================================

-- Create or replace function to get driver conversations
CREATE OR REPLACE FUNCTION get_driver_conversations()
RETURNS TABLE (
  booking_id UUID,
  customer_id UUID,
  customer_name TEXT,
  customer_avatar TEXT,
  customer_rating DECIMAL,
  service_type TEXT,
  order_number TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP,
  unread_count BIGINT,
  booking_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS booking_id,
    b.customer_id,
    COALESCE(c.full_name, 'Customer') AS customer_name,
    c.avatar_url AS customer_avatar,
    c.rating AS customer_rating,
    COALESCE(s.category, 'Service') AS service_type,
    CONCAT('ORD-', UPPER(SUBSTRING(b.id::text FROM 1 FOR 5))) AS order_number,
    COALESCE(m.last_message, 'No messages yet') AS last_message,
    COALESCE(m.last_message_time, b.service_date) AS last_message_time,
    COALESCE(u.unread_count, 0)::BIGINT AS unread_count,
    b.status AS booking_status
  FROM bookings b
  LEFT JOIN users c ON b.customer_id = c.id
  LEFT JOIN services s ON b.service_id = s.id
  LEFT JOIN LATERAL (
    SELECT content AS last_message, created_at AS last_message_time
    FROM messages
    WHERE (sender_id = b.customer_id OR recipient_id = b.customer_id)
      AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS unread_count
    FROM messages
    WHERE recipient_id = auth.uid()
      AND sender_id = b.customer_id
      AND is_read = FALSE
  ) u ON TRUE
  WHERE b.driver_id = auth.uid()
  ORDER BY COALESCE(m.last_message_time, b.service_date) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: SAMPLE DATA (FOR TESTING - OPTIONAL)
-- ============================================

-- Uncomment the lines below to insert sample data for testing

-- Insert sample messages
-- INSERT INTO messages (sender_id, recipient_id, booking_id, content, is_read)
-- SELECT 
--   (SELECT id FROM users WHERE user_type = 'customer' LIMIT 1),
--   (SELECT id FROM users WHERE user_type = 'driver' LIMIT 1),
--   (SELECT id FROM bookings LIMIT 1),
--   'Hello! Just wanted to confirm the delivery time.',
--   TRUE
-- WHERE EXISTS (SELECT 1 FROM users WHERE user_type = 'customer')
--   AND EXISTS (SELECT 1 FROM users WHERE user_type = 'driver');

-- ============================================
-- PART 7: VERIFICATION QUERIES
-- ============================================

-- Show messages table structure
SELECT 'messages table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Show issue_reports table structure
SELECT 'issue_reports table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'issue_reports'
ORDER BY ordinal_position;

-- Show RLS policies on messages
SELECT 'messages RLS policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages';

-- Show RLS policies on issue_reports
SELECT 'issue_reports RLS policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'issue_reports';

-- Count messages
SELECT 'Total messages:' as info, COUNT(*) as count FROM messages;

-- Count issue reports
SELECT 'Total issue reports:' as info, COUNT(*) as count FROM issue_reports;
