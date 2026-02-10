'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AuthRedirectPage() {
  const router = useRouter();
  const { profile, loading, user } = useAuth();

  useEffect(() => {
    // If user is authenticated but profile is not loaded yet, wait for it
    if (user && !profile && !loading) {
      // Profile wasn't found, redirect to login
      router.push('/login');
      return;
    }

    // If profile is loaded, redirect based on user type
    if (profile) {
      if (profile.user_type === 'admin') {
        router.push('/admin/dashboard');
      } else if (profile.user_type === 'driver') {
        router.push('/driver/dashboard');
      } else {
        // Default to customer dashboard for customers or if user type is not set
        router.push('/customer/dashboard');
      }
    }
  }, [profile, loading, user, router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}