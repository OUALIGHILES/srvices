import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { use } from 'react'

export async function POST(request: Request) {
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

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['service_id', 'location', 'date', 'time']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        service_id: body.service_id,
        location: body.location,
        service_date: new Date(`${body.date}T${body.time}`).toISOString(),
        quantity: body.quantity || 1,
        notes: body.notes || '',
        guest_name: null, // Only for guests
        guest_phone: null, // Only for guests
        is_guest: false, // Only for guests
        status: 'waiting_for_offers',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating booking:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create booking', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Unexpected error in booking creation API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}