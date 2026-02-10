-- Create the services table with the required columns
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_type VARCHAR(20) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'per_unit')),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  provider_name VARCHAR(255),
  distance VARCHAR(100) DEFAULT 'Within 20km',
  is_instant_booking BOOLEAN DEFAULT FALSE,
  is_available_today BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(base_price);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON services
FOR SELECT TO anon, authenticated
USING (is_active = true);

-- Insert sample data
INSERT INTO services (name, description, category, image_url, base_price, price_type, rating, review_count, provider_name, distance, is_instant_booking, is_available_today, is_active) VALUES
('Excavator Rental', 'Professional excavator rental service with experienced operators', 'heavy_equipment', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 1200.00, 'hourly', 4.8, 42, 'Construction Pros Inc.', 'Within 15km', true, true, true),
('Bulldozer Service', 'Heavy-duty bulldozer for land clearing and grading projects', 'heavy_equipment', 'https://images.unsplash.com/photo-1563959159176-6293e3e704a6?w=800', 1500.00, 'hourly', 4.6, 38, 'Earth Movers Ltd', 'Within 20km', false, true, true),
('Water Tank Delivery', 'Fresh water delivery with certified clean tanks', 'water_tanks', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800', 450.00, 'fixed', 4.9, 56, 'Clean Water Services', 'Within 25km', true, true, true),
('Sand Supply', 'High-quality construction sand delivery service', 'sand_materials', 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=800', 300.00, 'per_unit', 4.5, 29, 'Material Masters', 'Within 18km', false, false, true),
('Skilled Labor Team', 'Professional construction workers for various projects', 'labor_hire', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', 200.00, 'daily', 4.7, 63, 'Workforce Solutions', 'Within 10km', true, true, true);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();