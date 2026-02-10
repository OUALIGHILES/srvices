-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
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

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  base_price DECIMAL(10,2),
  price_type TEXT CHECK (price_type IN ('fixed', 'hourly', 'per_unit')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Sub-types (equipment, options, etc)
CREATE TABLE service_subtypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing rules (Admin controls)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_fixed_price DECIMAL(10,2),
  driver_percentage DECIMAL(5,2),
  driver_fixed_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings/Requests table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table (Driver responses to bookings)
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

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_seconds INTEGER,
  status TEXT CHECK (status IN ('initiated', 'ringing', 'answered', 'ended', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gross_amount DECIMAL(10,2) NOT NULL,
  company_fee DECIMAL(10,2),
  driver_amount DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'wallet')),
  status TEXT CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'awaiting_reply', 'resolved')) DEFAULT 'open',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Documents (for verification)
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_offers_booking_id ON offers(booking_id);
CREATE INDEX idx_offers_driver_id ON offers(driver_id);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for Bookings
CREATE POLICY "Customers can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Drivers can view assigned bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.booking_id = bookings.id
      AND offers.driver_id = auth.uid()
    )
    OR auth.jwt()->>'user_role' = 'admin'
  );

-- RLS Policies for Offers
CREATE POLICY "Drivers can view their own offers"
  ON offers FOR SELECT
  USING (auth.uid() = driver_id OR auth.jwt()->>'user_role' = 'admin');

CREATE POLICY "Customers can view offers on their bookings"
  ON offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = offers.booking_id
      AND bookings.customer_id = auth.uid()
    )
    OR auth.jwt()->>'user_role' = 'admin'
  );

-- Seed initial services data
INSERT INTO public.services (name, description, category, image_url, base_price, price_type, is_active)
VALUES
  ('Bulldozer Rental - CAT D6', 'Heavy-duty bulldozer for land clearing and grading', 'heavy_equipment', '/images/bulldozer.jpg', 500.00, 'hourly', true),
  ('Excavator - CAT 320', 'Medium excavator for digging and earthmoving', 'heavy_equipment', '/images/excavator.jpg', 450.00, 'hourly', true),
  ('Wheel Loader - CAT 950', 'Wheel loader for loading and material handling', 'heavy_equipment', '/images/loader.jpg', 400.00, 'hourly', true),
  ('Water Tank - 1000L', 'Portable water tank for construction sites', 'water_tanks', '/images/water-tank-1000.jpg', 50.00, 'fixed', true),
  ('Water Tank - 5000L', 'Large capacity water tank delivery', 'water_tanks', '/images/water-tank-5000.jpg', 150.00, 'fixed', true),
  ('Sand - Medium Grade', 'High-quality construction sand by ton', 'sand_materials', '/images/sand.jpg', 45.00, 'per_unit', true),
  ('Gravel - 20mm', 'Crushed stone gravel for roads and foundations', 'sand_materials', '/images/gravel.jpg', 55.00, 'per_unit', true),
  ('Concrete Mixer Truck', 'Ready-mix concrete delivery service', 'heavy_equipment', '/images/concrete-mixer.jpg', 200.00, 'fixed', true),
  ('Construction Workers - Group of 5', 'Skilled construction labor for general work', 'labor_hire', '/images/workers.jpg', 300.00, 'fixed', true),
  ('Electrical Labor - Expert', 'Experienced electrical work and installation', 'labor_hire', '/images/electrical.jpg', 150.00, 'hourly', true),
  ('Plumbing Labor - Expert', 'Professional plumbing installation and repair', 'labor_hire', '/images/plumbing.jpg', 120.00, 'hourly', true),
  ('Compactor - Vibratory', 'Soil and asphalt compaction equipment', 'heavy_equipment', '/images/compactor.jpg', 350.00, 'hourly', true);