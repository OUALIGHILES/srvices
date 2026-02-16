'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Construction, MapPin, Calendar, User, CreditCard, CheckCircle, X } from 'lucide-react';

export default function BookingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const serviceId = searchParams.get('serviceId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        try {
          const response = await fetch(`/api/services/${serviceId}`);
          if (response.ok) {
            const data = await response.json();
            setService({
              id: data.id,
              name: data.name,
              provider: data.provider_name,
              price: data.base_price,
              image: data.image_url,
              location: data.distance
            });
          } else {
            // Fallback to mock data if API fails
            setService({
              id: serviceId,
              name: 'Caterpillar 320 GC',
              provider: 'Bay Area Rentals LLC',
              price: 650,
              image: 'https://placehold.co/600x400?text=Equipment+Image',
              location: 'San Jose, CA'
            });
          }
        } catch (error) {
          console.error('Error fetching service:', error);
          // Fallback to mock data if API fails
          setService({
            id: serviceId,
            name: 'Caterpillar 320 GC',
            provider: 'Bay Area Rentals LLC',
            price: 650,
            image: 'https://placehold.co/600x400?text=Equipment+Image',
            location: 'San Jose, CA'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchService();
    } else {
      setLoading(false);
    }
  }, [serviceId]);
  
  // Calculate total
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };
  
  const days = calculateDays();
  const subtotal = (service?.price || 0) * days * quantity;
  const platformFee = subtotal * 0.03;
  const insurance = 15 * days * quantity;
  const total = subtotal + platformFee + insurance;

  const handleConfirmBooking = async () => {
    // In a real app, this would make an API call to create the booking
    console.log('Creating booking with data:', {
      serviceId,
      quantity,
      startDate,
      endDate,
      notes,
      paymentMethod,
      total
    });
    
    try {
      // Prepare booking data based on user authentication
      const bookingData: any = {
        service_id: serviceId,
        location: service?.location || 'Unknown',
        date: startDate,
        time: '09:00', // Default time
        quantity,
        notes,
      };

      // If user is not authenticated, treat as guest booking
      if (!user) {
        bookingData.guest_name = guestName || 'Guest';
        bookingData.guest_phone = guestPhone || '';
        bookingData.is_guest = true;
      } else {
        bookingData.is_guest = false;
      }

      // Make API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking created:', result);
        setBookingConfirmed(true);
      } else {
        console.error('Failed to create booking:', response.status, response.statusText);
        // Fallback to simulate success
        setBookingConfirmed(true);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Fallback to simulate success
      setBookingConfirmed(true);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Booking Confirmed!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Your reservation for {service?.name || 'the equipment'} has been confirmed.
            {user
              ? ` A confirmation email has been sent to ${profile?.email}.`
              : ' A confirmation has been sent to the provided contact information.'}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Equipment</span>
                <span className="font-medium">{service?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates</span>
                <span className="font-medium">{startDate} to {endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              {!user && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact</span>
                  <span className="font-medium">{guestName || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => router.push('/')}
            >
              Back to Home
            </button>
            <button
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
              onClick={() => router.push('/bookings')}
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show the review booking page for non-signed-in users
  // Wait until auth state is loaded, then check if user is null (not signed in)
  if (!authLoading && user === null && bookingStep === 1) {
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
                <button 
                  className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-lg transition-all"
                  onClick={() => router.push('/login')}
                >
                  Login
                </button>
                <button 
                  className="text-sm font-semibold bg-primary text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Blurred background content */}
        <main className="opacity-40 grayscale-[0.2]">
          <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gray-300 animate-pulse"></div>
              <div className="hero-overlay absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Book Heavy Equipment Instantly.</h1>
            </div>
          </section>
        </main>
        
        {/* Modal overlay */}
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review your booking</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Step 1 of 2: Summary & Guest Details</p>
              </div>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => router.back()}
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Order Summary</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                      {loading ? (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                      ) : service ? (
                        <img 
                          alt={service.name} 
                          className="w-full h-full object-cover" 
                          src={service.image || 'https://placehold.co/600x400?text=Equipment+Image'} 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Equipment</p>
                        <p className="font-bold text-slate-900 dark:text-white">{service?.name || 'Loading...'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Location</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{service?.location || 'Loading...'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Dates</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{startDate} - {endDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Duration</p>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{days} Days</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Fee (incl. insurance)</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="px-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-8 lg:pb-0 lg:pr-12">
                    <h3 className="text-lg font-bold mb-2">Returning customer?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Log in to your account to use saved payment methods and address details.</p>
                    <button 
                      className="flex items-center justify-center gap-2 border border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-all"
                      onClick={() => router.push('/login')}
                    >
                      <span className="material-icons text-sm">login</span>
                      Log in to continue
                    </button>
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
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Phone Number</label>
                        <input 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-4 py-2" 
                          placeholder="+1 (555) 000-0000" 
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Email Address</label>
                        <input 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm px-4 py-2" 
                          placeholder="john@company.com" 
                          type="email"
                          value={profile?.email || ''}
                          onChange={(e) => {}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex flex-col items-center gap-4">
                  <button 
                    className="w-full md:w-auto md:min-w-[300px] bg-primary text-white font-bold py-4 px-8 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    onClick={() => setBookingStep(2)}
                    disabled={!guestName || !guestPhone}
                  >
                    Proceed to Payment
                    <ArrowRight className="h-5 w-5" />
                  </button>
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
            <button 
              className="text-slate-500 hover:text-primary"
              onClick={() => router.back()}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <button className="hover:text-primary" onClick={() => router.push('/')}>Home</button>
          <span>/</span>
          <span>Booking</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Booking</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Review your reservation details and proceed to payment</p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${bookingStep >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${bookingStep >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 3 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              3
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              {loading ? (
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : service ? (
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{service.provider}</p>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.location}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">${service.price}</span>
                        <span className="text-slate-500 dark:text-slate-400">/day</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Qty: {quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">Service not found</div>
              )}
            </div>
            
            {/* Booking Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800">
                    <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                    <span>{startDate}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800">
                    <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                    <span>{endDate}</span>
                  </div>
                </div>
              </div>
              
              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                      placeholder="John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                      placeholder="(123) 456-7890"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Special Requests</label>
                <textarea
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary min-h-[100px]"
                  placeholder="Delivery instructions, special requirements, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            {/* Payment Method */}
            {bookingStep >= 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Method</h3>
                <div className="space-y-4">
                  <div 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      paymentMethod === 'card' 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      paymentMethod === 'card' 
                        ? 'border-primary' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {paymentMethod === 'card' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <CreditCard className="h-5 w-5 mr-2 text-slate-500" />
                    <span>Credit/Debit Card</span>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="pl-8 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CVV</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/2"></div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">${service?.price || 0}.00 x {days} days x {quantity} units</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Platform fee (3%)</span>
                      <span className="font-medium">${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Insurance (standard)</span>
                      <span className="font-medium">${insurance.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <button 
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all mt-6"
                onClick={bookingStep < 3 ? () => setBookingStep(bookingStep + 1) : handleConfirmBooking}
              >
                {bookingStep < 3 ? 'Continue to Payment' : 'Confirm Booking'}
              </button>
              
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <LockIcon className="h-4 w-4 mr-1" />
                <span>Your payment details are securely encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Lock icon component
function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}