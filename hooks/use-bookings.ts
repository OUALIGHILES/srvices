import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

// Define types for our booking data
export interface Booking {
  id: string;
  service_name: string;
  status: 'active' | 'pending_offers' | 'completed' | 'cancelled' | 'waiting_for_offers' | 'offer_accepted' | 'in_progress';
  booking_date: string;
  booking_id: string;
  driver?: {
    name: string;
    rating: number;
  };
  offers_count?: number;
  price_from?: number;
  cancellation_reason?: string;
  category_icon: string;
  service_date?: string;
  location?: string;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch bookings for the current user
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          status,
          created_at,
          service_date,
          location,
          offers(count),
          services(name, category)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our Booking interface
      const transformedBookings: Booking[] = data.map((booking: any) => {
        // Determine status mapping
        let status: Booking['status'] = 'pending_offers';
        switch (booking.status) {
          case 'completed':
            status = 'completed';
            break;
          case 'cancelled':
            status = 'cancelled';
            break;
          case 'in_progress':
            status = 'active';
            break;
          case 'offer_accepted':
            status = 'active';
            break;
          case 'waiting_for_offers':
            status = 'pending_offers';
            break;
          case 'pending':
            status = 'pending_offers';
            break;
          default:
            status = 'pending_offers';
        }

        // Map service category to icon
        let category_icon = 'construction';
        switch (booking.services?.category) {
          case 'heavy_equipment':
            category_icon = 'construction';
            break;
          case 'water_tanks':
            category_icon = 'water_drop';
            break;
          case 'sand_materials':
            category_icon = 'home_repair_service';
            break;
          case 'labor_hire':
            category_icon = 'wrench';
            break;
          default:
            category_icon = 'construction';
        }

        return {
          id: booking.id,
          service_name: booking.services?.name || 'Unknown Service',
          status,
          booking_date: new Date(booking.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          booking_id: `BK-${Math.floor(10000 + Math.random() * 90000)}`, // Generate booking ID
          offers_count: booking.offers?.count || 0,
          category_icon,
          service_date: booking.service_date ? new Date(booking.service_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : undefined,
          location: booking.location
        };
      });

      setBookings(transformedBookings);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, loading, error, refetch: fetchBookings };
};