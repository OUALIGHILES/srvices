'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Search, MapPin, Wrench, Droplets, Hammer, Construction, Facebook, Mail, Globe, Menu, X, Factory, LandPlot, Home, Building2, ClipboardCheck, Calendar, Truck, ArrowRight, Fuel } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePageMain() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Service categories data
  const serviceCategories = [
    {
      id: 'heavy_equipment',
      name: 'Heavy Equipment',
      description: 'Excavators, bulldozers, and cranes from top brands.',
      price: '$450/day',
      icon: <Wrench className="h-6 w-6" />,
      color: 'bg-primary'
    },
    {
      id: 'water_supply',
      name: 'Water & Fluid',
      description: 'Bulk water delivery for site suppression and storage.',
      price: '$120/delivery',
      icon: <Droplets className="h-6 w-6" />,
      color: 'bg-blue-400'
    },
    {
      id: 'fuel_services',
      name: 'Fuel Delivery',
      description: 'On-site diesel and gas refueling for your entire fleet.',
      price: 'Market rates applied',
      icon: <Fuel className="h-6 w-6" />,
      color: 'bg-primary'
    },
    {
      id: 'specialized_tools',
      name: 'Specialized Tools',
      description: 'Compactors, generators, and handheld power tools.',
      price: '$85/day',
      icon: <Hammer className="h-6 w-6" />,
      color: 'bg-slate-700'
    }
  ];

  // Featured listings data
  const featuredListings = [
    {
      id: '1',
      name: 'Caterpillar 320 GC',
      location: 'San Jose, CA',
      price: 650,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqQlXvAK-J4zM1xlXFijzfv4MNF6HlKPGMkOaLPovGwk6VfAH_rx5uChJZy1PmW8r0kw2hyiCKLQRreqc3gi0fVgIqxpGp87dKPrGpeXBmz5eOJyhAtcSSsCTZtgE-QrpfxVJ87SaIm38apt2uVqGqCz3YRgVbhGeOhT1LxXLVCh20AdeS9MUcb6LWVRQT4T3rrX-eNcT3iU7SpxOizEVeGYaHYRm5DxvChewLZh0YxOVZUoCYSnw9Ue3ESgAmoy9eae0sRBKWB_Y',
      badges: ['20 Tons', 'Diesel', 'Tier 4 Final'],
      badgeText: 'Available Now'
    },
    {
      id: '2',
      name: 'Komatsu D61PXi-24',
      location: 'Oakland, CA',
      price: 820,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoBOdrY80zOx9mC6azAcLs4Ni88BSp58ENNbrgERA3BJwEMjVjzaI6f03zztzCoOGNqHYAVQ__PA8JpXlSKTu0cOpx6fn9v5hhnjjFyhpibbGAh7F7Tc7NJxRKGeWxL9-oo4NlkEXIx5DQuoiZ95YxOPrOq1Zq1k-HrRhxsODzG0bXnB-CwOlVqtRQIkTAUrOPnp94U_rWKlF9GN86dKEvMOh6pc5Arjh2k8z0MciOz8YN8vTEElgsoVTr8PtP94priG9E9-EyQD4',
      badges: ['168 HP', 'iMC 2.0', 'Hydrostatic'],
      badgeText: 'Verified Vendor'
    },
    {
      id: '3',
      name: '4000 Gallon Water Truck',
      location: 'Fremont, CA',
      price: 450,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5FVs5fwBUf9R60Y3PgmV3SjF0lyUq8TXOsmWqalhS1hiCVXtfrjt_qDhDar5JaLDLjcavStkZj8JJmgKnBJ_E7siv-gVpYkyHMd-ax16taTeb7mpf_xReFW5aFsonEAhgXjJHCf0EPtM1Uwfh9V5PneaGqiJnQFqRrqAOz-JNoXuFedRE_MELNt-45mzL1n3TkJmuFAwOYtI068-TWhQJz_30jg3_k5W53VsGAbiPJVrE7aVsXzlSn0qH2z16YrPyR7pDHVJzqXU',
      badges: ['Potable Available', 'Rear Sprayers'],
      badgeText: 'Fast Delivery'
    }
  ];

  // Trust partners data
  const trustPartners = [
    { name: 'CONSTRUCT-CO', icon: <Factory className="h-5 w-5" /> },
    { name: 'URBAN-BUILD', icon: <Building2 className="h-5 w-5" /> },
    { name: 'TERRA-FORM', icon: <LandPlot className="h-5 w-5" /> },
    { name: 'BASE-WORKS', icon: <Home className="h-5 w-5" /> },
    { name: 'ARCH-VISTA', icon: <Building2 className="h-5 w-5" /> }
  ];

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
              <Link href="/" className="text-sm font-medium text-primary transition-colors h-16 flex items-center border-b-2 border-primary">Home</Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
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
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

      <main>
        {/* Hero Section */}
        <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              alt="Heavy Machinery Hero" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAadPQdqB6hQ4-k1xLiW_5-cBhU5aRDZxTfNBALS45Tv0Yx16FIqkBzfUlgG0q_MNOkdWIw98ruJHJJKeBtO1nglMkrXl9yKVKBIvE91CgduzkJFfgMntUt2ttXzRzK1LoxJeVfuDu88GVM53x6HrmtSXaxcnM76iwuCz1SnK3UgM5Lx3x_xBsT454RfIjKF6GylJrBQG7dsq3Oxarfmb8JVCdOLQGa3hGUySxKi4t8PZHZBGRDcWZXuWcWsYc0gBstiMhHKVZzVUo"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Book Heavy Equipment &amp; Supplies Instantly.
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Reliable. Transparent. Efficient. The all-in-one platform for contractors and logistics managers to power their projects.
            </p>
            {/* Search Bar */}
            <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
              <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="text-slate-400 mr-2 h-5 w-5" />
                <input 
                  className="w-full border-none focus:ring-0 text-slate-900 bg-transparent py-3" 
                  placeholder="What equipment do you need?" 
                  type="text"
                />
              </div>
              <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-slate-200">
                <MapPin className="text-slate-400 mr-2 h-5 w-5" />
                <input 
                  className="w-full border-none focus:ring-0 text-slate-900 bg-transparent py-3" 
                  placeholder="Location" 
                  type="text"
                />
              </div>
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Find Fleet
              </button>
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {trustPartners.map((partner, index) => (
              <div key={index} className="flex items-center gap-2">
                {partner.icon}
                <span className="font-bold">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-24 bg-white dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How it Works</h2>
              <p className="text-slate-500 dark:text-slate-400">Getting the right gear to your site has never been easier.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Choose</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse our verified catalog of machinery, water supply, and fuel services across your region.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Book</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Select your dates and secure your equipment with our transparent upfront pricing.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Track</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor delivery in real-time and manage site arrivals through our professional dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories Grid */}
        <section className="py-24 bg-background-light dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore Categories</h2>
                <p className="text-slate-500 dark:text-slate-400">Everything you need for a successful construction site.</p>
              </div>
              <button className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                View All Categories <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-slate-100 dark:border-slate-800"
                >
                  <div className={`${category.color} text-white rounded-lg flex items-center justify-center w-12 h-12 mb-6`}>
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{category.description}</p>
                  <div className="text-primary font-semibold text-sm">Starting at {category.price}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-24 bg-white dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">Popular Listings Near You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <div 
                  key={listing.id} 
                  className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      alt={listing.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src={listing.image}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {listing.badgeText}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{listing.name}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {listing.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${listing.price}</div>
                        <div className="text-slate-400 text-xs font-medium">per day</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mb-6">
                      {listing.badges.map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-primary rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10"></div>
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-white mb-6">Ready to start your next project?</h2>
                <p className="text-white/80 text-lg mb-8">
                  Join over 500+ contracting companies who trust EquipFlow for their daily site operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors">
                    Create Account
                  </button>
                  <button className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
                    Talk to Sales
                  </button>
                </div>
              </div>
              <div className="relative z-10 mt-12 md:mt-0 hidden lg:block">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                  <img 
                    alt="Dashboard Preview" 
                    className="w-80 h-48 object-cover rounded-lg shadow-xl" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbN4qazDAt_myncXhRyCc0g_qnv-vQ5m1aF4OYihuRMF5zNne_DSzcnTzQNTs5gPY77m0xB2ivuQ7rKnuusbG6RLL-1KlPda-iLThb6rMFmsHA7jns4MgfpRU09HrQcQkDHo8HJAufIfs_F5aNnQ8slkmCujDuwfoj7hX2nsRBxtRTGmqe5JGQU-JTwh25nw5Kj34kekRj0q5ao855ebL1HpIg56MQB7PIIEUG0T25teJvPy0wyMFVMeHXCInhxzBK_2GXoI9Ee1s"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
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