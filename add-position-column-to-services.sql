-- Migration to add position column to services table
-- This column is required for ordering services in the admin pricing page

ALTER TABLE services ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 1;

-- Update existing records to have sequential positions based on creation date
UPDATE services 
SET position = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
  FROM services
) AS subquery 
WHERE services.id = subquery.id;

-- Create an index on the position column for better performance
CREATE INDEX IF NOT EXISTS idx_services_position ON services(position);