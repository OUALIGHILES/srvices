'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function BookingsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!loading) {
      if (!user) {
        // If not authenticated, redirect to login
        router.push('/login');
      } else if (profile) {
        // Redirect based on user type
        if (profile.user_type === 'customer') {
          router.push('/customer/bookings');
        } else if (profile.user_type === 'driver') {
          router.push('/driver/dashboard'); // or wherever driver bookings page is
        } else if (profile.user_type === 'admin') {
          router.push('/admin/dashboard'); // or wherever admin bookings page is
        } else {
          // Fallback redirect if user type is unknown
          router.push('/');
        }
      } else {
        // If user exists but profile doesn't, redirect to login
        router.push('/login');
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to your bookings...</p>
      </div>
    </div>
  );
}