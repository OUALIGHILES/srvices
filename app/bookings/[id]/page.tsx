'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, MessageCircle, Phone, Star, MapPin, Clock } from 'lucide-react'

interface Booking {
  id: string
  service_id: string
  location: string
  service_date: string
  quantity: number
  notes: string
  status: string
  created_at: string
}

interface Offer {
  id: string
  booking_id: string
  driver_id: string
  offered_price: number
  status: string
  distance_km: number
  created_at: string
  driver?: {
    full_name: string
    rating: number
    total_reviews: number
  }
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const supabase = createClient();
      
      try {
        // Fetch booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (bookingError) throw bookingError
        setBooking(bookingData)

        // Fetch offers for this booking
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false })

        if (!offersError && offersData) {
          // Fetch driver details for each offer
          const offersWithDrivers = await Promise.all(
            offersData.map(async (offer) => {
              const mapSupabase = createClient(); // Create a new client for each async operation
              const { data: driverData } = await mapSupabase
                .from('users')
                .select('full_name, rating, total_reviews')
                .eq('id', offer.driver_id)
                .single()

              return { ...offer, driver: driverData }
            })
          )
          setOffers(offersWithDrivers)
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const handleAcceptOffer = async (offerId: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)

      if (error) throw error

      // Update booking status
      await supabase.from('bookings').update({ status: 'offer_accepted' }).eq('id', bookingId)

      router.push(`/messages/${bookingId}`)
    } catch (error) {
      console.error('Error accepting offer:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Booking not found</h2>
            <Button asChild className="mt-4">
              <Link href="/customer/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'waiting_for_offers':
        return 'bg-blue-100 text-blue-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/customer/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <Badge className={getStatusColor(booking.status)}>{getStatusLabel(booking.status)}</Badge>
          </div>
          <p className="text-gray-600">Booking ID: {bookingId}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location & Date */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Location & Schedule</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-base font-medium text-gray-900">{booking.location}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Date & Time</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(booking.service_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Special Instructions</p>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Offers */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Provider Offers ({offers.length})
              </h2>

              {offers.length > 0 ? (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{offer.driver?.full_name || 'Service Provider'}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {offer.driver?.rating || 4.5}
                              <span className="text-gray-600">
                                {' '}
                                ({offer.driver?.total_reviews || 0} reviews)
                              </span>
                            </span>
                          </div>
                        </div>
                        <Badge variant={offer.status === 'accepted' ? 'default' : 'outline'}>
                          {offer.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="text-base font-medium text-gray-900">{offer.distance_km} km away</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Offered Price</p>
                          <p className="text-2xl font-bold text-gray-900">{offer.offered_price.toFixed(0)} SR</p>
                        </div>
                      </div>

                      {offer.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptOffer(offer.id)}
                            size="sm"
                            className="flex-1"
                          >
                            Accept Offer
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            Decline
                          </Button>
                        </div>
                      )}
                      {offer.status === 'accepted' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No offers yet. Service providers are reviewing your request...</p>
                </div>
              )}
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Units Requested</p>
                  <p className="text-2xl font-bold text-gray-900">{booking.quantity}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">Best Offer</p>
                  {offers.length > 0 ? (
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.min(...offers.map((o) => o.offered_price)).toFixed(0)} SR
                    </p>
                  ) : (
                    <p className="text-gray-600">Waiting for offers...</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
