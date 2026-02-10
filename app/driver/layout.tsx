'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DriverHeader } from '@/components/driver-header';

export default function DriverLayout({
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
      } else if (profile && profile.user_type !== 'driver') {
        // If user exists but is not a driver, redirect to home
        router.push('/');
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

  // If user is not authenticated or not a driver, don't render the layout
  if (!user || (profile && profile.user_type !== 'driver')) {
    return null; // The redirect effect will handle navigation
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <DriverHeader />
      <main>
        {children}
      </main>
    </div>
  );
}