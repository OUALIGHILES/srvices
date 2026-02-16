import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  base_price: number;
  price_type: 'fixed' | 'hourly' | 'per_unit';
  rating: number;
  review_count: number;
  provider_name: string;
  distance: string;
  is_instant_booking: boolean;
  is_available_today: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const instantBookingStr = searchParams.get('instant_booking');
    const availableTodayStr = searchParams.get('available_today');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const orderBy = searchParams.get('order_by');
    const orderDirection = searchParams.get('order_direction');
    const tonnage = searchParams.get('tonnage');
    const engineType = searchParams.get('engine_type');
    
    // Get brands array from URLSearchParams
    const brands = searchParams.getAll('brands[]');

    const limit = limitParam ? parseInt(limitParam) : 12;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op for public API routes
          },
        },
      },
    );

    // Build the query with error handling
    let query = supabase
      .from('services')
      .select(`
        id,
        name,
        description,
        category,
        image_url,
        base_price,
        price_type,
        rating,
        review_count,
        provider_name,
        distance,
        is_instant_booking,
        is_available_today,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply location filter - for now we'll skip this filter since there's no direct location field
    // In a real implementation, you would have a location field in the services table
    // or join with a providers table that has location information
    if (location) {
      // Placeholder for location filtering
      // In a real implementation, you would filter by location here
    }

    // Apply price range filter
    if (minPrice !== null && !isNaN(parseFloat(minPrice))) {
      query = query.gte('base_price', parseFloat(minPrice));
    }

    if (maxPrice !== null && !isNaN(parseFloat(maxPrice))) {
      query = query.lte('base_price', parseFloat(maxPrice));
    }

    // Apply instant booking filter
    if (instantBookingStr !== null) {
      const instantBooking = instantBookingStr.toLowerCase() === 'true';
      query = query.eq('is_instant_booking', instantBooking);
    }

    // Apply available today filter
    if (availableTodayStr !== null) {
      const availableToday = availableTodayStr.toLowerCase() === 'true';
      query = query.eq('is_available_today', availableToday);
    }

    // Apply brand filter
    if (brands && brands.length > 0) {
      // Since we don't have a brand column in the services table, we'll filter by name
      // In a real implementation, you would have a brand column in the services table
      // For now, we'll filter by name containing the brand names
      let brandQuery = query;
      for (let i = 0; i < brands.length; i++) {
        if (i === 0) {
          brandQuery = brandQuery.ilike('name', `%${brands[i]}%`);
        } else {
          // Note: Supabase doesn't have OR queries in a simple way
          // In a real implementation, you would need to handle this differently
          // For now, we'll just use the first brand
          break;
        }
      }
      query = brandQuery;
    }

    // Apply tonnage filter
    if (tonnage) {
      // Since we don't have a tonnage column in the services table, we'll skip this filter
      // In a real implementation, you would have a tonnage column in the services table
    }

    // Apply engine type filter
    if (engineType) {
      // Since we don't have an engine_type column in the services table, we'll skip this filter
      // In a real implementation, you would have an engine_type column in the services table
    }

    // Apply ordering
    if (orderBy) {
      const direction = orderDirection === 'desc' ? 'desc' : 'asc';
      query = query.order(orderBy, { ascending: direction === 'asc' });
    } else {
      // Default ordering by rating descending
      query = query.order('rating', { ascending: false });
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services', details: error.message },
        { status: 500 }
      );
    }

    if (!services) {
      console.error('No services data returned from query');
      return NextResponse.json(
        { error: 'No services found' },
        { status: 404 }
      );
    }

    // Process services to ensure boolean fields have proper defaults
    const processedServices = services.map(service => ({
      ...service,
      is_instant_booking: service.is_instant_booking ?? false,
      is_available_today: service.is_available_today ?? false,
    }));

    return NextResponse.json(processedServices);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Unexpected error in services API:', message, error);
    
    // Return a more generic error response to prevent empty object responses
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}