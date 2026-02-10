'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomerHeader } from '@/components/customer-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, User, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function RebookServicePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    service_date: '',
    location: '',
    quantity: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch booking details
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          location,
          quantity,
          notes,
          service_date,
          services(name, description, category, base_price, price_type)
        `)
        .eq('id', bookingId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setBookingDetails(data);
      
      // Pre-fill form with previous booking details
      setFormData({
        service_date: new Date().toISOString().split('T')[0], // Default to today
        location: data.location,
        quantity: data.quantity || 1,
        notes: data.notes || ''
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create a new booking record
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            customer_id: user.id,
            service_id: bookingDetails.service_id,
            location: formData.location,
            service_date: formData.service_date,
            quantity: formData.quantity,
            notes: formData.notes,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Navigate to success page or back to bookings
      router.push(`/customer/bookings`);
      router.refresh(); // Refresh to show the new booking
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
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
        <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Button onClick={fetchBookingDetails}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <CustomerHeader />

      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rebook Service</h1>
          <p className="text-slate-500 dark:text-slate-400">Rebook the service: {bookingDetails?.services?.name}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="service_date">Service Date</Label>
              <div className="relative mt-1">
                <Input
                  type="date"
                  id="service_date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10"
                  required
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative mt-1">
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter service location"
                  className="pl-10"
                  required
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="pl-10"
                  required
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions or requirements..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Processing...' : 'Confirm Rebooking'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}