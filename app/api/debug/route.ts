import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { use } from 'react'

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
              // ignored
            }
          },
        },
      },
    )

    console.log('[v0] Testing database connection...')

    // Test connection
    const { data: tables, error: tablesError } = await supabase
      .from('services')
      .select('count')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query services table',
        error: tablesError.message,
        code: tablesError.code,
      })
    }

    // Get service count
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')

    if (servicesError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to fetch services',
        error: servicesError.message,
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      serviceCount: services?.length || 0,
      services: services?.slice(0, 3),
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Diagnostic failed',
        error: message,
      },
      { status: 500 },
    )
  }
}
