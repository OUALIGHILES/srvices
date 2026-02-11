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
  booking_id: string;
  customer_id: string;
  driver_id: string;
  gross_amount: number;
  company_fee: number;
  driver_amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

interface FinancialSummary {
  totalBalance: number;
  availableForSettle: number;
  pendingClearance: number;
  taxProvision: number;
  targetPayout: number;
  fundedPercentage: number;
  customerPrepaid: number;
  disputedFunds: number;
}

export default function AdminWalletPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');

  // State for financial summary data
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    availableForSettle: 0,
    pendingClearance: 0,
    taxProvision: 0,
    targetPayout: 0,
    fundedPercentage: 0,
    customerPrepaid: 0,
    disputedFunds: 0
  });

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
          .order('created_at', { ascending: false })
          .limit(50);

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
          toast.error('Failed to fetch transactions');
        } else if (transactionsData) {
          setTransactions(transactionsData as Transaction[]);
        }

        // Fetch financial summary using the stored procedure
        const { data: summaryData, error: summaryError } = await supabase.rpc('calculate_financial_summary');
        
        if (summaryError) {
          console.error('Error fetching financial summary:', summaryError);
          toast.error('Failed to fetch financial summary');
          
          // Fallback calculation if RPC fails
          const totalBalance = transactionsData?.reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;
          const availableForSettle = transactionsData?.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.driver_amount || 0), 0) || 0;
          const pendingClearance = transactionsData?.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.gross_amount || 0), 0) || 0;
          const taxProvision = transactionsData?.reduce((sum, t) => sum + (t.company_fee || 0), 0) || 0;

          setFinancialSummary({
            totalBalance,
            availableForSettle,
            pendingClearance,
            taxProvision,
            targetPayout: 50000, // Example target
            fundedPercentage: 0, // Will be calculated below
            customerPrepaid: 0, // Would need to query customer wallets
            disputedFunds: 0 // Would need to query disputed transactions
          });
        } else if (summaryData && summaryData.length > 0) {
          // Calculate funded percentage based on target payout
          const calculatedFundedPercentage = summaryData[0].target_payout > 0 
            ? Math.round((summaryData[0].total_balance / summaryData[0].target_payout) * 100) 
            : 0;

          setFinancialSummary({
            totalBalance: Number(summaryData[0].total_balance),
            availableForSettle: Number(summaryData[0].available_for_settle),
            pendingClearance: Number(summaryData[0].pending_clearance),
            taxProvision: Number(summaryData[0].tax_provision),
            targetPayout: Number(summaryData[0].target_payout),
            fundedPercentage: calculatedFundedPercentage,
            customerPrepaid: Number(summaryData[0].customer_prepaid),
            disputedFunds: Number(summaryData[0].disputed_funds)
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, router]);

  // Filter transactions based on selection
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    if (transactionFilter === 'inbound') return transaction.driver_amount > 0;
    if (transactionFilter === 'outbound') return transaction.driver_amount <= 0;
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
      case 'service payment':
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
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'refunded':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  // Handle settle all drivers
  const handleSettleAllDrivers = async () => {
    const supabase = createClient();
    
    try {
      // Show loading state
      toast.loading('Processing driver settlements...', { id: 'settlement' });
      
      // In a real app, this would call a backend function to settle all drivers
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh the data after settlement
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Error fetching transactions after settlement:', transactionsError);
        toast.error('Failed to update transactions after settlement');
      } else if (transactionsData) {
        setTransactions(transactionsData as Transaction[]);
      }

      // Refresh financial summary
      const { data: summaryData, error: summaryError } = await supabase.rpc('calculate_financial_summary');
      
      if (summaryError) {
        console.error('Error fetching financial summary after settlement:', summaryError);
        toast.error('Failed to update financial summary after settlement');
      } else if (summaryData && summaryData.length > 0) {
        const calculatedFundedPercentage = summaryData[0].target_payout > 0 
          ? Math.round((summaryData[0].total_balance / summaryData[0].target_payout) * 100) 
          : 0;

        setFinancialSummary({
          totalBalance: Number(summaryData[0].total_balance),
          availableForSettle: Number(summaryData[0].available_for_settle),
          pendingClearance: Number(summaryData[0].pending_clearance),
          taxProvision: Number(summaryData[0].tax_provision),
          targetPayout: Number(summaryData[0].target_payout),
          fundedPercentage: calculatedFundedPercentage,
          customerPrepaid: Number(summaryData[0].customer_prepaid),
          disputedFunds: Number(summaryData[0].disputed_funds)
        });
      }
      
      toast.success('Driver settlements processed successfully!', { id: 'settlement' });
    } catch (error) {
      console.error('Error processing settlements:', error);
      toast.error('Failed to process driver settlements', { id: 'settlement' });
    }
  };

  // Handle deposit funds
  const handleDepositFunds = async () => {
    // In a real app, this would open a deposit form or modal
    // For now, we'll simulate the process
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('Deposit processed successfully!');
        }, 2000);
      }),
      {
        loading: 'Processing deposit...',
        success: (data) => {
          // Refresh the data after deposit
          const fetchData = async () => {
            const supabase = createClient();
            
            const { data: transactionsData, error: transactionsError } = await supabase
              .from('transactions')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(50);

            if (transactionsError) {
              console.error('Error fetching transactions after deposit:', transactionsError);
            } else if (transactionsData) {
              setTransactions(transactionsData as Transaction[]);
            }

            // Refresh financial summary
            const { data: summaryData, error: summaryError } = await supabase.rpc('calculate_financial_summary');
            
            if (summaryError) {
              console.error('Error fetching financial summary after deposit:', summaryError);
            } else if (summaryData && summaryData.length > 0) {
              const calculatedFundedPercentage = summaryData[0].target_payout > 0 
                ? Math.round((summaryData[0].total_balance / summaryData[0].target_payout) * 100) 
                : 0;

              setFinancialSummary({
                totalBalance: Number(summaryData[0].total_balance),
                availableForSettle: Number(summaryData[0].available_for_settle),
                pendingClearance: Number(summaryData[0].pending_clearance),
                taxProvision: Number(summaryData[0].tax_provision),
                targetPayout: Number(summaryData[0].target_payout),
                fundedPercentage: calculatedFundedPercentage,
                customerPrepaid: Number(summaryData[0].customer_prepaid),
                disputedFunds: Number(summaryData[0].disputed_funds)
              });
            }
          };
          
          fetchData();
          return data;
        },
        error: 'Failed to process deposit',
      }
    );
  };

  // Handle monthly report
  const handleMonthlyReport = () => {
    // In a real app, this would generate a downloadable report
    // For now, we'll simulate the process
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('Monthly report generated successfully!');
        }, 1500);
      }),
      {
        loading: 'Generating monthly report...',
        success: 'Monthly report generated successfully!',
        error: 'Failed to generate monthly report',
      }
    );
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
                <h1 className="text-4xl font-bold mt-1 tracking-tight">${financialSummary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Available for Settle</p>
                <p className="text-xl font-bold">${financialSummary.availableForSettle.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Pending Clearance</p>
                <p className="text-xl font-bold text-blue-100">${financialSummary.pendingClearance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-blue-200 text-xs font-medium uppercase mb-1">Tax Provision</p>
                <p className="text-xl font-bold">${financialSummary.taxProvision.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
              <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold rounded uppercase">In 2 Days</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-500 text-sm">Target Amount</p>
                <h3 className="text-2xl font-bold">${financialSummary.targetPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 text-sm font-bold">{financialSummary.fundedPercentage}% Funded</p>
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${financialSummary.fundedPercentage}%` }}
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
                <span className="font-bold">${financialSummary.customerPrepaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Disputed Funds</span>
                <span className="font-bold text-red-500">${financialSummary.disputedFunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                    <span className="text-sm font-mono font-medium text-slate-900 dark:text-white uppercase">{transaction.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('Service Payment')}
                      <span className="text-sm">Service Payment</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.driver_amount > 0
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-primary'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {transaction.driver_amount > 0 ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Booking #{transaction.booking_id.substring(0, 8)}</p>
                        <p className="text-[10px] text-slate-400">C: {transaction.customer_id.substring(0, 8)} D: {transaction.driver_id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(transaction.created_at).toLocaleDateString()} <span className="mx-1">•</span> {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    transaction.driver_amount > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {transaction.driver_amount > 0 ? '+' : '-'}${Math.abs(transaction.gross_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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