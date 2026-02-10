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
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces
interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'customer' | 'driver' | 'admin';
  status: 'active' | 'suspended' | 'pending_approval';
  created_at: string;
  phone?: string;
  location?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    userType: '',
    search: ''
  });
  
  const itemsPerPage = 8;

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!usersError && usersData) {
          setUsers(usersData);
          setFilteredUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Apply filters
  useEffect(() => {
    let result = users;
    
    if (filters.search) {
      result = result.filter(u => 
        u.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(u => u.status === filters.status);
    }
    
    if (filters.userType) {
      result = result.filter(u => u.user_type === filters.userType);
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, users]);

  // Get current users for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle filter changes
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: '', userType: '', search: '' });
  };

  // Export data
  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Email', 'Full Name', 'User Type', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(u => [
          `"${u.email}"`,
          `"${u.full_name || ''}"`,
          u.user_type,
          u.status,
          new Date(u.created_at).toISOString()
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Users exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, newStatus: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus as any } : u
      ));
      setFilteredUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus as any } : u
      ));
      
      toast.success('User status updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user status');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      setFilteredUsers(prev => prev.filter(u => u.id !== userId));
      
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  // View user details
  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    // In a real app, you might navigate to a detail page
    toast.info(`Viewing details for ${user.full_name || user.email}`);
  };

  // Get status color classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'suspended':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'pending_approval':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management Hub</h1>
          <p className="text-slate-500 text-sm">Monitor, manage, and engage with all platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentUsers.map((user) => {
                const initials = user.full_name
                  ? user.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                  : user.email.substring(0, 2).toUpperCase();
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{user.location || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClass(user.status)}`}>
                          {user.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button 
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 z-10 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                            <button
                              onClick={() => {
                                viewUserDetails(user);
                                setShowActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </button>
                            
                            {user.status !== 'active' && (
                              <button
                                onClick={() => {
                                  updateUserStatus(user.id, 'active');
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Check className="h-4 w-4" /> Activate
                              </button>
                            )}
                            
                            {user.status !== 'suspended' && (
                              <button
                                onClick={() => {
                                  updateUserStatus(user.id, 'suspended');
                                  setShowActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Ban className="h-4 w-4" /> Suspend
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                deleteUser(user.id);
                                setShowActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-xs font-medium rounded border ${
                    currentPage === pageNum 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filter Users</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Type</label>
                  <select
                    value={filters.userType}
                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}