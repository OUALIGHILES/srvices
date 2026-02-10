'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Settings, DollarSign, Car, UserPlus, Star, Bell, LayoutDashboard, Clipboard, Users, Car as LocalTaxi, Square, CreditCard, Settings as SettingsIcon } from 'lucide-react'

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

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    completedOrders: 0,
  })

  useEffect(() => {
    if (!user || profile?.user_type !== 'admin') {
      router.push('/login')
      return
    }

    const fetchData = async () => {
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
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, profile, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Welcome & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm">Real-time metrics for your service platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span className="text-sm">🔍</span> Filter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
              <span className="text-sm">⬇️</span> Export Data
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="text-[10px]">📈</span> 12.5%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalRevenue.toFixed(0)} SR</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="text-[10px]">📈</span> 8.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-1">{bookings.length}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="text-[10px]">📈</span> 14.2%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">New Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <Star className="h-5 w-5" />
              </div>
              <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="text-[10px]">-</span> 0.0%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Avg. Rating</p>
              <h3 className="text-2xl font-bold mt-1">4.8 / 5.0</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold">Revenue Performance</h4>
                <p className="text-xs text-gray-500">Comparison between last 30 days vs previous</p>
              </div>
              <select className="text-xs bg-gray-50 border-gray-200 rounded-lg focus:ring-blue-600">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="p-6 h-[400px] flex items-end justify-between gap-4 relative">
              {/* Faux Line Chart Visualization */}
              <div className="absolute inset-x-6 top-10 bottom-24 border-b border-gray-100 flex flex-col justify-between">
                <div className="w-full border-t border-gray-50"></div>
                <div className="w-full border-t border-gray-50"></div>
                <div className="w-full border-t border-gray-50"></div>
              </div>
              <div className="w-full h-full relative z-10 flex items-end justify-between pt-10">
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[40%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Mon</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[65%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Tue</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[50%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Wed</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[80%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Thu</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[75%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Fri</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[95%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Sat</span>
                </div>
                <div className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-blue-100 h-[60%] rounded-t-sm relative group-hover:bg-blue-200 transition-colors">
                    <div className="absolute -top-1 w-full border-t-2 border-blue-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2">Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity / Side Panels */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h4 className="font-bold mb-4">Live Activity</h4>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="text-sm">🛒</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Order <span className="text-blue-600">#ORD-5542</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">2 minutes ago • Downtown, NY</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Driver Registered</p>
                    <p className="text-xs text-gray-500 mt-0.5">15 minutes ago • Pending review</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Failed</p>
                    <p className="text-xs text-gray-500 mt-0.5">42 minutes ago • ID: user_982</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                    <span className="text-sm">💬</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Support Ticket</p>
                    <p className="text-xs text-gray-500 mt-0.5">1 hour ago • Urgent priority</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                View All Activity
              </button>
            </div>

            {/* System Health */}
            <div className="bg-blue-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">System Status</h4>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">API Latency</span>
                  <span className="font-mono">42ms</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full">
                  <div className="bg-white w-[92%] h-full rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Server Load</span>
                  <span className="font-mono">24%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h4 className="font-bold">Recent Service Transactions</h4>
            <a className="text-blue-600 text-sm font-semibold hover:underline" href="#">View All Orders</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.slice(0, 3).map((trans) => (
                  <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{trans.booking_id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">CU</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Customer {trans.booking_id.slice(0, 4)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">DR</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Driver {trans.booking_id.slice(0, 4)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Service {trans.booking_id.slice(0, 4)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{trans.gross_amount} SR</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trans.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        trans.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        trans.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {trans.status.charAt(0).toUpperCase() + trans.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Drivers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Drivers List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold">Active Drivers</h4>
              <a className="text-blue-600 text-sm font-semibold hover:underline" href="#">View All</a>
            </div>
            <div className="divide-y divide-gray-100">
              {users.filter(u => u.user_type === 'driver' && u.status === 'active').slice(0, 3).map((driver) => (
                <div key={driver.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">DR</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{driver.full_name}</p>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h4 className="font-bold">Service Distribution</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Standard Ride</span>
                    <span className="text-sm font-medium text-gray-700">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Premium</span>
                    <span className="text-sm font-medium text-gray-700">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Luxury</span>
                    <span className="text-sm font-medium text-gray-700">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
}