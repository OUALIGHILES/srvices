'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/customer-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Star, MessageCircle, Phone, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface Booking {
  id: string
  service_id: string
  location: string
  service_date: string
  quantity: number
  status: string
  created_at: string
}

interface Service {
  id: string
  name: string
  image_url: string
}

export default function CustomerDashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<(Booking & { service?: Service })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      // Wait for user to be loaded
      if (!user) {
        console.log('User not loaded yet, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User authenticated:', user.id)

      try {
        // Use the API route to fetch bookings securely
        const response = await fetch('/api/customer-bookings')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch bookings')
        }

        const { bookings } = await response.json()
        setBookings(bookings)
      } catch (error: any) {
        console.error('Error fetching bookings:', error)
        // Show a more detailed error message to the user
        setError(error.message || 'Failed to load bookings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'waiting_for_offers':
        return 'bg-yellow-100 text-yellow-800'
      case 'offer_accepted':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'active') {
      return ['waiting_for_offers', 'offer_accepted', 'in_progress'].includes(booking.status)
    } else if (activeTab === 'completed') {
      return booking.status === 'completed'
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Note: CustomerHeader is removed here because it's already included in the CustomerLayout */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Note: CustomerHeader is removed here because it's already included in the CustomerLayout */}
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your service bookings and track offers</p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Active Bookings</p>
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter((b) => ['waiting_for_offers', 'offer_accepted', 'in_progress'].includes(b.status))
                .length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Completed Services</p>
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === 'completed').length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Wallet Balance</p>
            <p className="text-3xl font-bold text-gray-900">{(profile?.wallet_balance || 0).toFixed(0)} SR</p>
          </Card>
        </div>

        {/* New Booking Button */}
        <div className="mb-8">
          <Button asChild size="lg">
            <Link href="/">Browse Services & Book</Link>
          </Button>
        </div>

        {/* Bookings Section */}
        <Card>
          <div className="p-6">
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Bookings</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <Link key={booking.id} href={`/bookings/${booking.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.service?.name || 'Service'}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Units: {booking.quantity}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(booking.service_date).toLocaleDateString()}
                              </span>
                            </div>

                            {booking.status === 'offer_accepted' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No active bookings</p>
                    <Button asChild variant="outline">
                      <Link href="/">Browse Services</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <Link key={booking.id} href={`/bookings/${booking.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.service?.name || 'Service'}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                Completed on {new Date(booking.service_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No completed bookings yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Link key={booking.id} href={`/bookings/${booking.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.service?.name || 'Service'}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {booking.location}
                              </div>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No bookings yet</p>
                    <Button asChild variant="outline">
                      <Link href="/">Start Booking</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  )
}