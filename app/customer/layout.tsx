'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { HomeHeader } from '@/components/home-header';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else if (profile && profile.user_type !== 'customer') {
        // If user exists but is not a customer, redirect to appropriate dashboard
        if (profile.user_type === 'driver') {
          router.push('/driver/dashboard');
        } else if (profile.user_type === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // Default fallback to home
          router.push('/');
        }
      }
    }
  }, [user, profile, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or not a customer, don't render the layout
  if (!user || (profile && profile.user_type !== 'customer')) {
    return null; // The redirect effect will handle navigation
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <HomeHeader />
      <main>
        {children}
      </main>
    </div>
  );
}