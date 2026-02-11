'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Construction, Facebook, Mail, Globe, Menu, X as CloseIcon, CheckCircle2, Server, BarChart3, Truck, Receipt, Calendar, Shield, Bolt, HardHat, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SolutionsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Trust partners data
  const trustPartners = [
    { name: 'CONSTRUCT-CO', icon: 'handyman' },
    { name: 'URBAN-BUILD', icon: 'apartment' },
    { name: 'TERRA-FORM', icon: 'landscape' },
    { name: 'BASE-WORKS', icon: 'foundation' }
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
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
              <Link href="/solutions" className="text-sm font-medium text-primary transition-colors h-16 flex items-center border-b-2 border-primary">Solutions</Link>
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
                <Link href="/solutions" className="font-medium text-primary py-2">Solutions</Link>
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
        <section className="relative h-[500px] flex items-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            <img 
              alt="Industry Solutions Overview" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAadPQdqB6hQ4-k1xLiW_5-cBhU5aRDZxTfNBALS45Tv0Yx16FIqkBzfUlgG0q_MNOkdWIw98ruJHJJKeBtO1nglMkrXl9yKVKBIvE91CgduzkJFfgMntUt2ttXzRzK1LoxJeVfuDu88GVM53x6HrmtSXaxcnM76iwuCz1SnK3UgM5Lx3x_xBsT454RfIjKF6GylJrBQG7dsq3Oxarfmb8JVCdOLQGa3hGUySxKi4t8PZHZBGRDcWZXuWcWsYc0gBstiMhHKVZzVUo"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-slate-900/0"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30">Targeted Solutions</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Powering Every Scale of Infrastructure.
              </h1>
              <p className="text-xl text-white/80 mb-8">
                From individual homeowners to global logistics networks, we provide the specialized tools and services required to build the future.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Get Started</button>
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all">Talk to Sales</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white dark:bg-slate-900" id="contractors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 order-2 lg:order-1">
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">For Construction Pros</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Scale Your Fleet Without the Overhead.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Manage multi-site operations with a single dashboard. Our contractor-first approach ensures you get verified, high-performance machinery exactly when your project timeline demands it.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Priority Site Delivery</span>
                      <p className="text-sm text-slate-500">Guaranteed delivery windows to keep your labor costs low.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Multi-Unit Discounts</span>
                      <p className="text-sm text-slate-500">Dynamic pricing for large-scale rental packages and long-term projects.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">24/7 Field Support</span>
                      <p className="text-sm text-slate-500">On-call mechanics for any equipment issues, ensuring zero downtime.</p>
                    </div>
                  </li>
                </ul>
                <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Learn about Contractor Benefits <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    alt="Contractor Site" 
                    className="w-full h-[450px] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqQlXvAK-J4zM1xlXFijzfv4MNF6HlKPGMkOaLPovGwk6VfAH_rx5uChJZy1PmW8r0kw2hyiCKLQRreqc3gi0fVgIqxpGp87dKPrGpeXBmz5eOJyhAtcSSsCTZtgE-QrpfxVJ87SaIm38apt2uVqGqCz3YRgVbhGeOhT1LxXLVCh20AdeS9MUcb6LWVRQT4T3rrX-eNcT3iU7SpxOizEVeGYaHYRm5DxvChewLZh0YxOVZUoCYSnw9Ue3ESgAmoy9eae0sRBKWB_Y"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur p-6 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <HardHat className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Case Study</p>
                        <p className="text-slate-900 dark:text-white font-medium">Urban Build reduced mobilization costs by 22% using EquipFlow.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50 dark:bg-slate-950" id="logistics">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    alt="Logistics Support" 
                    className="w-full h-[450px] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5FVs5fwBUf9R60Y3PgmV3SjF0lyUq8TXOsmWqalhS1hiCVXtfrjt_qDhDar5JaLDLjcavStkZj8JJmgKnBJ_E7siv-gVpYkyHMd-ax16taTeb7mpf_xReFW5aFsonEAhgXjJHCf0EPtM1Uwfh9V5PneaGqiJnQFqRrqAOz-JNoXuFedRE_MELNt-45mzL1n3TkJmuFAwOYtI068-TWhQJz_30jg3_k5W53VsGAbiPJVrE7aVsXzlSn0qH2z16YrPyR7pDHVJzqXU"
                  />
                  <div className="absolute top-6 right-6">
                    <div className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                      <Bolt className="h-4 w-4" /> Real-time Fleet Tracking
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-2 block">For Logistics & Supply Chain</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Coordinate Resources with Precision.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Integrate fuel delivery, water supply, and specialized transport into your existing workflows. Our API-ready platform connects your supply chain for seamless site nourishment.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Server className="text-blue-500 mb-2 h-5 w-5" />
                    <h4 className="font-bold mb-1">Centralized Ops</h4>
                    <p className="text-xs text-slate-500">Manage 50+ sites from a single enterprise instance.</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <BarChart3 className="text-blue-500 mb-2 h-5 w-5" />
                    <h4 className="font-bold mb-1">Usage Analytics</h4>
                    <p className="text-xs text-slate-500">Detailed reporting on fuel burn and equipment uptime.</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Truck className="text-blue-500 mb-2 h-5 w-5" />
                    <h4 className="font-bold mb-1">Last-Mile Support</h4>
                    <p className="text-xs text-slate-500">Dedicated logistics routing for difficult terrain.</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Receipt className="text-blue-500 mb-2 h-5 w-5" />
                    <h4 className="font-bold mb-1">Unified Billing</h4>
                    <p className="text-xs text-slate-500">One monthly invoice for all services and rentals.</p>
                  </div>
                </div>
                <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all">Explore Logistics Portal</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white dark:bg-slate-900" id="individuals">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 order-2 lg:order-1">
                <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-2 block">For Individual Users</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Professional Grade Gear for Any Project.</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Whether you're landscaping your backyard or managing a private build, access the same high-tier equipment that pros use. Simple booking, transparent pricing, and no hidden fees.
                </p>
                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Flexible Rental Periods</h4>
                      <p className="text-slate-500 text-sm">Rent by the hour, day, or week. No long-term commitments required for small projects.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Included Insurance</h4>
                      <p className="text-slate-500 text-sm">Every rental includes our standard damage protection for total peace of mind.</p>
                    </div>
                  </div>
                </div>
                <button className="bg-amber-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">Browse Consumer Catalog</button>
              </div>
              <div className="flex-1 order-1 lg:order-2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    alt="Individual Renter" 
                    className="w-full h-[450px] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoBOdrY80zOx9mC6azAcLs4Ni88BSp58ENNbrgERA3BJwEMjVjzaI6f03zztzCoOGNqHYAVQ__PA8JpXlSKTu0cOpx6fn9v5hhnjjFyhpibbGAh7F7Tc7NJxRKGeWxL9-oo4NlkEXIx5DQuoiZ95YxOPrOq1Zq1k-HrRhxsODzG0bXnB-CwOlVqtRQIkTAUrOPnp94U_rWKlF9GN86dKEvMOh6pc5Arjh2k8z0MciOz8YN8vTEElgsoVTr8PtP94priG9E9-EyQD4"
                  />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl text-white text-sm">
                      "I needed a skid steer for a weekend garden project. The delivery was on time, and the machine was nearly brand new. Fantastic experience!"
                      <br/><span className="font-bold text-amber-400 mt-2 block">— David R., Homeowner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-white/70 font-bold uppercase tracking-widest text-sm mb-6">Enterprise Solutions</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 max-w-4xl">
                  Ready to transform your site operations?
                </h2>
                <p className="text-white/80 text-xl mb-12 max-w-2xl leading-relaxed">
                  Custom pricing, dedicated account managers, and regional fleet priority for enterprise-level partners. Let's discuss your next milestone.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-md">
                  <button className="bg-white text-primary font-bold px-10 py-5 rounded-2xl hover:bg-slate-50 transition-all text-lg shadow-xl">Talk to Sales</button>
                  <button className="border-2 border-white/30 text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-lg">Request Demo</button>
                </div>
                <div className="mt-16 flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale brightness-200">
                  {trustPartners.map((partner, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="material-icons">{partner.icon}</span> 
                      <span className="font-bold">{partner.name}</span>
                    </div>
                  ))}
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