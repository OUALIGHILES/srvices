'use client';

import React, { useState, useEffect, createElement } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { 
  Search, 
  Bell,
  LayoutDashboard, 
  Clipboard, 
  DollarSign, 
  Users, 
  Car, 
  Square, 
  CreditCard, 
  Settings,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Truck,
  ShoppingCart,
  Leaf,
  Package
} from 'lucide-react';

// Define interfaces
interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'customer' | 'driver' | 'admin';
  status: 'active' | 'suspended' | 'pending_approval';
  created_at: string;
}

interface Driver {
  id: string;
  full_name: string;
  status: 'active' | 'inactive' | 'on_break';
}

interface Service {
  id: string;
  name: string;
  category: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            customer_id,
            service_id,
            status,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (!bookingsError && bookingsData) {
          setBookings(bookingsData);
        }

        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('users')
          .select('id, full_name, status')
          .eq('user_type', 'driver');

        if (!driversError && driversData) {
          setDrivers(driversData);
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, category');

        if (!servicesError && servicesData) {
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Get current bookings for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  // Get driver name by ID
  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : 'Unassigned';
  };

  // Get service name by ID
  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  // Get service icon based on category
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ride share':
        return Car;
      case 'express delivery':
        return Truck;
      case 'grocery haul':
        return ShoppingCart;
      case 'eco ride':
        return Leaf;
      default:
        return Package;
    }
  };

  // Get status color classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'ongoing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispatch Master</h1>
          <p className="text-slate-500 text-sm">Manage and assign live orders across all service categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Assignment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentBookings.map((booking) => {
                const customerInitials = 'CS'; // Would come from customer data
                const service = services.find(s => s.id === booking.service_id);
                const serviceName = service ? service.name : 'Unknown Service';
                const serviceCategory = service ? service.category : 'ride share';
                
                return (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{booking.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {customerInitials}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Customer Name</p>
                          <p className="text-[10px] text-slate-500">Premium Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary w-full max-w-[200px] py-1.5 px-2 appearance-none">
                          <option value="">Unassigned</option>
                          {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.full_name} ({driver.status})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {React.createElement(getServiceIcon(serviceCategory), { className: "h-4 w-4 text-slate-400" })}
                        <span className="text-sm">{serviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">-</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, bookings.length)} of {bookings.length} orders</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 text-xs font-medium rounded border ${
                  currentPage === index + 1 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}