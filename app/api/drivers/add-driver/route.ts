import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-service';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client that can access cookies in the server environment
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );
    
    // Get the session from the request cookies
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json(
        { error: 'Unauthorized: No session found' },
        { status: 401 }
      );
    }

    // Check if the user is an admin by querying the users table
    const { data: userProfile, error: userCheckError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (userCheckError || !userProfile || userProfile.user_type !== 'admin') {
      return Response.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const {
      email,
      full_name,
      phone,
      license_number,
      vehicle_make,
      vehicle_model,
      vehicle_color,
      vehicle_plate,
      password,
    } = await request.json();

    if (!email || !full_name) {
      return Response.json(
        { error: 'Email and Full Name are required' },
        { status: 400 }
      );
    }

    if (!password) {
      return Response.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Use the service role client for admin operations
    const serviceSupabase = createServiceRoleClient();

    // First, create the auth user (without a password initially)
    const { data: authUserData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      email_confirm: true, // Skip email confirmation for admin-created users
      user_metadata: {
        full_name,
        phone_number: phone,
        user_type: 'driver',
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return Response.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 500 }
      );
    }

    const userId = authUserData.user.id;

    // Set the user's password to the one provided by the admin
    const { data: updateData, error: updateError } = await serviceSupabase.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (updateError) {
      console.error('Could not set password:', updateError.message);
      return Response.json(
        { error: `Failed to set password: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Then, create the user profile in the users table
    const { error: profileInsertError } = await serviceSupabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          full_name,
          phone_number: phone,
          user_type: 'driver',
          status: 'pending_approval',
          license_number,
          vehicle_make,
          vehicle_model,
          vehicle_color,
          vehicle_plate,
          rating: 0,
          total_reviews: 0,
          wallet_balance: 0,
        },
      ]);

    if (profileInsertError) {
      // If profile creation failed, clean up the auth user we just created
      await serviceSupabase.auth.admin.deleteUser(userId);
      
      console.error('Profile creation error:', profileInsertError);
      return Response.json(
        { error: `Failed to create user profile: ${profileInsertError.message}` },
        { status: 500 }
      );
    }

    return Response.json(
      { 
        success: true, 
        message: 'Driver created successfully',
        userId 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in add-driver API:', error);
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}