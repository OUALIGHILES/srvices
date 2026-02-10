'use client'

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function BookingMessagesRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'customer') {
        router.push(`/customer/messagerie/${bookingId}`);
      } else if (user.role === 'driver') {
        router.push(`/driver/messagerie/${bookingId}`);
      } else {
        // Default to customer messagerie if role is not specified
        router.push(`/customer/messagerie/${bookingId}`);
      }
    } else if (!loading && !user) {
      // If not logged in, redirect to login
      router.push('/login');
    }
  }, [user, loading, router, bookingId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to messagerie...</p>
      </div>
    </div>
  );
}