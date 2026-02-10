-- Migration to add missing columns to services table
-- These columns are required by the admin services page

-- Add billing_unit column with enum constraint
ALTER TABLE services ADD COLUMN IF NOT EXISTS billing_unit TEXT DEFAULT 'hour' CHECK (billing_unit IN ('hour', 'load', 'trip', 'item'));

-- Add platform_fee column
ALTER TABLE services ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(5,2) DEFAULT 0;

-- Update the services table comment to document the new columns
COMMENT ON COLUMN services.billing_unit IS 'Unit of measurement for billing (hour, load, trip, item)';
COMMENT ON COLUMN services.platform_fee IS 'Percentage fee taken by the platform (0-100)';