'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Construction, Facebook, Mail, Globe, Menu, X as CloseIcon, Percent, CreditCard, CheckCircle2, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pricing plans data
  const pricingPlans = [
    {
      id: 'standard',
      name: 'Standard',
      price: '$0',
      period: '/per month',
      description: 'Ideal for occasional rentals and individual contractors.',
      badge: { text: 'Standard', color: 'bg-primary/10 text-primary' },
      features: [
        { text: 'Access to full marketplace', available: true },
        { text: 'Priority fulfillment', available: false, strikethrough: true },
        { text: 'Advanced fleet analytics', available: false, strikethrough: true },
        { text: 'Standard 24h support', available: true },
        { text: '1 active booking at a time', available: true }
      ],
      cta: 'Get Started',
      buttonVariant: 'outline',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$249',
      period: '/per month',
      description: 'Power your site operations with fleet management tools.',
      badge: { text: 'Enterprise', color: 'bg-primary/10 text-primary' },
      features: [
        { text: 'Unlimited active bookings', available: true },
        { text: 'Priority fulfillment & dispatch', available: true },
        { text: 'Full fleet analytics dashboard', available: true },
        { text: 'Dedicated account manager', available: true },
        { text: 'Automated fuel & fluid refills', available: true }
      ],
      cta: 'Upgrade to Pro',
      buttonVariant: 'default',
      popular: true
    },
    {
      id: 'partner',
      name: 'Partner',
      price: 'Custom',
      period: '',
      description: 'Designed for fleet owners and supply vendors.',
      badge: { text: 'Partner', color: 'bg-amber-500/10 text-amber-500' },
      features: [
        { text: 'List unlimited inventory', available: true },
        { text: 'Automated payout system', available: true },
        { text: 'Equipment insurance coverage', available: true },
        { text: 'Telematics integration', available: true },
        { text: 'Real-time site GPS tracking', available: true }
      ],
      cta: 'Contact Partnerships',
      buttonVariant: 'outline',
      popular: false
    }
  ];

  // Fee transparency data
  const feeTypes = [
    {
      title: 'Percentage Commission',
      description: 'A dynamic commission fee is applied to each rental or service transaction. This covers payment processing, merchant fees, and marketplace maintenance.',
      icon: <Percent className="h-6 w-6" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600',
      fees: [
        { label: 'Standard Marketplace', value: '12%' },
        { label: 'Enterprise Clients', value: '8%' },
        { label: 'Large-Scale Logistics', value: '5%' }
      ]
    },
    {
      title: 'Fixed Service Fees',
      description: 'Fixed operational fees are applied per booking to ensure logistical reliability, safety inspections, and on-site support coverage.',
      icon: <CreditCard className="h-6 w-6" />,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600',
      fees: [
        { label: 'Booking Admin Fee', value: '$15.00' },
        { label: 'Environmental Surcharge', value: '$9.00' },
        { label: 'Security Deposit (Refundable)', value: 'Varies' }
      ]
    }
  ];

  // Comparison table data
  const comparisonTable = {
    headers: ['Features', 'Standard', 'Enterprise', 'Partner'],
    rows: [
      {
        feature: 'Marketplace Access',
        standard: true,
        enterprise: true,
        partner: true
      },
      {
        feature: 'Active Bookings',
        standard: '1 at a time',
        enterprise: 'Unlimited',
        partner: 'Unlimited'
      },
      {
        feature: 'Equipment Insurance',
        standard: 'Basic',
        enterprise: 'Premium Included',
        partner: 'Full Liability'
      },
      {
        feature: 'Response Time',
        standard: '24 Hours',
        enterprise: '< 1 Hour',
        partner: 'Dedicated Lead'
      },
      {
        feature: 'Telematics & Tracking',
        standard: false,
        enterprise: true,
        partner: true
      },
      {
        feature: 'Commission Rate',
        standard: '12%',
        enterprise: '8%',
        partner: 'Negotiable'
      }
    ]
  };

  // FAQ data
  const faqs = [
    {
      question: 'Can I cancel my monthly subscription anytime?',
      answer: 'Yes, subscriptions are billed month-to-month and can be canceled at any time from your billing dashboard. There are no long-term contracts for the Pro plan.'
    },
    {
      question: 'How are delivery fees calculated?',
      answer: 'Delivery fees are calculated based on the distance between the equipment yard and your job site, as well as the weight and dimensions of the machinery being transported.'
    },
    {
      question: 'Are there discounts for long-term rentals?',
      answer: 'Absolutely. For rentals longer than 30 days, we automatically apply a weekly discount. For Enterprise clients, custom rates are negotiated for multi-month projects.'
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
              <Link href="/pricing" className="text-sm font-medium text-primary transition-colors h-16 flex items-center border-b-2 border-primary">Pricing</Link>
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
                <Link href="/pricing" className="font-medium text-primary py-2">Pricing</Link>
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
        <section className="py-16 md:py-24 bg-white dark:bg-background-dark overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary rounded-full blur-[120px]"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
              Transparent Pricing for Every Project.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              No hidden costs. Scale your fleet operations with our flexible service plans designed for contractors and equipment partners.
            </p>
          </div>
        </section>

        <section className="pb-24 -mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`rounded-3xl p-8 border ${
                    plan.popular 
                      ? 'border-primary scale-105 z-20 relative bg-white dark:bg-slate-900' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  } flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-8">
                    <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${plan.badge.color}`}>
                      {plan.badge.text}
                    </span>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="ml-2 text-slate-500">{plan.period}</span>
                    </div>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">{plan.description}</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li 
                        key={idx} 
                        className={`flex items-start gap-3 text-sm ${
                          !feature.available ? 'text-slate-400' : ''
                        }`}
                      >
                        {feature.available ? (
                          <CheckCircle2 className="text-emerald-500 h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="text-slate-300 h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.strikethrough ? 'line-through' : ''}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full py-3 px-6 rounded-xl ${
                      plan.buttonVariant === 'default' 
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30' 
                        : 'border-2 border-primary text-primary hover:bg-primary/5'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Platform Fee Transparency</h2>
              <p className="text-slate-500">How we handle commissions and service charges for every transaction.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {feeTypes.map((fee, index) => (
                <Card key={index} className="p-8 border border-slate-100 dark:border-slate-800">
                  <div className={`w-12 h-12 ${fee.bgColor} ${fee.textColor} rounded-xl flex items-center justify-center mb-6`}>
                    {fee.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{fee.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                    {fee.description}
                  </p>
                  <div className="space-y-4">
                    {fee.fees.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`font-bold ${
                          item.value.includes('%') ? 'text-primary' : 'text-slate-900 dark:text-white'
                        }`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-6 px-4 text-sm font-bold uppercase text-slate-500">Features</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase">Standard</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase text-primary">Enterprise</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase text-amber-500">Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {comparisonTable.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="py-6 px-4 text-sm font-medium">{row.feature}</td>
                      <td className="py-6 px-4">
                        {typeof row.standard === 'boolean' ? (
                          row.standard ? <CheckCircle2 className="text-emerald-500 h-5 w-5" /> : <Minus className="text-slate-300 h-5 w-5" />
                        ) : (
                          <span className={row.standard.includes('Unlimited') || row.standard.includes('<') || row.standard.includes('Included') ? 'text-sm font-bold' : 'text-sm text-slate-500'}>
                            {row.standard}
                          </span>
                        )}
                      </td>
                      <td className="py-6 px-4">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <CheckCircle2 className="text-emerald-500 h-5 w-5" /> : <Minus className="text-slate-300 h-5 w-5" />
                        ) : (
                          <span className={row.enterprise.includes('Unlimited') || row.enterprise.includes('<') || row.enterprise.includes('Included') ? 'text-sm font-bold' : 'text-sm text-slate-500'}>
                            {row.enterprise}
                          </span>
                        )}
                      </td>
                      <td className="py-6 px-4">
                        {typeof row.partner === 'boolean' ? (
                          row.partner ? <CheckCircle2 className="text-emerald-500 h-5 w-5" /> : <Minus className="text-slate-300 h-5 w-5" />
                        ) : (
                          <span className={row.partner.includes('Unlimited') || row.partner.includes('Lead') || row.partner.includes('Liability') ? 'text-sm font-bold' : 'text-sm text-slate-500'}>
                            {row.partner}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold mb-2">{faq.question}</h3>
                  <p className="text-slate-500 text-sm">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-primary rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10"></div>
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-white mb-6">Need a custom quote?</h2>
                <p className="text-white/80 text-lg mb-8">For large-scale construction projects or specialized fleet requirements, our sales team is here to help.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors">Talk to Sales</button>
                  <button className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">View Fleet Catalog</button>
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