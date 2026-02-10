'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerHeader } from '@/components/customer-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  PlusCircle,
  Wrench,
  Droplets,
  Hammer,
  Truck,
  MessageCircle,
  MapPin,
  Eye,
  Download,
  RotateCcw
} from 'lucide-react';
import { useBookings, Booking } from '@/hooks/use-bookings';

export default function CustomerBookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState('last_30_days');
  
  const { bookings, loading, error, refetch } = useBookings();

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return booking.status === 'active';
    if (activeTab === 'pending') return booking.status === 'pending_offers';
    if (activeTab === 'completed') return booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  // Handle button actions
  const handleTrackOrder = (bookingId: string) => {
    console.log(`Tracking order: ${bookingId}`);
    // In a real app, this would navigate to a tracking page
  };

  const handleViewOffers = (bookingId: string) => {
    console.log(`Viewing offers for booking: ${bookingId}`);
    // In a real app, this would navigate to the offers page
    window.location.href = `/customer/bookings/${bookingId}/offers`;
  };

  const handleDownloadInvoice = (bookingId: string) => {
    console.log(`Downloading invoice for booking: ${bookingId}`);
    // In a real app, this would download the invoice
  };

  const handleRebook = (bookingId: string) => {
    console.log(`Rebooking service for booking: ${bookingId}`);
    // In a real app, this would initiate the rebooking process
    window.location.href = `/customer/bookings/${bookingId}/rebook`;
  };

  const handleSendMessage = (bookingId: string) => {
    console.log(`Sending message for booking: ${bookingId}`);
    // In a real app, this would open a chat interface
    window.location.href = `/customer/chat/${bookingId}`;
  };

  // Refresh bookings when needed
  useEffect(() => {
    if (!loading && !error) {
      // Additional logic can be added here if needed
    }
  }, [loading, error]);

  // Get icon component based on category
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'home_repair_service':
        return <Wrench className="h-6 w-6" />;
      case 'water_drop':
        return <Droplets className="h-6 w-6" />;
      case 'construction':
        return <Hammer className="h-6 w-6" />;
      case 'local_shipping':
        return <Truck className="h-6 w-6" />;
      default:
        return <Hammer className="h-6 w-6" />;
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="secondary">Active</Badge>;
      case 'pending_offers':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:border-blue-900 dark:text-blue-400">Pending Offers</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-gray-500 text-gray-600 dark:border-gray-700 dark:text-gray-400">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <CustomerHeader />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Button onClick={refetch}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <CustomerHeader />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_30_days">Last 30 days</SelectItem>
                      <SelectItem value="last_3_months">Last 3 months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 months</SelectItem>
                      <SelectItem value="custom_range">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Service Category</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="heavy-equipment" defaultChecked />
                      <label htmlFor="heavy-equipment" className="text-sm text-slate-700 dark:text-slate-300">Heavy Equipment</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="water-tanks" />
                      <label htmlFor="water-tanks" className="text-sm text-slate-700 dark:text-slate-300">Water Tanks</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="delivery-trucks" />
                      <label htmlFor="delivery-trucks" className="text-sm text-slate-700 dark:text-slate-300">Delivery Trucks</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="loaders-excavators" />
                      <label htmlFor="loaders-excavators" className="text-sm text-slate-700 dark:text-slate-300">Loaders & Excavators</label>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  setDateRange('last_30_days');
                  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if ((cb as HTMLInputElement).id !== 'heavy-equipment') {
                      (cb as HTMLInputElement).checked = false;
                    } else {
                      (cb as HTMLInputElement).checked = true;
                    }
                  });
                }}>
                  Reset Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage and track your service requests</p>
            </div>

            {/* Tab navigation */}
            <div className="mb-6 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 no-scrollbar">
              <button
                className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-bold ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium ${
                  activeTab === 'active'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button
                className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium ${
                  activeTab === 'pending'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Offers
              </button>
              <button
                className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button
                className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium ${
                  activeTab === 'cancelled'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled
              </button>
            </div>

            {/* Bookings list */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No bookings found. Create your first booking!</p>
                  <Button className="mt-4" asChild>
                    <Link href="/customer/services">Browse Services</Link>
                  </Button>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.id} className="p-6 transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-primary/10">
                          {getIconComponent(booking.category_icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{booking.service_name}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-slate-500">Booking ID: #{booking.booking_id} • {booking.booking_date}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 border-t pt-4 md:border-none md:pt-0">
                        {booking.driver && (
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs font-bold">{booking.driver.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{booking.driver.name}</p>
                              <p className="text-xs text-slate-500">Professional Operator</p>
                            </div>
                          </div>
                        )}

                        {booking.offers_count !== undefined && (
                          <div className="text-center sm:text-right">
                            <p className="text-sm font-bold text-green-600">{booking.offers_count} offers received</p>
                            <p className="text-xs text-slate-500">Starting from ${booking.price_from?.toFixed(2)}</p>
                          </div>
                        )}

                        {booking.cancellation_reason && (
                          <div className="text-sm text-slate-500 italic">Reason: {booking.cancellation_reason}</div>
                        )}

                        <div className="flex gap-2 w-full sm:w-auto">
                          {!booking.driver && !booking.offers_count && booking.status !== 'completed' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleSendMessage(booking.id)}>
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => handleTrackOrder(booking.id)}>
                                <MapPin className="h-4 w-4 mr-2" />
                                Track Order
                              </Button>
                            </>
                          )}

                          {booking.offers_count !== undefined && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleViewOffers(booking.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Offers
                            </Button>
                          )}

                          {booking.status === 'completed' && (
                            <div className="flex gap-3">
                              <Button variant="link" className="text-primary p-0 h-auto" onClick={() => handleDownloadInvoice(booking.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Invoice
                              </Button>
                              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                              <Button variant="link" className="text-primary p-0 h-auto" onClick={() => handleRebook(booking.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Rebook
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredBookings.length} of {bookings.length} bookings</span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={true}>Previous</Button>
                <Button variant="outline" disabled={true}>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}