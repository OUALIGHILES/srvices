'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Bell,
  Star,
  MapPin,
  DollarSign,
  Filter,
  ChevronDown,
  Zap,
  Car,
  Package,
  Truck,
  Navigation,
  History,
  User,
  Grid3x3,
  Map as MapIcon,
  CreditCard
} from 'lucide-react';
import { Inter } from 'next/font/google';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

interface Booking {
  id: string;
  service_id: string;
  location: string;
  service_date: string;
  quantity: number;
  customer_id: string;
  status: string;
  customer_name?: string;
  customer_rating?: number;
  distance?: number;
  estimated_fare?: number;
  service_type?: string;
}

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState({
    todayEarnings: 0,
    jobsCompleted: 0,
    rating: 0,
    name: '',
    avatar: '',
  });
  
  const { user, profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch bookings available for the driver
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id, 
            service_id, 
            location, 
            service_date, 
            quantity, 
            customer_id, 
            status,
            customers (full_name)
          `)
          .neq('status', 'completed')
          .neq('status', 'cancelled')
          .limit(10);

        if (bookingsError) throw bookingsError;

        // Format the bookings data
        const formattedBookings = bookingsData?.map(booking => ({
          ...booking,
          customer_name: booking.customers?.full_name || 'Customer',
        })) || [];

        setBookings(formattedBookings);

        // Fetch driver statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('driver_amount')
          .eq('driver_id', user.id)
          .gte('created_at', today.toISOString())
          .eq('status', 'completed');

        if (transactionsError) throw transactionsError;

        const todayEarnings = transactionsData?.reduce((sum, t) => sum + (t.driver_amount || 0), 0) || 0;

        // Get completed jobs count for today
        const { count: completedCount, error: completedError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', user.id)
          .eq('status', 'completed')
          .gte('updated_at', today.toISOString());

        if (completedError) throw completedError;

        setDriverStats({
          todayEarnings,
          jobsCompleted: completedCount || 0,
          rating: profile?.rating || 0,
          name: profile?.full_name || 'Driver',
          avatar: profile?.avatar_url || '',
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased ${inter.className}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased ${inter.className}`}>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <main className="flex-1 flex max-w-[1440px] mx-auto w-full px-6 lg:px-10 py-8 gap-8">
          {/* Sidebar */}
          <aside className="hidden xl:flex flex-col gap-6 w-72 shrink-0">
            {/* Driver Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="size-12">
                  <AvatarImage src={driverStats.avatar} />
                  <AvatarFallback>{driverStats.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{driverStats.name}</h3>
                  <div className="flex items-center text-xs text-slate-500">
                    <Star className="h-3 w-3 text-blue-500 fill-current" />
                    <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300">{driverStats.rating.toFixed(1)}</span>
                    <span className="mx-1">•</span>
                    <span>Driver</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Today's Earnings</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">${driverStats.todayEarnings.toFixed(2)}</span>
                    <span className="text-xs text-green-500 font-medium">+12%</span>
                  </div>
                </div>
                <div className="flex flex-col p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Jobs Completed</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{driverStats.jobsCompleted}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 15 goal</span>
                  </div>
                </div>
              </div>
              <button
                className={`w-full mt-6 py-3 rounded-lg text-sm font-bold transition-colors tracking-wide ${
                  isOnline
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
                    : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400'
                }`}
                onClick={() => setIsOnline(!isOnline)}
              >
                {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
              </button>
            </div>

            {/* Map Mini View */}
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="h-40 bg-slate-200 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale opacity-50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCphX_ESPB9TeoR0M_Nu0cMEYDrBMnaTCZBJcHdtYBw3ChXMzHT3QxajJGbQipYrFbuEVaD5A7gvEVtmb1mFc5j1dzu6o8aByWjMPmy5ZQ2f0PU1FtgyjG_xBrJ5K9XEOiMDbepfUNwchfmreEnYfZEPHubxwg_SqvphZg64VM5as5jFsbi_O1cZGbXI_1hIWsjYa4q-Id-WOOh45W-ttcvXtJhA8Y5KEW4QMXqeirj1eP4CJw7KRIhOCV-r-kHji44bA4X9-Zwafs"
                  alt="Abstract urban city map layout"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></div>
                    <div className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-white"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 font-medium">Location: {profile?.location || 'Downtown Hub'}</p>
                <p className="text-xs text-slate-400 mt-1 italic">3 high-demand areas nearby</p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Available Requests</h1>
                <p className="text-slate-500 text-sm">Real-time orders within 10km of your current location</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4" />
                  &lt; 5km
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Filter className="h-4 w-4" />
                  All Services
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active Requests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative group"
                  >
                    <div className="absolute top-0 right-0 p-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Offer
                      </span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary">
                        <Car className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start pr-16">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{booking.customer_name}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Service Request</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">2.4 km <span className="text-slate-400 font-normal">away</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-sm font-bold">${booking.estimated_fare || '12.50'} est.</span>
                          </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-sm active:scale-[0.98]">
                            ACCEPT
                          </button>
                          <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold py-3 rounded-lg transition-all">
                            DECLINE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 mb-4">No available requests at the moment</p>
                  <p className="text-gray-500 text-sm">Check back later for new orders</p>
                </div>
              )}
            </div>

            {/* Load More or Status info */}
            <div className="flex flex-col items-center justify-center py-10 border-t border-slate-200 dark:border-slate-800">
              <div className="animate-pulse flex items-center gap-2 text-slate-400 text-sm font-medium">
                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                Scanning for more requests...
              </div>
            </div>
          </div>

          {/* Secondary Sidebar: Only visible on extra wide screens or desktop */}
          <aside className="hidden 2xl:flex flex-col gap-6 w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Area Hotspots</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Airport Terminal</span>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 text-[10px] font-bold rounded">VERY HIGH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Shopping District</span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] font-bold rounded">HIGH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Business Park</span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-600 text-[10px] font-bold rounded">NORMAL</span>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
              <h4 className="text-sm font-bold text-primary mb-2">Weekend Bonus</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Complete 5 more rides by 10 PM to earn an extra <strong>$25.00</strong>!</p>
              <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[80%] rounded-full"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-400">10/15 rides</span>
              </div>
            </div>
          </aside>
        </main>

        {/* Mobile Navigation (Sticky Bottom) */}
        <nav className="md:hidden sticky bottom-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center py-3">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Grid3x3 className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">Requests</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">History</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <DollarSign className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">Earnings</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}