'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Construction, Facebook, Mail, Globe, Menu, X as CloseIcon, MapPin, Heart, Weight, Droplets, Settings, ConstructionIcon, Bolt, BarChart3, Eye, BarChart3 as Monitoring } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CategoriesPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [brandFilters, setBrandFilters] = useState({
    caterpillar: false,
    komatsu: false,
    johnDeere: false,
    volvo: false
  });
  const [tonnageFilter, setTonnageFilter] = useState<string | null>(null);
  const [engineTypeFilters, setEngineTypeFilters] = useState({
    diesel: true,
    electric: false,
    propane: false
  });

  // Sample equipment data
  const equipmentList = [
    {
      id: '1',
      name: 'Caterpillar 320 GC',
      price: 650,
      location: 'San Jose, CA (12 mi)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqQlXvAK-J4zM1xlXFijzfv4MNF6HlKPGMkOaLPovGwk6VfAH_rx5uChJZy1PmW8r0kw2hyiCKLQRreqc3gi0fVgIqxpGp87dKPrGpeXBmz5eOJyhAtcSSsCTZtgE-QrpfxVJ87SaIm38apt2uVqGqCz3YRgVbhGeOhT1LxXLVCh20AdeS9MUcb6LWVRQT4T3rrX-eNcT3iU7SpxOizEVeGYaHYRm5DxvChewLZh0YxOVZUoCYSnw9Ue3ESgAmoy9eae0sRBKWB_Y',
      badges: [{ text: 'Available Now', type: 'available' }],
      specs: [
        { icon: Weight, label: '20 Tons' },
        { icon: Droplets, label: 'Diesel' },
        { icon: Settings, label: 'Tier 4 Final' },
        { icon: ConstructionIcon, label: 'Bucket included' }
      ]
    },
    {
      id: '2',
      name: 'Komatsu D61PXi-24',
      price: 820,
      location: 'Oakland, CA (24 mi)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoBOdrY80zOx9mC6azAcLs4Ni88BSp58ENNbrgERA3BJwEMjVjzaI6f03zztzCoOGNqHYAVQ__PA8JpXlSKTu0cOpx6fn9v5hhnjjFyhpibbGAh7F7Tc7NJxRKGeWxL9-oo4NlkEXIx5DQuoiZ95YxOPrOq1Zq1k-HrRhxsODzG0bXnB-CwOlVqtRQIkTAUrOPnp94U_rWKlF9GN86dKEvMOh6pc5Arjh2k8z0MciOz8YN8vTEElgsoVTr8PtP94priG9E9-EyQD4',
      badges: [{ text: 'Verified Vendor', type: 'verified' }],
      specs: [
        { icon: Bolt, label: '168 HP' },
        { icon: Droplets, label: 'Diesel' },
        { icon: BarChart3, label: 'iMC 2.0 Tech' },
        { icon: Settings, label: 'Hydrostatic' }
      ]
    },
    {
      id: '3',
      name: 'Deere 672G Grader',
      price: 550,
      location: 'Fremont, CA (30 mi)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAadPQdqB6hQ4-k1xLiW_5-cBhU5aRDZxTfNBALS45Tv0Yx16FIqkBzfUlgG0q_MNOkdWIw98ruJHJJKeBtO1nglMkrXl9yKVKBIvE91CgduzkJFfgMntUt2ttXzRzK1LoxJeVfuDu88GVM53x6HrmtSXaxcnM76iwuCz1SnK3UgM5Lx3x_xBsT454RfIjKF6GylJrBQG7dsq3Oxarfmb8JVCdOLQGa3hGUySxKi4t8PZHZBGRDcWZXuWcWsYc0gBstiMhHKVZzVUo',
      badges: [{ text: 'Fast Delivery', type: 'fast-delivery' }],
      specs: [
        { icon: Weight, label: '18 Tons' },
        { icon: Droplets, label: 'Diesel' },
        { icon: Settings, label: '6WD System' },
        { icon: Eye, label: 'Grade Control' }
      ]
    },
    {
      id: '4',
      name: 'Volvo L120H Loader',
      price: 490,
      location: 'Palo Alto, CA (18 mi)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5FVs5fwBUf9R60Y3PgmV3SjF0lyUq8TXOsmWqalhS1hiCVXtfrjt_qDhDar5JaLDLjcavStkZj8JJmgKnBJ_E7siv-gVpYkyHMd-ax16taTeb7mpf_xReFW5aFsonEAhgXjJHCf0EPtM1Uwfh9V5PneaGqiJnQFqRrqAOz-JNoXuFedRE_MELNt-45mzL1n3TkJmuFAwOYtI068-TWhQJz_30jg3_k5W53VsGAbiPJVrE7aVsXzlSn0qH2z16YrPyR7pDHVJzqXU',
      badges: [],
      specs: [
        { icon: Weight, label: '22 Tons' },
        { icon: Droplets, label: 'Diesel' },
        { icon: Settings, label: 'Stage V' },
        { icon: Monitoring, label: 'Telematics' }
      ]
    }
  ];

  // Handle brand filter changes
  const handleBrandChange = (brand: string) => {
    setBrandFilters(prev => ({
      ...prev,
      [brand]: !prev[brand as keyof typeof prev]
    }));
  };

  // Handle engine type filter changes
  const handleEngineTypeChange = (type: string) => {
    setEngineTypeFilters(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  // Handle tonnage filter
  const handleTonnageChange = (value: string) => {
    setTonnageFilter(tonnageFilter === value ? null : value);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Construction className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">EquipFlow</span>
            </div>
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/categories" className="text-sm font-medium text-primary transition-colors h-16 flex items-center border-b-2 border-primary">Categories</Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
              <Link href="/solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
              <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors">Support</Link>
            </nav>
            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <button className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="text-sm font-semibold bg-primary text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Sign Up
                </button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-slate-700 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col space-y-3 px-4">
                <Link href="/" className="font-medium text-primary py-2">Home</Link>
                <Link href="/categories" className="font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary py-2">Categories</Link>
                <Link href="/pricing" className="font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary py-2">Pricing</Link>
                <Link href="/solutions" className="font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary py-2">Solutions</Link>
                <Link href="/support" className="font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary py-2">Support</Link>
                
                <div className="pt-4 flex flex-col gap-3">
                  <Link href="/login">
                    <button className="w-full text-left text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="w-full text-left text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <nav className="flex text-sm text-slate-500 mb-2 gap-2">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">Heavy Equipment</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Heavy Equipment Rental</h1>
            <p className="text-slate-500 mt-1">Found 128 machines available for your current location.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 whitespace-nowrap">Sort by:</span>
            <Select>
              <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Most Popular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="low-high">Price: Low to High</SelectItem>
                <SelectItem value="high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-900 dark:text-white">Filters</h2>
                <button className="text-primary text-xs font-semibold hover:underline">Reset All</button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Price Range (Daily)</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <Input 
                        className="pl-7 pr-3 py-2 text-xs border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-md" 
                        type="text" 
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      />
                    </div>
                    <span className="text-slate-400 text-sm">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <Input 
                        className="pl-7 pr-3 py-2 text-xs border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-md" 
                        type="text" 
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Brand</h3>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={brandFilters.caterpillar}
                      onCheckedChange={() => handleBrandChange('caterpillar')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Caterpillar</span>
                  </Label>
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={brandFilters.komatsu}
                      onCheckedChange={() => handleBrandChange('komatsu')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Komatsu</span>
                  </Label>
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={brandFilters.johnDeere}
                      onCheckedChange={() => handleBrandChange('johnDeere')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>John Deere</span>
                  </Label>
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={brandFilters.volvo}
                      onCheckedChange={() => handleBrandChange('volvo')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Volvo</span>
                  </Label>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tonnage</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={tonnageFilter === '0-5' ? 'default' : 'outline'} 
                    size="sm"
                    className={`px-3 py-2 text-xs font-medium ${tonnageFilter === '0-5' ? 'bg-primary/10 border-primary text-primary' : ''}`}
                    onClick={() => handleTonnageChange('0-5')}
                  >
                    0 - 5 Tons
                  </Button>
                  <Button 
                    variant={tonnageFilter === '5-15' ? 'default' : 'outline'} 
                    size="sm"
                    className={`px-3 py-2 text-xs font-medium ${tonnageFilter === '5-15' ? 'bg-primary/10 border-primary text-primary' : ''}`}
                    onClick={() => handleTonnageChange('5-15')}
                  >
                    5 - 15 Tons
                  </Button>
                  <Button 
                    variant={tonnageFilter === '15-25' ? 'default' : 'outline'} 
                    size="sm"
                    className={`px-3 py-2 text-xs font-medium ${tonnageFilter === '15-25' ? 'bg-primary/10 border-primary text-primary' : ''}`}
                    onClick={() => handleTonnageChange('15-25')}
                  >
                    15 - 25 Tons
                  </Button>
                  <Button 
                    variant={tonnageFilter === '25+' ? 'default' : 'outline'} 
                    size="sm"
                    className={`px-3 py-2 text-xs font-medium ${tonnageFilter === '25+' ? 'bg-primary/10 border-primary text-primary' : ''}`}
                    onClick={() => handleTonnageChange('25+')}
                  >
                    25+ Tons
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Engine Type</h3>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={engineTypeFilters.diesel}
                      onCheckedChange={() => handleEngineTypeChange('diesel')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Diesel</span>
                  </Label>
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={engineTypeFilters.electric}
                      onCheckedChange={() => handleEngineTypeChange('electric')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Electric / Hybrid</span>
                  </Label>
                  <Label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors">
                    <Checkbox 
                      checked={engineTypeFilters.propane}
                      onCheckedChange={() => handleEngineTypeChange('propane')}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>Propane</span>
                  </Label>
                </div>
              </div>
              
              <Button className="w-full bg-slate-100 dark:bg-slate-800 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Apply Filters
              </Button>
            </div>
          </aside>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {equipmentList.map((item) => (
                <Card key={item.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={item.image}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {item.badges.map((badge, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-tight ${
                            badge.type === 'available' ? 'bg-white/95 dark:bg-slate-900/95' :
                            badge.type === 'verified' ? 'bg-amber-500 text-white' :
                            'bg-white/95 dark:bg-slate-900/95'
                          }`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors">
                      <Heart className="text-sm" />
                    </button>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-primary">${item.price}</span>
                          <span className="text-slate-400 text-[10px] block font-medium">PER DAY</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="text-sm text-slate-400" /> {item.location}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {item.specs.map((spec, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg flex items-center gap-2">
                          <spec.icon className="text-sm text-slate-400" />
                          <span className="text-[11px] font-semibold">{spec.label}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-auto w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 col-span-full">
                <div className="text-center">
                  <p className="text-slate-500 mb-4">View more listings based on your location</p>
                  <Button variant="outline" className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                    Load More Results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
                <a className="text-slate-400 hover:text-primary" href="#">
                  <Facebook className="h-5 w-5" />
                </a>
                <a className="text-slate-400 hover:text-primary" href="#">
                  <Mail className="h-5 w-5" />
                </a>
                <a className="text-slate-400 hover:text-primary" href="#">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary" href="#">About Us</a></li>
                <li><a className="hover:text-primary" href="#">Careers</a></li>
                <li><a className="hover:text-primary" href="#">Contact</a></li>
                <li><a className="hover:text-primary" href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary" href="#">Help Center</a></li>
                <li><a className="hover:text-primary" href="#">Fleet Partners</a></li>
                <li><a className="hover:text-primary" href="#">Blog</a></li>
                <li><a className="hover:text-primary" href="#">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary" href="#">Rental Agreement</a></li>
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