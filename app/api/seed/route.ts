import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { use } from 'react'

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

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieStore = cookies();
            // Using React.use to properly handle the async cookies API
            return use(cookieStore.getAll());
          },
          setAll(cookiesToSet) {
            const cookieStore = cookies();
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    // Check if services exist
    const { data: existingServices } = await supabase
      .from('services')
      .select('count')
      .limit(1)

    // If services already exist, return early
    if (existingServices && existingServices.length > 0) {
      return NextResponse.json({ message: 'Services already seeded' })
    }

    // Insert services
    const { error, data } = await supabase
      .from('services')
      .insert(services.map((s) => ({ ...s, is_active: true })))

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: 'Successfully seeded services',
      count: services.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[v0] Seed error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
