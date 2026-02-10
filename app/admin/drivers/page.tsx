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
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
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
                          onClick={() => updateDriverStatus(driver.id, 'verified')}
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
    </div>
  );
}