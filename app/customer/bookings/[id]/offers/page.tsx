'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomerHeader } from '@/components/customer-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Offer {
  id: string;
  driver: {
    id: string;
    name: string;
    rating: number;
    total_reviews: number;
  };
  offered_price: number;
  distance_km: number;
  created_at: string;
  status: string;
}

export default function BookingOffersPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffersAndBooking = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          status,
          created_at,
          service_date,
          location,
          services(name)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      setBookingDetails(bookingData);

      // Fetch offers for this booking
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          offered_price,
          distance_km,
          created_at,
          status,
          driver_id,
          users(full_name, rating, total_reviews)
        `)
        .eq('booking_id', bookingId)
        .order('offered_price', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our Offer interface
      const transformedOffers: Offer[] = data.map((offer: any) => ({
        id: offer.id,
        offered_price: parseFloat(offer.offered_price),
        distance_km: parseFloat(offer.distance_km) || 0,
        created_at: offer.created_at,
        status: offer.status,
        driver: {
          id: offer.driver_id,
          name: offer.users?.full_name || 'Unknown Driver',
          rating: parseFloat(offer.users?.rating) || 0,
          total_reviews: offer.users?.total_reviews || 0
        }
      }));

      setOffers(transformedOffers);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchOffersAndBooking();
    }
  }, [bookingId]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const supabase = createClient();
      
      // Update the offer status to accepted
      const { error } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (error) {
        throw new Error(error.message);
      }

      // Also update the booking status to 'offer_accepted'
      await supabase
        .from('bookings')
        .update({ status: 'offer_accepted' })
        .eq('id', bookingId);

      // Navigate back to bookings
      router.push('/customer/bookings');
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      alert('Failed to accept offer: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Button onClick={fetchOffersAndBooking}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <CustomerHeader />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offers for {bookingDetails?.services?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">Booking ID: {bookingId}</p>
        </div>

        <div className="grid gap-4">
          {offers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">No offers received yet. Please check back later.</p>
            </Card>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id} className="p-6 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-lg font-bold">{offer.driver.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{offer.driver.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{offer.driver.rating.toFixed(1)}</span>
                          <span className="text-sm text-slate-500">({offer.driver.total_reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{offer.distance_km.toFixed(1)} km away</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          Offered: {new Date(offer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">${offer.offered_price.toFixed(2)}</p>
                      <p className="text-sm text-slate-500">Total Price</p>
                    </div>
                    <Button onClick={() => handleAcceptOffer(offer.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Offer
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}