-- Add missing RLS policies for bookings table

-- Allow authenticated users to insert bookings
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR auth.jwt()->>'user_role' = 'admin');

-- Allow users to update their own bookings
CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = customer_id OR auth.jwt()->>'user_role' = 'admin');

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = customer_id OR auth.jwt()->>'user_role' = 'admin');

-- Add missing RLS policies for other tables as needed

-- For offers table
CREATE POLICY "Drivers can create their own offers"
  ON offers FOR INSERT
  WITH CHECK (auth.uid() = driver_id OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Drivers can update their own offers"
  ON offers FOR UPDATE
  USING (auth.uid() = driver_id OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Drivers can delete their own offers"
  ON offers FOR DELETE
  USING (auth.uid() = driver_id OR auth.jwt()->>'user_role' = 'admin');

-- For messages table
CREATE POLICY "Users can create their own messages"
  ON messages FOR INSERT
  WITH CHECK ((auth.uid() = sender_id OR auth.uid() = recipient_id) OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING ((auth.uid() = sender_id OR auth.uid() = recipient_id) OR auth.jwt()->>'user_role' = 'admin');

-- For transactions table (typically only admins/managers should modify)
CREATE POLICY "Admins can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Admins can update transactions"
  ON transactions FOR UPDATE
  USING (auth.jwt()->>'user_role' = 'admin');