'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Construction, Facebook, Mail, Globe, Menu, X as CloseIcon, User, CreditCard, Gavel, Truck, Wrench, Shield, Search, MessageCircle, Upload, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupportPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ fullName, email, subject, description });
  };

  // Support categories data
  const supportCategories = [
    {
      id: 'account',
      title: 'Account & Profile',
      description: 'Manage your subscription, change settings, and handle company profiles.',
      icon: User,
      color: 'blue',
      href: '#'
    },
    {
      id: 'payments',
      title: 'Payments & Invoicing',
      description: 'Detailed information on billing cycles, VAT, and payment methods.',
      icon: CreditCard,
      color: 'green',
      href: '#'
    },
    {
      id: 'safety',
      title: 'Rental Safety & Compliance',
      description: 'Everything you need to know about safety standards and legal requirements.',
      icon: Shield,
      color: 'amber',
      href: '#'
    },
    {
      id: 'logistics',
      title: 'Logistics & Delivery',
      description: 'Track shipments, manage site access, and handle delivery delays.',
      icon: Truck,
      color: 'purple',
      href: '#'
    },
    {
      id: 'fleet',
      title: 'Fleet Management',
      description: 'Operator guides, maintenance schedules, and equipment specifics.',
      icon: Wrench,
      color: 'orange',
      href: '#'
    },
    {
      id: 'security',
      title: 'Trust & Security',
      description: 'Our commitment to your data privacy and platform integrity.',
      icon: Shield,
      color: 'rose',
      href: '#'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: 'How do I extend my current rental period?',
      answer: 'You can extend your rental period by logging into your account and navigating to the "My Bookings" section. From there, select the booking you wish to extend and follow the prompts.'
    },
    {
      question: 'What happens if the equipment breaks down on site?',
      answer: 'If equipment breaks down during your rental period, contact our emergency support line immediately. Our team will coordinate with the vendor to provide a replacement or repair as quickly as possible.'
    },
    {
      question: 'Can I change the delivery location after booking?',
      answer: 'Yes, you can change the delivery location up to 24 hours before the scheduled delivery time. Changes made within 24 hours may incur additional fees depending on the distance.'
    },
    {
      question: 'Are there any hidden environmental fees?',
      answer: 'No, we believe in transparent pricing. All fees, including environmental charges, are clearly displayed during the booking process before you confirm your reservation.'
    }
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
              <Link href="/solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
              <Link href="/support" className="text-sm font-medium text-primary transition-colors h-16 flex items-center border-b-2 border-primary">Support</Link>
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
                <Link href="/support" className="font-medium text-primary py-2">Support</Link>
                
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
        <section className="bg-gradient-to-br from-primary to-blue-800 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">How can we help you today?</h1>
            <p className="text-lg text-white/80 mb-10">Search our knowledge base for answers to your questions about rentals, accounts, and safety.</p>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-400 h-5 w-5" />
              </div>
              <Input 
                className="block w-full pl-12 pr-4 py-4 rounded-xl border-none text-slate-900 text-lg shadow-2xl focus:ring-4 focus:ring-white/20" 
                placeholder="Search for articles, guides, and tutorials..." 
                type="text"
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/70">
              <span>Popular:</span>
              <a className="underline hover:text-white" href="#">Rental insurance</a>,
              <a className="underline hover:text-white" href="#">Refund policy</a>,
              <a className="underline hover:text-white" href="#">Delivery tracking</a>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportCategories.map((category) => {
                const IconComponent = category.icon;
                const colorClasses = {
                  blue: 'bg-blue-50 dark:bg-blue-900/20 text-primary',
                  green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
                  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
                  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
                  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
                  rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                };
                
                return (
                  <Link 
                    key={category.id} 
                    href={category.href}
                    className="p-8 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className={`w-14 h-14 ${colorClasses[category.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{category.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400">{category.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background-light dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                  <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Full Name</Label>
                        <Input 
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary" 
                          placeholder="John Doe" 
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email Address</Label>
                        <Input 
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary" 
                          placeholder="john@example.com" 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Subject</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="dispute">Rental Dispute</SelectItem>
                          <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</Label>
                      <Textarea 
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary" 
                        placeholder="Please describe your issue in detail..." 
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Attachments (optional)</Label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <Upload className="text-slate-400 h-8 w-8 mx-auto" />
                          <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input className="sr-only" type="file" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20" 
                      type="submit"
                    >
                      Send Ticket
                    </Button>
                  </form>
                </div>
              </div>
              <div className="lg:w-1/3 space-y-6">
                <div className="bg-primary text-white rounded-3xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-4">Instant Assistance</h2>
                  <p className="text-white/80 mb-8">Need a fast answer? Our support team is available via live chat and messaging during business hours.</p>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between bg-white text-primary px-6 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5" />
                        <span>Start Live Chat</span>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </button>
                    <a 
                      className="w-full flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold hover:brightness-110 transition-all" 
                      href="https://wa.me/1234567890" 
                      target="_blank"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <h4 className="font-bold mb-2">Business Hours</h4>
                    <p className="text-sm text-white/70">
                      Mon - Fri: 8:00 AM - 8:00 PM EST<br/>
                      Sat - Sun: 10:00 AM - 4:00 PM EST
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-lg mb-4">Emergency Support</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    For immediate on-site safety emergencies or equipment failure, please call our 24/7 hotline:
                  </p>
                  <a className="text-xl font-bold text-primary flex items-center gap-2" href="tel:18005550199">
                    <Phone className="h-5 w-5" />
                    1-800-555-0199
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-background-dark">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="font-semibold">{faq.question}</span>
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <button className="text-primary font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all">
                See all 150+ help articles <ArrowRight className="h-4 w-4" />
              </button>
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary" href="#">Help Center</a></li>
                <li><a className="hover:text-primary" href="#">Fleet Partners</a></li>
                <li><a className="hover:text-primary" href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary" href="#">Terms</a></li>
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