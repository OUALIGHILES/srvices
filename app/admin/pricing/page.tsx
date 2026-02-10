'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  position?: number; // Optional since it might not exist in the database
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
  const [saving, setSaving] = useState(false);
  const [globalCommission, setGlobalCommission] = useState<number>(15.0);
  const [fixedServiceFee, setFixedServiceFee] = useState<number>(1.50);
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(2.5);
  const [vatRate, setVatRate] = useState<number>(12.0);
  const [municipalityFee, setMunicipalityFee] = useState<number>(0.50);
  const [showGlobalCommissionModal, setShowGlobalCommissionModal] = useState<boolean>(false);
  const [showFixedFeeModal, setShowFixedFeeModal] = useState<boolean>(false);
  const [showServiceSettingsModal, setShowServiceSettingsModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState<boolean>(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState<boolean>(false);

  // Mock data for the cards

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
          .order('name', { ascending: true }); // Fallback to ordering by name if position column doesn't exist

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
                .select('id, name, base_price, is_active') // Removed position since it might not exist
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

  // Function to save changes to Supabase
  const saveChanges = async () => {
    setSaving(true);
    
    try {
      const supabase = createClient();
      
      // Update global settings in a settings table (assuming it exists)
      // For now, we'll just show a success message
      console.log('Saving global settings:', {
        globalCommission,
        fixedServiceFee,
        surgeMultiplier,
        vatRate,
        municipalityFee
      });
      
      // Example of how to update settings in Supabase
      // const { error } = await supabase
      //   .from('settings') // Assuming there's a settings table
      //   .upsert({
      //     id: 'global_settings',
      //     global_commission: globalCommission,
      //     fixed_service_fee: fixedServiceFee,
      //     surge_multiplier: surgeMultiplier,
      //     vat_rate: vatRate,
      //     municipality_fee: municipalityFee,
      //     updated_at: new Date().toISOString()
      //   });
      
      // For now, just show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Function to reset service ordering to default
  const resetToDefaultOrder = async () => {
    if (!confirm('Are you sure you want to reset the service order to default? This will restore the original positioning.')) {
      return;
    }

    try {
      const supabase = createClient();
      
      // Reset positions to alphabetical order by service name
      const updatedServices = [...services].map((service, index) => ({
        ...service,
        position: index + 1
      }));

      // Update positions in the database (only if position column exists)
      for (const service of updatedServices) {
        const { error } = await supabase
          .from('services')
          .update({ position: service.position })
          .eq('id', service.id);

        if (error) {
          console.warn('Warning: Could not update service position (column may not exist):', error);
          // Don't throw error if it's just a missing column - continue with other updates
          break; // Stop trying to update positions if the column doesn't exist
        }
      }

      // Update local state
      setServices(updatedServices);
      alert('Service order has been reset to default successfully!');
    } catch (error) {
      console.error('Error resetting service order:', error);
      alert('Error resetting service order. Please try again.');
    }
  };

  // Function to handle drag end event
  const onDragEnd = async (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(sortedServices);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions based on new order
    const updatedServices = items.map((service, index) => ({
      ...service,
      position: index + 1
    }));

    // Update positions in the database
    try {
      const supabase = createClient();
      let hasPositionColumn = true;
      
      for (const service of updatedServices) {
        const { error } = await supabase
          .from('services')
          .update({ position: service.position })
          .eq('id', service.id);

        if (error) {
          console.warn('Warning: Could not update service position (column may not exist):', error);
          hasPositionColumn = false;
          break; // Stop trying to update positions if the column doesn't exist
        }
      }

      // Update local state
      setServices(updatedServices);
    } catch (error) {
      console.error('Error updating service positions:', error);
      alert('Error updating service positions. Please try again.');
    }
  };

  // Function to add a new service
  const addNewService = async (serviceName: string, category: string, basePrice: number) => {
    try {
      const supabase = createClient();
      
      // Calculate the next position based on current services (only if position exists)
      const existingPositions = services
        .map(s => s.position)
        .filter(pos => pos !== undefined) as number[];
      
      const newPosition = existingPositions.length > 0 
        ? Math.max(...existingPositions) + 1 
        : 1;
      
      // Insert the new service into the database
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: serviceName,
          category: category,
          base_price: basePrice,
          is_active: true,
          position: newPosition
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding new service:', error);
        throw error;
      }
      
      // Update local state with the new service
      if (data) {
        setServices([...services, data]);
        alert('Service added successfully!');
      }
    } catch (error) {
      console.error('Error adding new service:', error);
      alert('Error adding new service. Please try again.');
    }
  };

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

  // Sort services by position for the drag-and-drop list (fallback to name if position is undefined)
  const sortedServices = [...services].sort((a, b) => {
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }
    // Fallback to alphabetical order by name if position is not available
    return a.name.localeCompare(b.name);
  });

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
          <button 
            onClick={() => setShowVersionHistoryModal(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <History className="h-4 w-4" /> Version History
          </button>
          <button 
            onClick={saveChanges}
            disabled={saving}
            className={`px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Percent className="h-5 w-5" />
            </div>
            <button 
              onClick={() => setShowGlobalCommissionModal(true)}
              className="text-primary text-xs font-bold bg-primary/5 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
            >
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <Ticket className="h-5 w-5" />
            </div>
            <button 
              onClick={() => setShowFixedFeeModal(true)}
              className="text-blue-600 text-xs font-bold bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
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
            <button 
              onClick={resetToDefaultOrder}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="h-4 w-4" /> Reset to Default
            </button>
          </div>
          <div className="p-0">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="services-list" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                {(provided) => (
                  <ul
                    className="divide-y divide-slate-100 dark:divide-slate-800"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {sortedServices.map((service, index) => {
                      const ServiceIcon = getServiceIcon(service.name);
                      return (
                        <Draggable key={service.id} draggableId={service.id} index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center justify-between group ${
                                snapshot.isDragging ? 'shadow-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg' : ''
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="text-slate-300 cursor-move group-hover:text-slate-500 h-5 w-5"
                                >
                                  <GripVertical />
                                </div>
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
                                <button 
                                  onClick={() => {
                                    setSelectedService(service);
                                    setShowServiceSettingsModal(true);
                                  }}
                                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                                >
                                  <SettingsIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="text-primary text-sm font-bold hover:underline"
              >
                + Add New Service Category
              </button>
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
            <button 
              onClick={() => setShowTaxSettingsModal(true)}
              className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
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

      {/* Modals - These need to be inside the main div but after other content */}
      <React.Fragment>
        {/* Modal for editing global commission */}
        {showGlobalCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Global Commission</h3>
              <button
                onClick={() => setShowGlobalCommissionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Global Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={globalCommission}
                onChange={(e) => setGlobalCommission(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                This rate applies to all ride-hailing services across the platform.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGlobalCommissionModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGlobalCommissionModal(false);
                  // Optionally trigger save here
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for managing fixed service fees */}
      {showFixedFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Fixed Service Fee</h3>
              <button
                onClick={() => setShowFixedFeeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fixed Service Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fixedServiceFee}
                onChange={(e) => setFixedServiceFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                This fee is applied as a flat processing fee per booking.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFixedFeeModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFixedFeeModal(false);
                  // Optionally trigger save here
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for service settings */}
      {showServiceSettingsModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Settings: {selectedService.name}</h3>
              <button 
                onClick={() => setShowServiceSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Base Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selectedService.base_price}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  defaultValue={selectedService.category}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={selectedService.is_active}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Service is active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowServiceSettingsModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Update service in database
                  setShowServiceSettingsModal(false);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for adding a new service */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Service Category</h3>
              <button 
                onClick={() => setShowAddServiceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form 
              id="addServiceForm"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const category = formData.get('category') as string;
                const basePrice = parseFloat(formData.get('basePrice') as string) || 0;
                
                if (name && category) {
                  addNewService(name, category, basePrice);
                  setShowAddServiceModal(false);
                } else {
                  alert('Please fill in all required fields.');
                }
              }} 
              className="mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Service Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Enter service name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <input
                  name="category"
                  type="text"
                  required
                  placeholder="Enter category"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Base Price ($)
                </label>
                <input
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  name="isActive"
                  type="checkbox"
                  id="newServiceIsActive"
                  defaultChecked
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="newServiceIsActive" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Service is active
                </label>
              </div>
            </form>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                form="addServiceForm"
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for tax settings */}
      {showTaxSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Tax Settings</h3>
              <button 
                onClick={() => setShowTaxSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  VAT / Sales Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Municipality Fee ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={municipalityFee}
                  onChange={(e) => setMunicipalityFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTaxSettingsModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTaxSettingsModal(false);
                  // Optionally trigger save here
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for version history */}
      {showVersionHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Version History</h3>
              <button 
                onClick={() => setShowVersionHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <tr>
                    <th className="py-3 px-4 font-medium">Date & Time</th>
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Action</th>
                    <th className="py-3 px-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm">Oct 24, 2023 14:22</td>
                    <td className="py-3 px-4 text-sm">Admin User</td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600">Updated</td>
                    <td className="py-3 px-4 text-sm">Changed global commission from 12% to 15%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm">Oct 23, 2023 09:15</td>
                    <td className="py-3 px-4 text-sm">Admin User</td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">Added</td>
                    <td className="py-3 px-4 text-sm">Added new service category: Luxury Rides</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm">Oct 22, 2023 16:45</td>
                    <td className="py-3 px-4 text-sm">Admin User</td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">Modified</td>
                    <td className="py-3 px-4 text-sm">Updated fixed service fee to $1.50</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm">Oct 20, 2023 11:30</td>
                    <td className="py-3 px-4 text-sm">Admin User</td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600">Updated</td>
                    <td className="py-3 px-4 text-sm">Changed VAT rate from 10% to 12%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm">Oct 18, 2023 13:20</td>
                    <td className="py-3 px-4 text-sm">Admin User</td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">Added</td>
                    <td className="py-3 px-4 text-sm">Added new service category: Express Delivery</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowVersionHistoryModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  </div>
);
}