'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Settings, DollarSign, Car, UserPlus, Star, Bell, LayoutDashboard, Clipboard, Users, Car as LocalTaxi, Square, CreditCard, Settings as SettingsIcon } from 'lucide-react'

// Define interfaces
interface Booking {
  id: string
  customer_id: string
  service_id: string
  status: string
  created_at: string
}

interface User {
  id: string
  email: string
  full_name: string
  user_type: 'customer' | 'driver' | 'admin'
  status: 'active' | 'suspended' | 'pending_approval'
  created_at: string
}

interface Transaction {
  id: string
  booking_id: string
  gross_amount: number
  company_fee: number
  driver_amount: number
  status: string
  created_at: string
}

interface Service {
  id: string
  name: string
  base_price: number
  is_active: boolean
}

interface PricingRule {
  id: string
  service_id: string
  customer_fixed_price?: number
  driver_percentage?: number
  driver_fixed_price?: number
  is_active: boolean
  service?: Service
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    completedOrders: 0,
  })

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Wait for auth to finish loading
      if (!user && !authLoading) {
        // If not authenticated and loading is complete, redirect to login
        router.push('/login');
        return;
      }

      if (user && profile) {
        // If user is authenticated but not an admin, redirect appropriately
        if (profile.user_type !== 'admin') {
          if (profile.user_type === 'driver') {
            router.push('/driver/dashboard');
          } else if (profile.user_type === 'customer') {
            router.push('/customer/dashboard');
          } else {
            router.push('/');
          }
          return;
        }

        // If user is admin, fetch data
        const supabase = createClient();

        try {
          // Fetch bookings
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

          if (!bookingsError) {
            setBookings(bookingsData || [])
          }

          // Fetch users
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

          if (!usersError) {
            setUsers(usersData || [])
          }

          // Fetch transactions
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

          if (!transactionsError) {
            setTransactions(transactionsData || [])

            // Calculate revenue
            const totalRevenue = (transactionsData || []).reduce(
              (sum, t) => sum + (t.company_fee || 0),
              0
            )
            setStats((prev) => ({ ...prev, totalRevenue }))
          }

          // Calculate stats
          if (usersData && bookingsData) {
            const totalUsers = usersData.length
            const activeDrivers = usersData.filter(
              (u) => u.user_type === 'driver' && u.status === 'active'
            ).length
            const completedOrders = bookingsData.filter(
              (b) => b.status === 'completed'
            ).length

            setStats((prev) => ({
              ...prev,
              totalUsers,
              activeDrivers,
              completedOrders,
            }))
          }

          // Fetch services
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)

          if (!servicesError) {
            setServices(servicesData || [])
          }

          // Fetch pricing rules
          const { data: rulesData, error: rulesError } = await supabase
            .from('pricing_rules')
            .select('*')
            .order('created_at', { ascending: true })

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
                  .select('id, name, base_price, is_active')
                  .eq('id', rule.service_id)
                  .single()

                return { ...rule, service: serviceData }
              })
            )

            setPricingRules(rulesWithServices)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setDataLoading(false)
        }
      } else if (user && !profile && !authLoading) {
        // If user is authenticated but profile is not loaded (and auth is done loading),
        // it means there's an issue with the profile, redirect to login
        router.push('/login');
      }
    };

    checkAuthAndFetchData();
  }, [user, profile, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <span className="text-xl">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">RideMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">Admin User</p>
                <p className="text-xs text-gray-500 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">AU</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Wrapper */}
      <header className="sticky top-0 z-50 w-full">
        {/* Primary Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="text-xl">R</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800">RideMaster</span>
            </div>
            {/* Global Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-96 border border-transparent focus-within:border-blue-500 transition-all">
              <span className="text-gray-400 text-sm">🔍</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-500" placeholder="Search orders, users, drivers..." type="text"/>
              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-400 font-mono">
                <span>⌘</span><span>K</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Global Stats Summary (Inline) */}
            <div className="hidden xl:flex items-center gap-6 mr-6 border-r border-gray-200 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Active Drivers</span>
                <span className="text-sm font-bold text-emerald-500">{stats.activeDrivers} <span className="text-[10px] text-gray-400 font-normal ml-1">Live</span></span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Ongoing Trips</span>
                <span className="text-sm font-bold text-blue-600">{stats.completedOrders}</span>
              </div>
            </div>
            {/* Utility Icons */}
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">Admin User</p>
                <p className="text-xs text-gray-500 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">AU</span>
              </div>
            </div>
          </div>
        </div>
        {/* Secondary Navigation (Module Bar) */}
        <nav className="bg-white border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex items-center gap-8">
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/dashboard' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/dashboard">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/bookings' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/bookings">
              <Clipboard className="h-4 w-4" /> Orders
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/pricing' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/pricing">
              <Settings className="h-4 w-4" /> Pricing
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/users' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/users">
              <Users className="h-4 w-4" /> Users
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/drivers' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/drivers">
              <LocalTaxi className="h-4 w-4" /> Drivers
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/services' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/services">
              <Square className="h-4 w-4" /> Services
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/wallet' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/wallet">
              <CreditCard className="h-4 w-4" /> Wallet
            </Link>
            <Link className={`py-4 border-b-2 ${router.pathname === '/admin/settings' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'} text-sm flex items-center gap-2 whitespace-nowrap`} href="/admin/settings">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area - This is where the child pages will be rendered */}
      <main className="max-w-[1600px] mx-auto p-6">
        {children}
      </main>
    </div>
  )
}