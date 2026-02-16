/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Share, Heart, Calendar, Verified, Construction, ChevronRight, ArrowRight, ShieldCheck, Zap, UserRound } from 'lucide-react';
import { useServiceById } from '@/hooks/useServiceById';

export default function EquipmentDetailsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  
  const { service, loading, error } = useServiceById(serviceId);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('2024-11-20');
  const [endDate, setEndDate] = useState('2024-11-23');

  // Calculate rental cost
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays();
  const subtotal = service ? service.base_price * days * quantity : 0;
  const platformFee = subtotal * 0.03;
  const insurance = 15 * days * quantity; // $15 per day per unit
  const total = subtotal + platformFee + insurance;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-red-500">Error loading service: {error}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-slate-500">Service not found</p>
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
              <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => router.push('/')}>Home</button>
              <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => router.push('/categories')}>Categories</button>
              <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => router.push('/pricing')}>Pricing</button>
              <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => router.push('/solutions')}>Solutions</button>
              <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => router.push('/support')}>Support</button>
            </nav>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-6 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex items-center space-x-2">
            <li><button className="hover:text-primary" onClick={() => router.push('/')}>Home</button></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li><button className="hover:text-primary" onClick={() => router.push('/categories')}>Heavy Equipment</button></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li><button className="hover:text-primary" onClick={() => router.push('/categories/excavators')}>Excavators</button></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-slate-900 dark:text-white">{service.name}</li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{service.name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 text-slate-300" />
                      <span className="ml-1 text-sm font-bold text-slate-900 dark:text-white">4.8</span>
                      <span className="ml-1 text-sm text-slate-500">(124 reviews)</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      {service.distance || 'San Jose, CA'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Share className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </button>
                  <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Heart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
                <div className="col-span-4 md:col-span-3 row-span-2 relative group cursor-pointer overflow-hidden">
                  <img 
                    alt={`Main View ${service.name}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={service.image_url || 'https://placehold.co/600x400'} 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                  <img 
                    alt="Side View" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    src="https://placehold.co/300x200" 
                  />
                </div>
                <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
                  <img 
                    alt="Dashboard/Controls" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    src="https://placehold.co/300x200" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm">+12 photos</span>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="border-b border-slate-200 dark:border-slate-800">
              <nav className="flex space-x-8">
                <button className="border-b-2 border-primary py-4 px-1 text-sm font-semibold text-primary" onClick={() => document.getElementById('overview')?.scrollIntoView({behavior: 'smooth'})}>Overview</button>
                <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300" onClick={() => document.getElementById('specifications')?.scrollIntoView({behavior: 'smooth'})}>Specifications</button>
                <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300" onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior: 'smooth'})}>Reviews</button>
                <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300" onClick={() => document.getElementById('vendor')?.scrollIntoView({behavior: 'smooth'})}>Vendor</button>
              </nav>
            </div>
            
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>{service.description || `The ${service.name} is a versatile piece of equipment perfect for medium-duty applications and construction site earthmoving. This machine is maintained according to strict factory standards and comes with a full tank of fuel upon delivery.`}</p>
                <p className="mt-4">Equipped with advanced technology features, it helps you increase operator efficiency. This machine is maintained according to strict factory standards and comes with a full tank of fuel upon delivery.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-primary mb-2">⚡</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Engine Power</div>
                  <div className="font-bold">143 HP</div>
                </div>
                <div className="text-center">
                  <div className="text-primary mb-2">⚖️</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Weight</div>
                  <div className="font-bold">48,281 lb</div>
                </div>
                <div className="text-center">
                  <div className="text-primary mb-2">📏</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Max Dig Depth</div>
                  <div className="font-bold">21.8 ft</div>
                </div>
                <div className="text-center">
                  <div className="text-primary mb-2">⛽</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Fuel Type</div>
                  <div className="font-bold">Diesel</div>
                </div>
              </div>
            </section>
            
            <section id="specifications" className="scroll-mt-24 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Engine Model</span>
                  <span className="font-medium text-slate-900 dark:text-white">Cat C4.4 ACERT</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Net Power (ISO 9249)</span>
                  <span className="font-medium text-slate-900 dark:text-white">107 kW</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Operating Weight</span>
                  <span className="font-medium text-slate-900 dark:text-white">21,900 kg</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Max Digging Depth</span>
                  <span className="font-medium text-slate-900 dark:text-white">6,630 mm</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Bucket Capacity Range</span>
                  <span className="font-medium text-slate-900 dark:text-white">1.38 m³</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Travel Speed - Maximum</span>
                  <span className="font-medium text-slate-900 dark:text-white">5.4 km/h</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Swing Torque</span>
                  <span className="font-medium text-slate-900 dark:text-white">74 kN·m</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500">Hydraulic System Flow</span>
                  <span className="font-medium text-slate-900 dark:text-white">429 L/min</span>
                </div>
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-3xl font-bold text-primary">${service.base_price}</span>
                    <span className="text-slate-500 ml-1">/ day</span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    <Zap className="h-3 w-3 mr-1" />
                    Instantly Available
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rental Period</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-sm text-slate-400 h-4 w-4" />
                        <input 
                          className="w-full pl-9 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary" 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-sm text-slate-400 h-4 w-4" />
                        <input 
                          className="w-full pl-9 py-2.5 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary" 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden w-32 dark:bg-slate-950">
                      <button 
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        className="w-12 h-10 text-center border-none bg-transparent focus:ring-0 text-sm font-bold" 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">${service.base_price}.00 x {days} days x {quantity} units</span>
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
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold">Expected Total</span>
                      <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 mt-4" 
                    type="button"
                    onClick={() => {
                      // Navigate to booking page with service details
                      router.push(`/booking?serviceId=${encodeURIComponent(service.id || '')}&quantity=${quantity}&startDate=${startDate}&endDate=${endDate}`);
                    }}
                  >
                    Reserve Equipment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-widest font-medium">You won't be charged yet</p>
                </form>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{service.provider_name || 'Bay Area Rentals LLC'}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-primary" /> Verified Fleet Provider
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <section className="mt-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold">Similar Equipment Nearby</h2>
            <button className="text-primary font-semibold text-sm hover:underline" onClick={() => router.push('/categories/excavators')}>
              View all excavators
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => router.push(`/details/${item}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    alt="Equipment" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    src={`https://placehold.co/400x300?text=Equipment+${item}`} 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {item === 1 ? 'Verified Vendor' : item === 2 ? 'Best Value' : 'High Demand'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Similar Excavator {item}</h3>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> San Jose, CA
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">${Math.floor(Math.random() * 200) + 500}</div>
                      <div className="text-slate-400 text-[10px] font-medium uppercase">per day</div>
                    </div>
                  </div>
                  <button 
                    className="w-full border border-primary text-primary py-2 rounded-lg font-bold hover:bg-primary/5 transition-all text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/details/${item}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Construction className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-primary">EquipFlow</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                The world's most trusted marketplace for heavy equipment and construction logistics. Managed fleet, guaranteed uptime.
              </p>
              <div className="flex gap-4">
                <a className="text-slate-400 hover:text-primary" href="https://facebook.com/equipflow" target="_blank" rel="noopener noreferrer">
                  <span className="text-xl">f</span>
                </a>
                <a className="text-slate-400 hover:text-primary" href="mailto:support@equipflow.com">
                  <span className="text-xl">@</span>
                </a>
                <a className="text-slate-400 hover:text-primary" href="https://equipflow.com" target="_blank" rel="noopener noreferrer">
                  <span className="text-xl">🌐</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/about')}>About Us</button></li>
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/careers')}>Careers</button></li>
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/contact')}>Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/help-center')}>Help Center</button></li>
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/fleet-partners')}>Fleet Partners</button></li>
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/blog')}>Blog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/privacy-policy')}>Privacy Policy</button></li>
                <li><button className="hover:text-primary text-left" onClick={() => router.push('/terms-of-service')}>Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm">
            <p>© 2024 EquipFlow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}