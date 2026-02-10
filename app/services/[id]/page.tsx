'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CustomerHeader } from '@/components/customer-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Star, ArrowLeft, MessageCircle, Phone } from 'lucide-react'

// Helper function to safely get error message
const getErrorMessage = (error: any): string => {
  if (typeof error === 'object' && error !== null) {
    return error.message || error.details || error.statusText || 'Unknown error occurred';
  } else {
    return String(error || 'Unknown error occurred');
  }
};

// Helper function to safely log error objects
const safeLogError = (message: string, error: any) => {
  if (typeof error === 'object' && error !== null && Object.keys(error).length > 0) {
    console.error(message, error);
  } else {
    console.error(`${message}: Unknown error occurred`);
  }
};

interface Service {
  id: string
  name: string
  description: string
  category: string
  image_url: string
  base_price: number
  price_type: 'fixed' | 'hourly' | 'per_unit'
  is_active: boolean
  created_at: string
}

interface ServiceSubtype {
  id: string
  service_id: string
  name: string
  description: string
  price: number
}

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [subtypes, setSubtypes] = useState<ServiceSubtype[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([])

  useEffect(() => {
    const fetchServiceDetails = async () => {
      const supabase = createClient();

      try {
        // Validate UUID format before making the request
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(serviceId)) {
          setError('Invalid service ID format');
          setLoading(false);
          return;
        }

        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single()

        if (serviceError) {
          // Check if it's a record not found error vs a format error
          if (serviceError.code === 'PGRST116' || (serviceError.message && serviceError.message.includes('not found'))) {
            // Record not found - this is expected for invalid IDs
            setError('Service not found');
          } else {
            // Other error - could be format issue
            safeLogError('Database error:', serviceError);

            // Safely access error message property
            const errorMessage = getErrorMessage(serviceError);
            setError(`Service ID format error: ${errorMessage}`);
          }
          return; // Exit early since there's an error
        }

        setService(serviceData)

        const { data: subtypesData, error: subtypesError } = await supabase
          .from('service_subtypes')
          .select('*')
          .eq('service_id', serviceId)

        if (subtypesError) {
          safeLogError('Database error fetching subtypes:', subtypesError);
          // Optionally set an error state for subtypes if needed
          // setError(`Error fetching service options: ${getErrorMessage(subtypesError)}`);
        } else {
          setSubtypes(subtypesData || [])
        }
      } catch (error: any) {
        safeLogError('Unexpected error fetching service:', error);
        setError(getErrorMessage(error));
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchServiceDetails()
    }
  }, [serviceId])

  const handleBooking = () => {
    if (user) {
      router.push(`/booking/${serviceId}`)
    } else {
      router.push(`/login?redirect=/booking/${serviceId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Error Loading Service</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/">Back to Services</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
            <Button asChild className="mt-4">
              <Link href="/">Back to Services</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getPriceDisplay = () => {
    const unit = service.price_type === 'hourly' ? '/Hour' : service.price_type === 'per_unit' ? '/Unit' : '/Day'
    return `${service.base_price.toFixed(0)} SR${unit}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </Button>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Image and Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Image */}
            <Card className="overflow-hidden">
              <div className="relative h-64 w-full sm:h-80 bg-gray-100">
                {service.image_url ? (
                  <Image
                    src={service.image_url || "/placeholder.svg"}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 fill-blue-400 text-blue-400" />
                <span className="text-lg font-semibold text-gray-900">4.9</span>
                <span className="text-gray-600">(248 reviews)</span>
              </div>

              <p className="text-gray-600 mb-6">{service.description}</p>

              {/* Category */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                  {service.category}
                </span>
              </div>
            </Card>

            {/* Sub-services */}
            {subtypes.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Available Options</h2>
                <div className="space-y-3">
                  {subtypes.map((subtype) => (
                    <div key={subtype.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{subtype.name}</p>
                        {subtype.description && <p className="text-sm text-gray-600">{subtype.description}</p>}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">+{subtype.price.toFixed(0)} SR</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-20">
              {/* Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-gray-900">{getPriceDisplay()}</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Availability</p>
                  <p className="text-sm font-medium text-green-600">Available Today</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Distance</p>
                  <p className="text-sm font-medium text-gray-900">Within 15km</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handleBooking} className="w-full" size="lg">
                  Book Now
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>

              {/* Service Provider Info */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 uppercase mb-3">Service Provider</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Middle East Construction</p>
                    <p className="text-xs text-gray-600">★ 4.9 (248 reviews)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
