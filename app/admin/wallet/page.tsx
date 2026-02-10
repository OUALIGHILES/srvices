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
  Wallet,
  PlusCircle,
  FileDown,
  Filter,
  User,
  Receipt,
  Megaphone,
  Lock,
  BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces
interface Transaction {
  id: string;
  transaction_id: string;
  category: string;
  account_entity: string;
  entity_id: string;
  date: string;
  status: 'success' | 'processing' | 'failed';
  amount: number;
  type: 'inbound' | 'outbound';
}

export default function AdminWalletPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  
  // Mock financial data
  const totalBalance = 2450182.50;
  const availableForSettle = 124500.00;
  const pendingClearance = 32140.80;
  const taxProvision = 18400.00;
  const targetPayout = 42850.00;
  const fundedPercentage = 85;
  const customerPrepaid = 218400.00;
  const disputedFunds = 2105.00;

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(50);

        if (!transactionsError && transactionsData) {
          setTransactions(transactionsData as Transaction[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Filter transactions based on selection
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    if (transactionFilter === 'inbound') return transaction.type === 'inbound';
    if (transactionFilter === 'outbound') return transaction.type === 'outbound';
    return true;
  });

  // Get current transactions for pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'driver settlement':
        return <User className="h-4 w-4 text-red-500" />;
      case 'ride revenue':
        return <Receipt className="h-4 w-4 text-emerald-500" />;
      case 'ad revenue':
        return <Megaphone className="h-4 w-4 text-indigo-500" />;
      default:
        return <Receipt className="h-4 w-4 text-slate-500" />;
    }
  };

  // Get status color classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  // Handle settle all drivers
  const handleSettleAllDrivers = () => {
    toast.info('Initiating driver settlements...');
    // In a real app, this would trigger a backend process
  };

  // Handle deposit funds
  const handleDepositFunds = () => {
    toast.info('Opening deposit interface...');
    // In a real app, this would open a deposit form
  };

  // Handle monthly report
  const handleMonthlyReport = () => {
    toast.info('Generating monthly report...');
    // In a real app, this would generate a report
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-primary/20 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-45">
            <Wallet className="h-52 w-52" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-widest">Platform Operations Account</p>
                <h1 className="text-4xl font-bold mt-1 tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Available for Settle</p>
                <p className="text-xl font-bold">${availableForSettle.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Pending Clearance</p>
                <p className="text-xl font-bold text-blue-100">${pendingClearance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Tax Provision</p>
                <p className="text-xl font-bold">${taxProvision.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-4 relative z-10">
            <button
              onClick={handleSettleAllDrivers}
              className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              <DollarSign className="h-5 w-5" /> Settle All Drivers
            </button>
            <button 
              onClick={handleDepositFunds}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <PlusCircle className="h-5 w-5" /> Deposit Funds
            </button>
            <button 
              onClick={handleMonthlyReport}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <FileDown className="h-5 w-5" /> Monthly Report
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">Next Payout Cycle</h4>
              <span className="px-2 py-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold rounded uppercase">In 2 Days</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-500 text-sm">Target Amount</p>
                <h3 className="text-2xl font-bold">${targetPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 text-sm font-bold">{fundedPercentage}% Funded</p>
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${fundedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 dark:text-white">Escrow Holdings</h4>
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Customer Pre-paid</span>
                <span className="font-bold">${customerPrepaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Disputed Funds</span>
                <span className="font-bold text-red-500">${disputedFunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-lg">Financial Movement History</h4>
            <p className="text-xs text-slate-500">Tracking all platform-level transactions and driver settlements</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setTransactionFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-sm ${
                  transactionFilter === 'all' 
                    ? 'bg-white dark:bg-slate-700' 
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setTransactionFilter('inbound')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  transactionFilter === 'inbound' 
                    ? 'bg-white dark:bg-slate-700 font-bold' 
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Inbound
              </button>
              <button 
                onClick={() => setTransactionFilter('outbound')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  transactionFilter === 'outbound' 
                    ? 'bg-white dark:bg-slate-700 font-bold' 
                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Outbound
              </button>
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account / Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-slate-900 dark:text-white uppercase">{transaction.transaction_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(transaction.category)}
                      <span className="text-sm">{transaction.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.category === 'Driver Settlement' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-primary' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {transaction.category === 'Driver Settlement' ? (
                          <User className="h-4 w-4" />
                        ) : transaction.category === 'Ad Revenue' ? (
                          <Megaphone className="h-4 w-4" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.account_entity}</p>
                        <p className="text-[10px] text-slate-400">#{transaction.entity_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(transaction.date).toLocaleDateString()} <span className="mx-1">•</span> {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    transaction.type === 'inbound' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {transaction.type === 'inbound' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing {Math.min(indexOfFirstItem + 10, filteredTransactions.length)} of {filteredTransactions.length} transactions</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm ${
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
              className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm ${
                currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <footer className="p-6 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Secure Financial Gateway</p>
              <p className="text-xs text-slate-500">All transactions are encrypted and audited via PCI-DSS standards.</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <a className="text-xs font-semibold text-slate-400 hover:text-primary uppercase tracking-wider" href="#">Audit Logs</a>
            <a className="text-xs font-semibold text-slate-400 hover:text-primary uppercase tracking-wider" href="#">Payout Settings</a>
            <a className="text-xs font-semibold text-slate-400 hover:text-primary uppercase tracking-wider" href="#">Help Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}