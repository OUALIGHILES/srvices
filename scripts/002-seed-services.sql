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
