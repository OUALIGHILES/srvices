'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase';
import { Construction, CreditCard, Lock, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  base_price: number;
  price_type: 'fixed' | 'hourly' | 'per_unit';
  is_active: boolean;
  created_at: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Retrieve booking data from localStorage
  const [bookingData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(`booking_data_${serviceId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Calculate duration based on start and end dates
        const startDate = new Date(parsed.date);
        const endDate = new Date(parsed.endDate);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        
        return {
          location: parsed.location,
          startDate: parsed.date,
          endDate: parsed.endDate,
          time: parsed.time || '09:00', // Default time if not provided
          duration: duration,
          quantity: parsed.quantity
        };
      }
    }
    // Default values if no saved data
    return {
      location: 'San Jose Site B, 95112',
      startDate: '2024-10-12',
      endDate: '2024-10-15',
      time: '09:00',
      duration: 3,
      quantity: 1
    };
  });

  useEffect(() => {
    const fetchServiceDetails = async () => {
      const supabase = createClient();

      try {
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;

        setService(serviceData);
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  // Calculate prices
  const totalPrice = service ? service.base_price * bookingData.quantity * bookingData.duration : 0;
  const platformFee = totalPrice * 0.03; // 3% platform fee
  const insuranceFee = 45.00; // Standard insurance
  const expectedTotal = totalPrice + platformFee + insuranceFee;

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCompleteBooking = async () => {
    // Get the booking data from localStorage
    const savedBookingData = localStorage.getItem(`booking_data_${serviceId}`);
    if (!savedBookingData) {
      setError('Booking data not found');
      return;
    }

    const bookingData = JSON.parse(savedBookingData);

    // Get guest details if user is not logged in
    const guestDetails = user ? null : JSON.parse(localStorage.getItem(`guest_details_${serviceId}`) || '{}');

    try {
      // Process the booking creation
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          location: bookingData.location,
          date: bookingData.startDate,
          end_date: bookingData.endDate,
          time: bookingData.time,
          quantity: bookingData.quantity,
          notes: bookingData.notes,
          // Include guest details if user is not logged in
          ...(guestDetails && {
            guest_full_name: guestDetails.fullName,
            guest_phone_number: guestDetails.phoneNumber,
            guest_email: guestDetails.email
          })
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to create booking');
      }

      // Clear the booking data from localStorage
      localStorage.removeItem(`booking_data_${serviceId}`);
      localStorage.removeItem(`guest_details_${serviceId}`);

      // Navigate to the booking confirmation page
      router.push(`/bookings/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
      console.error('Booking error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Construction className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">EquipFlow</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Categories</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Solutions</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Support</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
                {profile?.first_name || 'Account'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-6 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex items-center space-x-2">
            <li><a className="hover:text-primary" href="/">Home</a></li>
            <li><span className="material-icons text-xs">chevron_right</span></li>
            <li><a className="hover:text-primary" href="/booking">Booking</a></li>
            <li><span className="material-icons text-xs">chevron_right</span></li>
            <li className="font-medium text-slate-900 dark:text-white">Payment</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Complete your booking</h1>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <div 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      paymentMethod === 'card' 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-5 w-5 text-primary mr-3" />
                    <span>Credit/Debit Card</span>
                  </div>
                  
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
                          type="text"
                          name="number"
                          placeholder="0000 0000 0000 0000"
                          value={cardDetails.number}
                          onChange={handleCardDetailsChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name on Card</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
                          type="text"
                          name="name"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={handleCardDetailsChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={handleCardDetailsChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CVV</label>
                        <input
                          className="w-full px-4 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCardDetailsChange}
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                          <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {service?.image_url ? (
                      <img 
                        alt={service.name} 
                        className="w-full h-full object-cover" 
                        src={service?.image_url || 'https://placehold.co/400x300'} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{service?.name || 'Equipment Name'}</h3>
                    <p className="text-sm text-slate-500">{bookingData.quantity} × ${service?.base_price}/day</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {bookingData.location}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">${service?.base_price}.00 × {bookingData.duration} days × {bookingData.quantity}</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform fee (3%)</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Insurance (standard)</span>
                    <span className="font-medium">${insuranceFee.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-extrabold text-primary">${expectedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 mt-6"
                  onClick={handleCompleteBooking}
                >
                  Confirm & Pay ${expectedTotal.toFixed(2)}
                  <Lock className="h-4 w-4" />
                </Button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-medium">Secured with bank-level encryption</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-icons text-slate-400">person</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">Bay Area Rentals LLC</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="material-icons text-[10px] text-primary">verified</span> Verified Fleet Provider
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}