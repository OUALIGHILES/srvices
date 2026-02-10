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
  Filter,
  Plus,
  CheckCircle,
  AlertTriangle,
  BadgeCheck,
  Star,
  FileDown,
  SortAsc,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces
interface Driver {
  id: string;
  email: string;
  full_name: string;
  user_type: 'driver';
  status: 'active' | 'suspended' | 'pending_approval' | 'verified';
  created_at: string;
  phone?: string;
  license_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate?: string;
  rating?: number;
  total_rides?: number;
}

export default function AdminDriversPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDriverForDocuments, setSelectedDriverForDocuments] = useState<Driver | null>(null);
  const [driverDocuments, setDriverDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [newDriver, setNewDriver] = useState({
    email: '',
    full_name: '',
    phone: '',
    license_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_plate: '',
    password: '',
    confirmPassword: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch drivers (users with user_type = 'driver')
        const { data: driversData, error: driversError } = await supabase
          .from('users')
          .select('*')
          .eq('user_type', 'driver')
          .order('created_at', { ascending: false });

        if (!driversError && driversData) {
          setDrivers(driversData as Driver[]);
          setFilteredDrivers(driversData as Driver[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Apply filters and search
  useEffect(() => {
    let result = drivers;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.full_name?.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        d.license_number?.toLowerCase().includes(term) ||
        d.vehicle_plate?.toLowerCase().includes(term)
      );
    }
    
    setFilteredDrivers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, searchTerm, drivers]);

  // Get current drivers for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  // Calculate statistics
  const verificationQueue = drivers.filter(d => d.status === 'pending_approval').length;
  const activeDrivers = drivers.filter(d => d.status === 'active' || d.status === 'verified').length;
  const expiringDocs = drivers.filter(d => {
    // In a real app, this would check actual document expiration dates
    return false; // Placeholder logic
  }).length;

  // Update driver status
  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', driverId);
        
      if (error) throw error;
      
      // Update local state
      setDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, status: newStatus as any } : d
      ));
      setFilteredDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, status: newStatus as any } : d
      ));
      
      toast.success('Driver status updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update driver status');
    }
  };

  // Delete driver
  const deleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', driverId);
        
      if (error) throw error;
      
      // Update local state
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      setFilteredDrivers(prev => prev.filter(d => d.id !== driverId));
      
      toast.success('Driver deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete driver');
    }
  };

  // Export drivers data
  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Email', 'Full Name', 'License Number', 'Vehicle', 'Status', 'Rating', 'Total Rides'];
      const csvContent = [
        headers.join(','),
        ...filteredDrivers.map(d => [
          `"${d.email}"`,
          `"${d.full_name || ''}"`,
          `"${d.license_number || ''}"`,
          `"${d.vehicle_make ? `${d.vehicle_make} ${d.vehicle_model}` : 'N/A'}"`,
          d.status,
          d.rating || 'N/A',
          d.total_rides || 0
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `drivers-export-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Drivers exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export drivers');
    }
  };

  // Get status color classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'suspended':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'pending_approval':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'suspended':
        return <Ban className="h-4 w-4 text-red-600" />;
      case 'pending_approval':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Update document status
  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('driver_documents')
        .update({ status: newStatus })
        .eq('id', documentId);
        
      if (error) throw error;
      
      // Refresh the documents list
      if (selectedDriverForDocuments) {
        await fetchDriverDocuments(selectedDriverForDocuments.id);
      }
      
      toast.success(`Document ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    }
  };

  // Fetch driver documents
  const fetchDriverDocuments = async (driverId: string) => {
    setLoadingDocuments(true);
    try {
      const supabase = createClient();
      
      const { data: documents, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId);
        
      if (error) throw error;
      
      setDriverDocuments(documents || []);
    } catch (error) {
      console.error('Error fetching driver documents:', error);
      toast.error('Failed to fetch driver documents');
      setDriverDocuments([]); // Set empty array on error
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Add new driver
  const addNewDriver = async () => {
    if (!newDriver.email || !newDriver.full_name) {
      toast.error('Email and Full Name are required');
      return;
    }

    // Validate password fields
    if (!newDriver.password || !newDriver.confirmPassword) {
      toast.error('Password and Confirmation Password are required');
      return;
    }

    if (newDriver.password !== newDriver.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/drivers/add-driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newDriver.email,
          full_name: newDriver.full_name,
          phone: newDriver.phone,
          license_number: newDriver.license_number,
          vehicle_make: newDriver.vehicle_make,
          vehicle_model: newDriver.vehicle_model,
          vehicle_color: newDriver.vehicle_color,
          vehicle_plate: newDriver.vehicle_plate,
          password: newDriver.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add driver');
      }

      // Refresh the drivers list
      const supabase = createClient();
      const { data: driversData, error: driversError } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'driver')
        .order('created_at', { ascending: false });

      if (!driversError && driversData) {
        setDrivers(driversData as Driver[]);
        setFilteredDrivers(driversData as Driver[]);
      }

      // Reset form and close modal
      setNewDriver({
        email: '',
        full_name: '',
        phone: '',
        license_number: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_color: '',
        vehicle_plate: '',
        password: '',
        confirmPassword: ''
      });
      setShowAddDriverModal(false);

      toast.success('Driver added successfully! Awaiting approval.');
    } catch (error: any) {
      console.error('Add driver error:', error);
      toast.error(error.message || 'Failed to add driver');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Management</h1>
          <p className="text-slate-500 text-sm">Monitor performance, verify credentials, and manage the fleet workforce.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> 
              {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'all' ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  All Status
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'active' ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('pending_approval');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'pending_approval' ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Pending Approval
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('suspended');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'suspended' ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Suspended
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowAddDriverModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Add New Driver
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verification Queue</p>
              <h3 className="text-2xl font-bold">{verificationQueue} <span className="text-sm font-normal text-slate-400">pending</span></h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Drivers</p>
              <h3 className="text-2xl font-bold">{activeDrivers} <span className="text-sm font-normal text-slate-400">verified</span></h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Expiring Docs</p>
              <h3 className="text-2xl font-bold">{expiringDocs} <span className="text-sm font-normal text-slate-400">next 7 days</span></h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID or license..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
              <SortAsc className="h-4 w-4" />
            </button>
            <button 
              onClick={handleExport}
              className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <FileDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentDrivers.map((driver) => {
                const initials = driver.full_name
                  ? driver.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                  : driver.email.substring(0, 2).toUpperCase();
                
                return (
                  <tr key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{driver.full_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">ID: {driver.id.substring(0, 4).toUpperCase()}-{driver.id.substring(28, 32).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{driver.vehicle_make ? `${driver.vehicle_make} ${driver.vehicle_model}` : 'N/A'}</p>
                      <p className="text-xs text-slate-500">{driver.vehicle_plate || 'N/A'} • {driver.vehicle_color || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">{driver.rating ? driver.rating.toFixed(2) : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(driver.status)}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClass(driver.status)}`}>
                          {driver.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {driver.status === 'pending_approval' ? (
                        <button
                          onClick={async () => {
                            setSelectedDriverForDocuments(driver);
                            await fetchDriverDocuments(driver.id);
                            setShowDocumentModal(true);
                          }}
                          className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Inspect Documents
                        </button>
                      ) : (
                        <div className="relative">
                          <button 
                            onClick={() => setShowActionMenu(showActionMenu === driver.id ? null : driver.id)}
                            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Actions
                          </button>
                          
                          {showActionMenu === driver.id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                              <button
                                onClick={() => {
                                  toast.info(`Viewing history for ${driver.full_name || driver.email}`);
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Eye className="h-4 w-4" /> View History
                              </button>
                              
                              {driver.status !== 'active' && (
                                <button
                                  onClick={() => {
                                    updateDriverStatus(driver.id, 'active');
                                    setShowActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Check className="h-4 w-4" /> Activate
                                </button>
                              )}
                              
                              {driver.status !== 'suspended' && (
                                <button
                                  onClick={() => {
                                    updateDriverStatus(driver.id, 'suspended');
                                    setShowActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Ban className="h-4 w-4" /> Suspend
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  deleteDriver(driver.id);
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDrivers.length)} of {filteredDrivers.length} drivers</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-sm ${
                    currentPage === pageNum 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Driver</h3>
              <p className="text-slate-500 text-sm">Enter driver details to create a new account</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newDriver.full_name}
                  onChange={(e) => setNewDriver({...newDriver, full_name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newDriver.password}
                  onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={newDriver.confirmPassword}
                  onChange={(e) => setNewDriver({...newDriver, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="Confirm password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number</label>
                <input
                  type="text"
                  value={newDriver.license_number}
                  onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="ABC123456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    value={newDriver.vehicle_make}
                    onChange={(e) => setNewDriver({...newDriver, vehicle_make: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    value={newDriver.vehicle_model}
                    onChange={(e) => setNewDriver({...newDriver, vehicle_model: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    placeholder="Camry"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={newDriver.vehicle_color}
                    onChange={(e) => setNewDriver({...newDriver, vehicle_color: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    placeholder="Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={newDriver.vehicle_plate}
                    onChange={(e) => setNewDriver({...newDriver, vehicle_plate: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    placeholder="XYZ123"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowAddDriverModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addNewDriver}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspection Modal */}
      {showDocumentModal && selectedDriverForDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Document Verification</h3>
                  <p className="text-slate-500 text-sm">Review documents for {selectedDriverForDocuments.full_name || selectedDriverForDocuments.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDriverForDocuments(null);
                  }}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">Driver Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium">{selectedDriverForDocuments.full_name || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium">{selectedDriverForDocuments.email}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium">{selectedDriverForDocuments.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-500">License Number</p>
                    <p className="font-medium">{selectedDriverForDocuments.license_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">Required Documents</h4>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mr-3" />
                    <span>Loading documents...</span>
                  </div>
                ) : driverDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {driverDocuments.map((doc) => {
                      const docTypeDisplay = doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const statusClass = doc.status === 'approved' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' 
                        : doc.status === 'rejected' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
                      
                      return (
                        <div key={doc.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileDown className="h-5 w-5 text-slate-500" />
                              <span className="font-medium">{docTypeDisplay}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                          </div>
                          <div className="p-4 bg-slate-100 dark:bg-slate-900/30 min-h-[200px] flex flex-col">
                            {doc.document_url ? (
                              <div className="flex-grow text-center w-full">
                                <div className="mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-full h-64 flex items-center justify-center mb-2 overflow-auto">
                                  {doc.document_url.endsWith('.pdf') ? (
                                    <iframe 
                                      src={doc.document_url} 
                                      className="w-full h-full"
                                      title={`${docTypeDisplay} Document`}
                                      style={{ minHeight: '250px' }}
                                    />
                                  ) : (
                                    <img 
                                      src={doc.document_url} 
                                      alt={docTypeDisplay} 
                                      className="max-h-60 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = "/placeholder-document.png";
                                      }}
                                    />
                                  )}
                                </div>
                                <a 
                                  href={doc.document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary text-sm mt-2"
                                >
                                  <Eye className="h-4 w-4" /> View Full Document
                                </a>
                              </div>
                            ) : (
                              <div className="flex-grow text-center flex items-center justify-center">
                                <div className="text-center">
                                  <div className="mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-64 h-40 flex items-center justify-center mb-2">
                                    <span className="text-slate-400 text-sm">No document uploaded</span>
                                  </div>
                                  <p className="text-xs text-slate-500">Document not available</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Document Action Buttons - Only show for pending documents */}
                            {doc.status === 'pending' && (
                              <div className="flex justify-center gap-2 mt-4">
                                <button
                                  onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => updateDocumentStatus(doc.id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No documents submitted for verification
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    // Check if there are any pending documents
                    const hasPendingDocs = driverDocuments.some(doc => doc.status === 'pending');
                    
                    if (hasPendingDocs) {
                      if (window.confirm('There are still pending documents. Are you sure you want to reject this driver application?')) {
                        updateDriverStatus(selectedDriverForDocuments.id, 'suspended');
                        setShowDocumentModal(false);
                        setSelectedDriverForDocuments(null);
                      }
                    } else {
                      updateDriverStatus(selectedDriverForDocuments.id, 'suspended');
                      setShowDocumentModal(false);
                      setSelectedDriverForDocuments(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                >
                  Reject Driver
                </button>
                <button
                  onClick={() => {
                    // Check if all documents are approved
                    const allApproved = driverDocuments.every(doc => doc.status === 'approved');
                    const hasRejected = driverDocuments.some(doc => doc.status === 'rejected');
                    
                    if (!allApproved) {
                      if (hasRejected) {
                        alert('Cannot approve driver with rejected documents. Please review all documents first.');
                        return;
                      } else {
                        alert('Please review and approve all documents before approving the driver.');
                        return;
                      }
                    }
                    
                    updateDriverStatus(selectedDriverForDocuments.id, 'verified');
                    setShowDocumentModal(false);
                    setSelectedDriverForDocuments(null);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Approve Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}