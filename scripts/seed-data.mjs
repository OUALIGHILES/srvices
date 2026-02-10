import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const services = [
  {
    name: 'Bulldozer Rental - CAT D6',
    description: 'Heavy-duty bulldozer for land clearing and grading',
    category: 'heavy_equipment',
    image_url: '/images/bulldozer.jpg',
    base_price: 500.0,
    price_type: 'hourly',
  },
  {
    name: 'Excavator - CAT 320',
    description: 'Medium excavator for digging and earthmoving',
    category: 'heavy_equipment',
    image_url: '/images/excavator.jpg',
    base_price: 450.0,
    price_type: 'hourly',
  },
  {
    name: 'Wheel Loader - CAT 950',
    description: 'Wheel loader for loading and material handling',
    category: 'heavy_equipment',
    image_url: '/images/loader.jpg',
    base_price: 400.0,
    price_type: 'hourly',
  },
  {
    name: 'Water Tank - 1000L',
    description: 'Portable water tank for construction sites',
    category: 'water_tanks',
    image_url: '/images/water-tank-1000.jpg',
    base_price: 50.0,
    price_type: 'fixed',
  },
  {
    name: 'Water Tank - 5000L',
    description: 'Large capacity water tank delivery',
    category: 'water_tanks',
    image_url: '/images/water-tank-5000.jpg',
    base_price: 150.0,
    price_type: 'fixed',
  },
  {
    name: 'Sand - Medium Grade',
    description: 'High-quality construction sand by ton',
    category: 'sand_materials',
    image_url: '/images/sand.jpg',
    base_price: 45.0,
    price_type: 'per_unit',
  },
  {
    name: 'Gravel - 20mm',
    description: 'Crushed stone gravel for roads and foundations',
    category: 'sand_materials',
    image_url: '/images/gravel.jpg',
    base_price: 55.0,
    price_type: 'per_unit',
  },
  {
    name: 'Concrete Mixer Truck',
    description: 'Ready-mix concrete delivery service',
    category: 'heavy_equipment',
    image_url: '/images/concrete-mixer.jpg',
    base_price: 200.0,
    price_type: 'fixed',
  },
  {
    name: 'Construction Workers - Group of 5',
    description: 'Skilled construction labor for general work',
    category: 'labor_hire',
    image_url: '/images/workers.jpg',
    base_price: 300.0,
    price_type: 'fixed',
  },
  {
    name: 'Electrical Labor - Expert',
    description: 'Experienced electrical work and installation',
    category: 'labor_hire',
    image_url: '/images/electrical.jpg',
    base_price: 150.0,
    price_type: 'hourly',
  },
  {
    name: 'Plumbing Labor - Expert',
    description: 'Professional plumbing installation and repair',
    category: 'labor_hire',
    image_url: '/images/plumbing.jpg',
    base_price: 120.0,
    price_type: 'hourly',
  },
  {
    name: 'Compactor - Vibratory',
    description: 'Soil and asphalt compaction equipment',
    category: 'heavy_equipment',
    image_url: '/images/compactor.jpg',
    base_price: 350.0,
    price_type: 'hourly',
  },
]

async function seedServices() {
  try {
    console.log('[v0] Starting to seed services...')

    // Check if services already exist
    const { data: existing, error: checkError } = await supabase
      .from('services')
      .select('count')
      .limit(1)

    if (checkError) {
      console.error('[v0] Error checking services:', checkError.message)
      return
    }

    // Insert services
    const { error: insertError, data } = await supabase
      .from('services')
      .insert(services.map((s) => ({ ...s, is_active: true })))

    if (insertError) {
      console.error('[v0] Error inserting services:', insertError.message)
      return
    }

    console.log('[v0] Successfully seeded', services.length, 'services')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[v0] Fatal error:', message)
  }
}

seedServices()
