import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Service } from '../route'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;

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

    // Query the specific service by ID
    const { data: service, error } = await supabase
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
      .eq('id', serviceId)
      .eq('is_active', true)
      .single(); // Get a single record

    if (error) {
      console.error('Error fetching service:', error);
      return NextResponse.json(
        { error: 'Failed to fetch service', details: error.message },
        { status: 500 }
      );
    }

    if (!service) {
      console.error('Service not found');
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Process service to ensure boolean fields have proper defaults
    const processedService = {
      ...service,
      is_instant_booking: service.is_instant_booking ?? false,
      is_available_today: service.is_available_today ?? false,
    };

    return NextResponse.json(processedService);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Unexpected error in service API:', message, error);

    // Return a more generic error response to prevent empty object responses
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}