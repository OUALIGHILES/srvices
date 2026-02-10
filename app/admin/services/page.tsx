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
  Plus,
  Edit,
  Trash2,
  Package,
  Droplets,
  Truck,
  Construction,
  Schedule,
  Inventory2,
  Lightbulb,
  Upload,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces
interface Service {
  id: string;
  name: string;
  category: string;
  base_price: number;
  is_active: boolean;
  created_at: string;
  billing_unit: 'hour' | 'load' | 'trip' | 'item';
  platform_fee: number;
  icon?: string;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Omit<Service, 'id' | 'created_at'>>({
    name: '',
    category: '',
    base_price: 0,
    is_active: true,
    billing_unit: 'hour',
    platform_fee: 0,
    icon: 'package'
  });

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
          .order('created_at', { ascending: false });

        if (!servicesError && servicesData) {
          setServices(servicesData as Service[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Handle service activation/deactivation
  const toggleServiceStatus = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const supabase = createClient();
    const newStatus = !service.is_active;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, is_active: newStatus } : s
      ));

      toast.success(`Service ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Failed to ${newStatus ? 'activate' : 'deactivate'} service`);
    }
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.filter(s => s.id !== serviceId));

      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete service');
    }
  };

  // Start editing a service
  const startEditing = (service: Service) => {
    setEditingService(service);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingService(null);
  };

  // Save edited service
  const saveEditedService = async () => {
    if (!editingService) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editingService.name,
          base_price: editingService.base_price,
          billing_unit: editingService.billing_unit,
          platform_fee: editingService.platform_fee,
          is_active: editingService.is_active
        })
        .eq('id', editingService.id);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === editingService.id ? editingService : s
      ));

      toast.success('Service updated successfully!');
      setEditingService(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update service');
    }
  };

  // Add new service
  const addNewService = async () => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          category: newService.category,
          base_price: newService.base_price,
          billing_unit: newService.billing_unit,
          platform_fee: newService.platform_fee,
          is_active: newService.is_active
        });

      if (error) throw error;

      // Refresh the services list
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesData) {
        setServices(servicesData as Service[]);
      }

      toast.success('Service added successfully!');
      
      // Reset form
      setNewService({
        name: '',
        category: '',
        base_price: 0,
        is_active: true,
        billing_unit: 'hour',
        platform_fee: 0,
        icon: 'package'
      });
    } catch (error) {
      console.error('Insert error:', error);
      toast.error('Failed to add service');
    }
  };

  // Get icon component based on service category
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'water':
        return Droplets;
      case 'shipping':
        return Truck;
      case 'construction':
        return Construction;
      default:
        return Package;
    }
  };

  // Get billing unit display text
  const getBillingUnitText = (unit: string) => {
    switch (unit) {
      case 'hour':
        return 'Per Hour';
      case 'load':
        return 'Per Load';
      case 'trip':
        return 'Per Trip';
      case 'item':
        return 'Per Item';
      default:
        return 'Per Unit';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Categories</h1>
          <p className="text-slate-500 text-sm">Configure available services, icons, and pricing units.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => document.getElementById('add-service-modal')?.classList.remove('hidden')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Add New Category
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.icon || 'package');
            const isEditing = editingService?.id === service.id;
            
            return (
              <div 
                key={service.id} 
                className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm transition-all ${
                  isEditing 
                    ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/[0.02]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center border ${
                      isEditing 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-primary/20' 
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <IconComponent className={`text-3xl ${
                        isEditing ? 'text-primary' : 'text-slate-600 dark:text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          isEditing 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {getBillingUnitText(service.billing_unit)}
                        </span>
                        <span className="text-xs text-slate-400">5 Sub-services active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <button 
                          onClick={() => startEditing(service)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteService(service.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-500 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Currently Editing
                      </span>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
                        <input
                          type="text"
                          value={editingService.name}
                          onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Billing Unit</label>
                        <select
                          value={editingService.billing_unit}
                          onChange={(e) => setEditingService({...editingService, billing_unit: e.target.value as any})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
                        >
                          <option value="hour">Per Hour</option>
                          <option value="load">Per Load</option>
                          <option value="trip">Per Trip</option>
                          <option value="item">Per Item</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Base Price ($)</label>
                        <input
                          type="number"
                          value={editingService.base_price}
                          onChange={(e) => setEditingService({...editingService, base_price: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform Fee (%)</label>
                        <input
                          type="number"
                          value={editingService.platform_fee}
                          onChange={(e) => setEditingService({...editingService, platform_fee: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mt-4">
                      <div>
                        <p className="text-sm font-bold">Service Visibility</p>
                        <p className="text-[10px] text-slate-500">Currently {service.is_active ? 'visible' : 'hidden'} to all customers</p>
                      </div>
                      <button 
                        onClick={() => setEditingService({...editingService, is_active: !editingService.is_active})}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          editingService.is_active ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                          editingService.is_active 
                            ? 'left-5 bg-white' 
                            : 'left-1 bg-white'
                        }`}></span>
                      </button>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-3">
                      <button 
                        onClick={saveEditedService}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" /> Save Changes
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex gap-3">
              <Lightbulb className="text-indigo-500 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Configuration Tip</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1 leading-relaxed">
                  Changing the billing unit will automatically update the interface for both customers and drivers for all sub-services in this category.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Service Modal */}
      <div id="add-service-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Service Category</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="Enter service name..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <input
                  type="text"
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  placeholder="Enter category..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Billing Unit</label>
                <select
                  value={newService.billing_unit}
                  onChange={(e) => setNewService({...newService, billing_unit: e.target.value as any})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="hour">Per Hour</option>
                  <option value="load">Per Load</option>
                  <option value="trip">Per Trip</option>
                  <option value="item">Per Item</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Base Price ($)</label>
                  <input
                    type="number"
                    value={newService.base_price}
                    onChange={(e) => setNewService({...newService, base_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform Fee (%)</label>
                  <input
                    type="number"
                    value={newService.platform_fee}
                    onChange={(e) => setNewService({...newService, platform_fee: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-bold">Service Visibility</p>
                  <p className="text-[10px] text-slate-500">Make service visible to customers</p>
                </div>
                <button 
                  onClick={() => setNewService({...newService, is_active: !newService.is_active})}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    newService.is_active ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                    newService.is_active 
                      ? 'left-5 bg-white' 
                      : 'left-1 bg-white'
                  }`}></span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  const modal = document.getElementById('add-service-modal');
                  if (modal) modal.classList.add('hidden');
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={addNewService}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}