'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, TrendingUp, Download, Calendar } from 'lucide-react'

interface Transaction {
  id: string
  booking_id: string
  gross_amount: number
  company_fee: number
  driver_amount: number
  status: string
  created_at: string
}

export default function DriverEarningsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    weeklyEarnings: 0,
    completedJobs: 0,
    pendingAmount: 0,
  })

  useEffect(() => {
    if (!user || profile?.user_type !== 'driver') {
      router.push('/login')
      return
    }

    const fetchTransactions = async () => {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTransactions(data || [])

        // Calculate stats
        const completed = (data || []).filter((t) => t.status === 'completed')
        const totalEarnings = completed.reduce((sum, t) => sum + (t.driver_amount || 0), 0)
        const pending = (data || [])
          .filter((t) => t.status === 'pending')
          .reduce((sum, t) => sum + (t.driver_amount || 0), 0)

        // Calculate weekly earnings (last 7 days)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weeklyEarnings = completed
          .filter((t) => new Date(t.created_at) >= oneWeekAgo)
          .reduce((sum, t) => sum + (t.driver_amount || 0), 0)

        setStats({
          totalEarnings,
          weeklyEarnings,
          completedJobs: completed.length,
          pendingAmount: pending,
        })
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user, profile, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/driver/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Wallet</h1>
          <p className="mt-2 text-gray-600">View your earnings and request payouts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEarnings.toFixed(0)} SR</p>
            <p className="text-xs text-green-600 mt-2">All time</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">This Week</p>
            <p className="text-3xl font-bold text-gray-900">{stats.weeklyEarnings.toFixed(0)} SR</p>
            <p className="text-xs text-gray-600 mt-2">Last 7 days</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Completed Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completedJobs}</p>
            <p className="text-xs text-gray-600 mt-2">Total</p>
          </Card>

          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800 mb-2 font-medium">Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.pendingAmount.toFixed(0)} SR</p>
            <p className="text-xs text-yellow-700 mt-2">Awaiting completion</p>
          </Card>
        </div>

        {/* Wallet Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="mb-6">
            <p className="text-green-100 text-sm font-medium mb-2">Available for Payout</p>
            <p className="text-5xl font-bold">{(profile?.wallet_balance || 0).toFixed(0)} SR</p>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-white text-green-600 hover:bg-green-50">
              <Download className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white text-white hover:bg-green-600 bg-transparent"
              asChild
            >
              <Link href="/driver/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </Card>

        {/* Transactions */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>

            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          transaction.status === 'completed'
                            ? 'bg-green-100'
                            : transaction.status === 'pending'
                              ? 'bg-yellow-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        <TrendingUp
                          className={
                            transaction.status === 'completed'
                              ? 'h-6 w-6 text-green-600'
                              : 'h-6 w-6 text-yellow-600'
                          }
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Service Completed</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">
                        +{transaction.driver_amount?.toFixed(0) || 0} SR
                      </p>
                      <Badge
                        className={
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>

                    <div className="text-right ml-4 text-xs text-gray-600">
                      <p>Gross: {transaction.gross_amount.toFixed(0)} SR</p>
                      <p className="text-red-600">
                        Fee: -{transaction.company_fee?.toFixed(0) || 0} SR
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No earnings yet</p>
                <Button asChild variant="outline">
                  <Link href="/driver/dashboard">View Available Requests</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
