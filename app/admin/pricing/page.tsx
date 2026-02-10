'use client';

import { useState, useEffect } from 'react';
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
  History,
  Save,
  Percent,
  Ticket,
  Zap,
  RotateCcw,
  Settings as SettingsIcon,
  Plus,
  GripVertical,
  Truck,
  ShoppingCart,
  Leaf,
  Crown,
  Package
} from 'lucide-react';

// Define interfaces
interface Service {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
  category: string;
  position: number;
}

interface PricingRule {
  id: string;
  service_id: string;
  customer_fixed_price?: number;
  driver_percentage?: number;
  driver_fixed_price?: number;
  is_active: boolean;
  service?: Service;
}

export default function AdminPricingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock data for the cards
  const globalCommission = 15.0;
  const fixedServiceFee = 1.50;
  const surgeMultiplier = 2.5;
  const vatRate = 12.0;
  const municipalityFee = 0.50;

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true });

        if (!servicesError) {
          setServices(servicesData || []);
        }

        // Fetch pricing rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('pricing_rules')
          .select('*')
          .order('created_at', { ascending: true });

        if (!rulesError && rulesData) {
          // Enrich with service details
          const rulesWithServices = await Promise.all(
            rulesData.map(async (rule) => {
              const mapSupabase = createClient(); // Create a new client for each async operation
              // Validate UUID format before making the request
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              if (!uuidRegex.test(rule.service_id)) {
                console.error(`Invalid UUID format for service_id: ${rule.service_id}`);
                return { ...rule, service: null };
              }

              const { data: serviceData } = await mapSupabase
                .from('services')
                .select('id, name, base_price, is_active, position')
                .eq('id', rule.service_id)
                .single();

              return { ...rule, service: serviceData };
            })
          );

          setPricingRules(rulesWithServices);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing rules...</p>
        </div>
      </div>
    );
  }

  // Sort services by position for the drag-and-drop list
  const sortedServices = [...services].sort((a, b) => a.position - b.position);

  // Get service icon based on category
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ride share':
      case 'standard ride':
        return Car;
      case 'express delivery':
      case 'cargo & haul':
        return Truck;
      case 'grocery haul':
        return ShoppingCart;
      case 'eco ride':
      case 'eco-friendly':
        return Leaf;
      case 'luxury':
      case 'ridemaster black':
        return Crown;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Rules & Commission</h1>
          <p className="text-slate-500 text-sm">Configure platform fees, commissions, and service display logic.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <History className="h-4 w-4" /> Version History
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Percent className="h-5 w-5" />
            </div>
            <button className="text-primary text-xs font-bold bg-primary/5 px-2 py-1 rounded hover:bg-primary/10 transition-colors">
              Edit Global
            </button>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Global Commission (%)</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">{globalCommission}%</h3>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                ↓ -2.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">Standard fee applied to all ride-hailing services.</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <Ticket className="h-5 w-5" />
            </div>
            <button className="text-orange-600 text-xs font-bold bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded hover:bg-orange-100 transition-colors">
              Manage
            </button>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Fixed Service Fees</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">${fixedServiceFee.toFixed(2)}</h3>
              <span className="text-slate-400 text-[10px] font-normal italic">per transaction</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">Applied as a flat processing fee per booking.</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-indigo-500 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center gap-1">
              Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Max Surge Multiplier</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">{surgeMultiplier}x</h3>
              <span className="text-slate-400 text-[10px] font-normal italic">Current cap</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">Dynamic pricing limit during high-demand hours.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold">Order of Appearance</h4>
              <p className="text-xs text-slate-500">Drag and drop to rearrange how services appear in the customer app</p>
            </div>
            <button className="text-primary text-sm font-semibold flex items-center gap-1">
              <RotateCcw className="h-4 w-4" /> Reset to Default
            </button>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedServices.map((service, index) => {
                const ServiceIcon = getServiceIcon(service.name);
                return (
                  <li key={service.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <GripVertical className="text-slate-300 cursor-move group-hover:text-slate-500 h-5 w-5" />
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary">
                        <ServiceIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{service.name}</p>
                        <p className="text-xs text-slate-500">Base category for daily commuting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">Pos: {index + 1}</span>
                      <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                        <SettingsIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
              <button className="text-primary text-sm font-bold hover:underline">+ Add New Service Category</button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h4 className="font-bold mb-4">Tax Configuration</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">VAT / Sales Tax</span>
                <span className="text-sm font-bold">{vatRate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                <div className="bg-primary w-[40%] h-full rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Municipality Fee</span>
                <span className="text-sm font-bold">${municipalityFee.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Edit Tax Settings
            </button>
          </div>
          
          <div className="bg-primary text-white rounded-xl shadow-lg shadow-primary/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">Rule Integrity</h4>
              <svg className="text-emerald-400 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              All pricing rules are currently synchronized across 12 operational zones. No conflicts detected.
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70 text-white">Last Sync</span>
                <span className="font-mono">Oct 24, 14:22</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}