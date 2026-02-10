import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookies().getAll();
          },
          setAll(cookiesToSet) {
            const cookieStore = cookies();
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // ignored
            }
          },
        },
      },
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch bookings for the current user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: bookingsError.message },
        { status: 500 }
      )
    }

    // Fetch service details for each booking
    const bookingsWithServices = []

    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        // Validate UUID format before making the request
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(booking.service_id)) {
          console.error(`Invalid UUID format for service_id: ${booking.service_id}`);
          bookingsWithServices.push({
            ...booking,
            service: null
          });
          continue;
        }

        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('id, name, image_url')
          .eq('id', booking.service_id)
          .single()

        if (serviceError) {
          console.error('Error fetching service:', serviceError)
        }

        bookingsWithServices.push({
          ...booking,
          service: serviceData || null
        })
      }
    }

    return NextResponse.json({
      bookings: bookingsWithServices
    })
  } catch (error) {
    console.error('Unexpected error in API route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}