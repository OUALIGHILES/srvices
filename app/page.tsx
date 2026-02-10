'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Star, Heart, MapPin, Filter, Search, SlidersHorizontal, ChevronDown, ChevronUp, Wrench, Wallet, Languages, Map as MapIcon, Building, Droplets, Mountain, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HomeHeader } from '@/components/home-header';

// Define types
interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  base_price: number;
  price_type: 'fixed' | 'hourly' | 'per_unit';
  rating?: number;
  review_count?: number;
  provider_name?: string;
  distance?: string;
  is_instant_booking?: boolean;
  is_available_today?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { id: 'heavy_equipment', name: 'Heavy Equipment', icon: 'wrench' },
  { id: 'water_tanks', name: 'Water Tanks', icon: 'droplets' },
  { id: 'sand_materials', name: 'Sand & Materials', icon: 'mountain' },
  { id: 'labor_hire', name: 'Labor Hire', icon: 'users' },
];

export default function Home() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('heavy_equipment');
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('Riyadh, Saudi Arabia');
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 5000]);
  const [instantBooking, setInstantBooking] = useState(true);
  const [availableToday, setAvailableToday] = useState(false);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedLocation('Riyadh, Saudi Arabia');
    setPriceRange([500, 5000]);
    setInstantBooking(true);
    setAvailableToday(false);
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          category: selectedCategory,
          limit: '12',
          offset: offset.toString(),
        });

        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Add filter parameters
        params.append('location', selectedLocation);
        params.append('min_price', priceRange[0].toString());
        params.append('max_price', priceRange[1].toString());
        params.append('instant_booking', instantBooking.toString());
        params.append('available_today', availableToday.toString());

        const response = await fetch(`/api/services?${params}`);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            errorData = { error: 'Non-JSON error response', status: response.status };
          }
          
          console.error('Failed to fetch services:', errorData);
          setServices([]);
          setHasMore(false);
          return;
        }
        
        let data: Service[];
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          setServices([]);
          setHasMore(false);
          return;
        }

        if (Array.isArray(data)) {
          if (offset === 0) {
            setServices(data);
          } else {
            setServices(prev => [...prev, ...data]);
          }
          // Check if we got fewer results than requested, meaning no more data
          setHasMore(data.length === 12);
        } else {
          console.error('Invalid data format received from API:', data);
          setServices([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery, selectedLocation, priceRange, instantBooking, availableToday, offset]);

  // Handle search
  const handleSearch = () => {
    setOffset(0); // Reset pagination when searching
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setOffset(0); // Reset pagination when changing category
  };

  // Handle location change
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setOffset(0); // Reset pagination when changing location
  };

  // Handle price range change
  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setOffset(0); // Reset pagination when changing price range
  };

  // Handle instant booking change
  const handleInstantBookingChange = (checked: boolean) => {
    setInstantBooking(checked);
    setOffset(0); // Reset pagination when changing instant booking
  };

  // Handle available today change
  const handleAvailableTodayChange = (checked: boolean) => {
    setAvailableToday(checked);
    setOffset(0); // Reset pagination when changing available today
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        <HomeHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-10 py-8">
          {/* Hero Search Section */}
          <section className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              Find the right service for your project
            </h1>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <input
                className="block w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-900 border-none rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none text-lg transition-all"
                placeholder="Search for bulldozers, water tanks, sand types..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </section>

          {/* Category Ribbon */}
          <section className="mb-8 overflow-x-auto">
            <div className="flex items-center justify-center gap-4 min-w-max pb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold transition-all'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-600 dark:text-slate-400 font-bold transition-all'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.icon === 'wrench' && <Wrench className="h-5 w-5" />}
                  {category.icon === 'droplets' && <Droplets className="h-5 w-5" />}
                  {category.icon === 'mountain' && <Mountain className="h-5 w-5" />}
                  {category.icon === 'users' && <Users className="h-5 w-5" />}
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" /> Filters
                </h3>
                
                {/* Location Filter */}
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 block">
                    Project Location
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary appearance-none"
                      value={selectedLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                    >
                      <option>Riyadh, Saudi Arabia</option>
                      <option>Jeddah, KSA</option>
                      <option>Dammam, KSA</option>
                      <option>NEOM District</option>
                    </select>
                    <ChevronDown className="h-5 w-5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Price Range (SR)
                    </label>
                    <span className="text-xs font-bold text-primary">{priceRange[0]} - {priceRange[1]}+</span>
                  </div>
                  <div className="mt-4">
                    <Slider
                      defaultValue={[500, 5000]}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={(value) => handlePriceRangeChange(value as [number, number])}
                      value={priceRange}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Availability */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 block">
                    Availability
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-transparent"
                        checked={instantBooking}
                        onChange={(e) => handleInstantBookingChange(e.target.checked)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">Instant Booking</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-transparent"
                        checked={availableToday}
                        onChange={(e) => handleAvailableTodayChange(e.target.checked)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">Available Today</span>
                    </label>
                  </div>
                </div>
                <button 
                  className="w-full mt-8 py-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase border-t border-slate-100 dark:border-slate-800 pt-4"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
              
              {/* Map Preview Card */}
              <div className="bg-slate-200 dark:bg-slate-800 h-40 rounded-xl relative overflow-hidden group shadow-sm">
                <img 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJDqPg52nvbry_lHaaGbwaBiDVNtK_qNhOLYzGzdb_bsBBw481eOYBQZNL6J_ufSvZCoZGBrRIwhwXmEEmryPzDdZKjDlQM8TeE5qLlXZ78dBF_kSThGCZ7j_3otSG0myU-OVuIMV-nOz96t1WtUJXqNkAUZjXtN_aruMLkuDT_Fu60-4TbeGjYgaU8rcm-k5eejh_eC6sA-uGKRkBh84LGt7zU4Gvj1-WFgdSJkQz4QWAWwUevpbM-kI_vJwdxwAh1sKEdjBCkPM" 
                  alt="Map view of Riyadh" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2">
                    <MapIcon className="h-4 w-4" />
                    Show Map View
                  </button>
                </div>
              </div>
            </aside>

            {/* Service Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-slate-400 text-sm font-normal ml-2">
                    ({services.length} results)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Sort by:</span>
                  <button className="text-sm font-bold flex items-center gap-1">
                    Popularity <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                      <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="p-5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      </div>
                    </div>
                  ))
                ) : services.length > 0 ? (
                  services.map((service) => (
                  <div
                    key={service.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4">
                      <img
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                        src={service.image_url || '/placeholder-image.jpg'}
                        alt={service.name}
                      />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase">
                        {(service.is_instant_booking !== undefined ? service.is_instant_booking : false) ? 'Instant' : 'Scheduled'}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full shadow-sm text-slate-400 hover:text-red-500 cursor-pointer">
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{service.name}</h3>
                        <div className="flex items-center gap-1 text-blue-500">
                          <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                          <span className="text-xs font-bold">{service.rating || 0}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{service.provider_name || 'Service Provider'}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{service.distance || 'Within 20km'}</span>
                      </div>
                      <div className="flex items-end justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Starting from
                          </p>
                          <p className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(service.base_price)}{' '}
                            <span className="text-sm font-bold">
                              SR/{service.price_type === 'per_unit' ? 'Day' : service.price_type === 'hourly' ? 'Hour' : 'Trip'}
                            </span>
                          </p>
                        </div>
                        <Button
                          className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
                          onClick={() => router.push(`/services/${service.id}`)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500">No services found in this category</p>
                </div>
              )}
              </div>
              
              {/* Load More Button */}
              <div className="mt-12 flex justify-center">
                <button 
                  className={`px-8 py-3 font-bold rounded-xl transition-colors ${
                    hasMore 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                  onClick={() => setOffset(prev => prev + 12)}
                  disabled={!hasMore || loading}
                >
                  {loading ? 'Loading...' : hasMore ? 'Load More Items' : 'No More Items'}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-10 mt-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <Building className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-400">© 2024 ServiceHailing KSA. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
