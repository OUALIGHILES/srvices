'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase';
import { Construction, Close } from 'lucide-react';
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

export default function ReviewBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: ''
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
          time: parsed.time || '09:00',
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

  const handleGuestDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = () => {
    // Store guest details in localStorage for the payment page
    if (guestDetails.fullName && guestDetails.phoneNumber && guestDetails.email) {
      const guestData = {
        fullName: guestDetails.fullName,
        phoneNumber: guestDetails.phoneNumber,
        email: guestDetails.email
      };
      localStorage.setItem(`guest_details_${serviceId}`, JSON.stringify(guestData));
      router.push(`/booking/${serviceId}/payment`);
    } else {
      alert('Please fill in all guest details');
    }
  };

  // If user is logged in, redirect to the payment page
  if (user) {
    router.push(`/booking/${serviceId}/payment`);
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Redirecting to payment...</h2>
          <p className="text-slate-600">You are logged in. Redirecting to payment page.</p>
        </div>
      </div>
    );
  }

  // If service is loading, show a loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="w-full bg-white/80 dark:bg-background-dark/80 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Construction className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">EquipFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-semibold text-primary px-4 py-2">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm font-semibold bg-primary text-white px-6 py-2 rounded-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Blurred background content */}
      <main className="opacity-40 grayscale-[0.2]">
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              alt="Heavy Machinery Hero" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAadPQdqB6hQ4-k1xLiW_5-cBhU5aRDZxTfNBALS45Tv0Yx16FIqkBzfUlgG0q_MNOkdWIw98ruJHJJKeBtO1nglMkrXl9yKVKBIvE91CgduzkJFfgMntUt2ttXzRzK1LoxJeVfuDu88GVM53x6HrmtSXaxcnM76iwuCz1SnK3UgM5Lx3x_xBsT454RfIjKF6GylJrBQG7dsq3Oxarfmb8JVCdOLQGa3hGUySxKi4t8PZHZBGRDcWZXuWcWsYc0gBstiMhHKVZzVUo"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Book Heavy Equipment Instantly.</h1>
          </div>
        </section>
      </main>

      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review your booking</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Step 1 of 2: Summary & Guest Details</p>
            </div>
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => router.back()}
            >
              <Close className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Order Summary</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
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
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">Equipment</p>
                      <p className="font-bold text-slate-900 dark:text-white">{service?.name || 'Equipment Name'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">Location</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{bookingData.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">Dates</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase">Duration</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{bookingData.duration} Days</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Fee (incl. insurance)</span>
                  <span className="text-2xl font-bold text-primary">${expectedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-8 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-8 lg:pb-0 lg:pr-12">
                  <h3 className="text-lg font-bold mb-2">Returning customer?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Log in to your account to use saved payment methods and address details.
                  </p>
                  <Link href={`/login?redirectTo=/booking/${serviceId}/review`} className="w-full">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 border border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-all">
                      <Construction className="h-4 w-4" />
                      Log in to continue
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Continue as guest</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-4 py-2"
                        placeholder="John Doe"
                        type="text"
                        name="fullName"
                        value={guestDetails.fullName}
                        onChange={handleGuestDetailsChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Phone Number</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-4 py-2"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                        name="phoneNumber"
                        value={guestDetails.phoneNumber}
                        onChange={handleGuestDetailsChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Email Address</label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-4 py-2"
                        placeholder="john@company.com"
                        type="email"
                        name="email"
                        value={guestDetails.email}
                        onChange={handleGuestDetailsChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button 
                  className="w-full md:w-auto md:min-w-[300px] bg-primary text-white font-bold py-4 px-8 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="m5 12 7-7 7 7" />
                    <path d="M12 19V5" />
                  </svg>
                </Button>
                <p className="text-[10px] text-slate-400 text-center max-w-sm">
                  By proceeding, you agree to EquipFlow's Rental Terms and Privacy Policy.
                  A temporary authorization hold may be applied to your card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}