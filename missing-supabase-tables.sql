-- Create missing tables for admin settings page

-- Create language_strings table
CREATE TABLE IF NOT EXISTS language_strings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  english TEXT NOT NULL,
  arabic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for language_strings
CREATE INDEX IF NOT EXISTS idx_language_strings_key ON language_strings(key);

-- Enable RLS for language_strings
ALTER TABLE language_strings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for language_strings
CREATE POLICY "Allow public read access to language strings" ON language_strings
FOR SELECT TO anon, authenticated
USING (true);

-- Create policy to allow admin write access to language_strings
CREATE POLICY "Allow admin write access to language strings" ON language_strings
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.user_type = 'admin'
));

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT[], -- Array of variable names like ['{{driver_name}}', '{{vehicle_model}}']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);

-- Enable RLS for notification_templates
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users read access for notification_templates
CREATE POLICY "Allow authenticated read access to notification templates" ON notification_templates
FOR SELECT TO authenticated
USING (true);

-- Create policy to allow admin write access to notification_templates
CREATE POLICY "Allow admin write access to notification templates" ON notification_templates
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.user_type = 'admin'
));

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  key TEXT NOT NULL UNIQUE, -- The actual API key value
  icon TEXT CHECK (icon IN ('map', 'credit_card', 'message')) DEFAULT 'map',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(name);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin read access for api_keys
CREATE POLICY "Allow admin read access to API keys" ON api_keys
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.user_type = 'admin'
));

-- Create policy to allow admin write access to api_keys
CREATE POLICY "Allow admin write access to API keys" ON api_keys
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.user_type = 'admin'
));

-- Insert sample data for language_strings
INSERT INTO language_strings (key, english, arabic) VALUES
  ('app_welcome_title', 'Welcome to RideMaster', 'مرحباً بك في رايد ماستر'),
  ('order_status_pending', 'Awaiting Driver', 'بانتظار السائق'),
  ('btn_request_ride', 'Request Now', 'اطلب الآن'),
  ('app_title', 'RideMaster Admin Dashboard', 'لوحة تحكم رايد ماستر'),
  ('nav_dashboard', 'Dashboard', 'الرئيسية'),
  ('nav_services', 'Services', 'الخدمات'),
  ('nav_bookings', 'Bookings', 'الحجوزات'),
  ('nav_drivers', 'Drivers', 'السائقين'),
  ('nav_customers', 'Customers', 'العملاء'),
  ('nav_settings', 'Settings', 'الإعدادات')
ON CONFLICT (key) DO NOTHING;

-- Insert sample data for notification_templates
INSERT INTO notification_templates (name, template, variables) VALUES
  ('Driver Arrival SMS', 'Your driver {{driver_name}} has arrived in a {{vehicle_model}} ({{plate_number}}).', ARRAY['{{driver_name}}', '{{vehicle_model}}', '{{plate_number}}']),
  ('OTP Verification Push', 'Your verification code for RideMaster is {{otp_code}}. Do not share this with anyone.', ARRAY['{{otp_code}}']),
  ('Booking Confirmation', 'Your booking for {{service_name}} on {{date}} at {{time}} has been confirmed.', ARRAY['{{service_name}}', '{{date}}', '{{time}}']),
  ('Payment Success', 'Payment of {{amount}} for booking {{booking_id}} was successful.', ARRAY['{{amount}}', '{{booking_id}}']),
  ('Driver Assigned', 'Driver {{driver_name}} has been assigned to your booking. Contact: {{driver_phone}}', ARRAY['{{driver_name}}', '{{driver_phone}}'])
ON CONFLICT DO NOTHING;

-- Insert sample data for api_keys (using placeholder keys)
INSERT INTO api_keys (name, description, key, icon) VALUES
  ('Google Maps Platform', 'Used for routing and geolocation', 'AIzaSyB...Xy78z', 'map'),
  ('Stripe Connect', 'Production Secret Key', 'sk_live_51...j9H2q', 'credit_card'),
  ('Twilio SMS API', 'Account SID & Auth Token', 'AC7b2...e81c', 'message'),
  ('Firebase Cloud Messaging', 'For push notifications', 'AAAA...xyz', 'message')
ON CONFLICT (key) DO NOTHING;

-- Create a trigger to update the updated_at column for language_strings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_language_strings_updated_at
    BEFORE UPDATE ON language_strings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger to update the updated_at column for notification_templates
CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();