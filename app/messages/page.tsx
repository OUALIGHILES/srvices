'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function MessagesRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user role
        if (user.role === 'customer') {
          router.push('/customer/messagerie');
        } else if (user.role === 'driver') {
          router.push('/driver/messagerie');
        } else {
          // Default to customer messagerie if role is not specified
          router.push('/customer/messagerie');
        }
      } else {
        // If not logged in, redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to messagerie...</p>
      </div>
    </div>
  );
}