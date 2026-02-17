'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Navigation,
  MapPin,
  Star,
  WaterDrop,
  CreditCard,
  Package,
  Plus,
  Minus,
  Check,
  Truck,
  Wrench,
  Building
} from 'lucide-react';

interface Booking {
  id: string;
  service_id: string;
  location: string;
  service_date: string;
  quantity: number;
  customer_id: string;
  status: string;
  customer_name?: string;
  customer_avatar?: string;
  customer_rating?: number;
  customer_orders_count?: number;
  distance?: number;
  estimated_fare?: number;
  service_type?: string;
  equipment?: string;
  notes?: string;
}

export default function AcceptedOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);

  const bookingId = params.bookingId as string;

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user || !bookingId) return;

      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            location,
            service_date,
            quantity,
            customer_id,
            status,
            notes
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;

        // Fetch customer details
        let customerName = 'Customer';
        let customerAvatar = '';
        let customerRating = 5.0;
        let customerOrdersCount = 0;

        if (bookingData.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('users')
            .select('full_name, avatar_url, rating')
            .eq('id', bookingData.customer_id)
            .single();

          if (!customerError) {
            customerName = customerData?.full_name || 'Customer';
            customerAvatar = customerData?.avatar_url || '';
            customerRating = customerData?.rating || 5.0;
          }

          // Get customer orders count
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', bookingData.customer_id)
            .eq('status', 'completed');

          customerOrdersCount = count || 0;
        }

        // Fetch service details
        let serviceType = 'Service';
        let equipment = 'Standard Equipment';

        if (bookingData.service_id) {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('category, name')
            .eq('id', bookingData.service_id)
            .maybeSingle();

          if (!serviceError && serviceData) {
            serviceType = serviceData.category || 'Service';
            equipment = serviceData.name || 'Standard Equipment';
          }
        }

        // Fetch latest offer for distance and fare
        let distance = 0;
        let estimatedFare = 0;

        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('distance_km, offered_price')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!offerError && offerData) {
          distance = offerData.distance_km || 0;
          estimatedFare = offerData.offered_price || 0;
        }

        setBooking({
          ...bookingData,
          customer_name: customerName,
          customer_avatar: customerAvatar,
          customer_rating: customerRating,
          customer_orders_count: customerOrdersCount,
          distance,
          estimated_fare: estimatedFare,
          service_type: serviceType,
          equipment,
        });
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [user, bookingId]);

  const handleStartNavigation = () => {
    // Open maps with destination
    if (booking?.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`, '_blank');
    }
  };

  const handleCallCustomer = () => {
    // Implement call functionality
    alert('Calling customer...');
  };

  const handleMessageCustomer = () => {
    // Redirect to messaging
    router.push(`/driver/messagerie/${bookingId}`);
  };

  const handleArrived = async () => {
    if (!user || !bookingId) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'in_progress',
          driver_arrived_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      setHasArrived(true);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <Button onClick={() => router.push('/driver/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 py-6 lg:px-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/driver/dashboard')}
                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Order #{booking.id.slice(-7)}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Active Journey • {booking.service_type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-lg border border-blue-100 dark:border-blue-800">
                In Progress
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Map & Journey */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Map */}
              <div className="relative bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden min-h-[500px] shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}></div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500">
                  <path d="M150,400 Q300,350 400,250 T650,150" fill="none" stroke="#135bec" strokeDasharray="12 8" strokeLinecap="round" strokeWidth="6" />
                  <circle cx="150" cy="400" fill="#135bec" r="8" />
                  <circle cx="650" cy="150" fill="#ef4444" r="8" />
                </svg>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <button className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <button
                    onClick={handleStartNavigation}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-black transition-all"
                  >
                    <Navigation className="h-5 w-5" />
                    Start Navigation
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 min-w-[180px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA</p>
                  <p className="text-xl font-black text-primary">12 Minutes</p>
                  <p className="text-xs text-slate-500 mt-1">{booking.distance?.toFixed(1) || '3.4'} km to destination</p>
                </div>
              </div>

              {/* Journey Progress */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Order Journey</h3>
                <div className="relative flex justify-between">
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800" />
                  <div className="absolute top-5 left-0 w-1/3 h-0.5 bg-primary" />
                  
                  {/* Step 1: Accepted */}
                  <div className="relative flex flex-col items-center gap-3 z-10 bg-white dark:bg-slate-900 px-4">
                    <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Accepted</p>
                      <p className="text-[10px] text-slate-500">10:45 AM</p>
                    </div>
                  </div>

                  {/* Step 2: En Route */}
                  <div className="relative flex flex-col items-center gap-3 z-10 bg-white dark:bg-slate-900 px-4">
                    <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">En Route</p>
                      <p className="text-[10px] text-primary font-bold">In Progress</p>
                    </div>
                  </div>

                  {/* Step 3: At Location */}
                  <div className="relative flex flex-col items-center gap-3 z-10 bg-white dark:bg-slate-900 px-4">
                    <div className={`size-10 rounded-full flex items-center justify-center border-2 ${
                      hasArrived 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold uppercase ${hasArrived ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>At Location</p>
                      <p className={`text-[10px] ${hasArrived ? 'text-primary font-bold' : 'text-slate-400'}`}>{hasArrived ? 'Arrived' : 'Pending'}</p>
                    </div>
                  </div>

                  {/* Step 4: Service */}
                  <div className="relative flex flex-col items-center gap-3 z-10 bg-white dark:bg-slate-900 px-4">
                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase">Service</p>
                      <p className="text-[10px] text-slate-400">Next Step</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Order Details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Customer Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="size-16 rounded-xl">
                    <AvatarImage src={booking.customer_avatar} />
                    <AvatarFallback>{booking.customer_name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{booking.customer_name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold">{booking.customer_rating?.toFixed(1)}</span>
                      <span className="text-xs text-slate-500 font-normal">({booking.customer_orders_count} orders)</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCallCustomer}
                    className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                  <button
                    onClick={handleMessageCustomer}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Order Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
                        <WaterDrop className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Equipment</p>
                        <p className="text-sm font-bold">{booking.equipment}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Units</p>
                      <p className="text-sm font-bold">{booking.quantity} Unit{booking.quantity > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold">Payment Method</p>
                    </div>
                    <span className="text-sm font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">Cash</span>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Earnings</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">${booking.estimated_fare?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-right pb-1">
                      <p className="text-[10px] text-green-600 font-bold">+$12.00 Tip included</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrived Button */}
              <Button
                onClick={handleArrived}
                disabled={hasArrived}
                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all ${
                  hasArrived
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-primary hover:bg-blue-700 shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {hasArrived ? '✓ ARRIVED' : 'I HAVE ARRIVED'}
              </Button>

              {/* Destination Address */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Destination Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{booking.location}</p>
                    {booking.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">"{booking.notes}"</p>
                    )}
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
