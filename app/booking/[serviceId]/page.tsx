'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, AlertCircle, Building, Wallet, Languages } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Service {
  id: string
  name: string
  base_price: number
  price_type: 'fixed' | 'hourly' | 'per_unit'
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const serviceId = params.serviceId as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  // Form data
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone_number || '',
    location: '',
    date: '',
    time: '',
    quantity: 1,
    notes: '',
  })

  useEffect(() => {
    const fetchService = async () => {
      const supabase = createClient();

      try {
        // Validate UUID format before making the request
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(serviceId)) {
          setError('Invalid service ID format');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('services').select('*').eq('id', serviceId).single()

        if (error) throw error
        setService(data)
      } catch (error) {
        console.error('Error fetching service:', error)
        setError('Failed to load service details')
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          location: formData.location,
          date: formData.date,
          time: formData.time,
          quantity: formData.quantity,
          notes: formData.notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to create booking')
      }

      router.push(`/bookings/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ServiceHailing</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/bookings">My Bookings</Link>
              <Link className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors" href="/customer/wallet">
                <Wallet className="h-5 w-5" />
                <span>Wallet ({(profile?.wallet_balance || 0).toFixed(0)} SR)</span>
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Languages className="h-4 w-4" />
                <span>AR/EN</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-slate-500">Welcome,</p>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">
                    {profile?.full_name || 'Ahmed Al-Saud'}
                  </p>
                </div>
                <div className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-200">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                      alt={profile?.full_name || 'User profile portrait'}
                    />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ServiceHailing</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/bookings">My Bookings</Link>
              <Link className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors" href="/customer/wallet">
                <Wallet className="h-5 w-5" />
                <span>Wallet ({(profile?.wallet_balance || 0).toFixed(0)} SR)</span>
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Languages className="h-4 w-4" />
                <span>AR/EN</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-slate-500">Welcome,</p>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">
                    {profile?.full_name || 'Ahmed Al-Saud'}
                  </p>
                </div>
                <div className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-200">
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                      alt={profile?.full_name || 'User profile portrait'}
                    />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </header>
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

  const totalPrice = service.base_price * formData.quantity

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ServiceHailing</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold hover:text-primary transition-colors" href="/customer/bookings">My Bookings</Link>
            <Link className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors" href="/customer/wallet">
              <Wallet className="h-5 w-5" />
              <span>Wallet ({(profile?.wallet_balance || 0).toFixed(0)} SR)</span>
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Languages className="h-4 w-4" />
              <span>AR/EN</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-500">Welcome,</p>
                <p className="text-sm font-bold group-hover:text-primary transition-colors">
                  {profile?.full_name || 'Ahmed Al-Saud'}
                </p>
              </div>
              <div className="size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-200">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1dx82kt__wr4hsRX28Sv8mIww6CYJ9dsxCexphWjYpIEltOo99yq49jTFWo0w9NMyM574rIQpdwj6CBX-oHC5PO-TqeQKfY9oC_Me7j3KWxYTDfRErr3WASPNJfZtpCbEVHW7t-EIW7izq8YEmB96ABlVT1TCBbnogMUP5wrKsF_Tb77vPYrfOsVbuQcdBzGIyFH9yK9XZ8f6McBFMEskf9wI6Oz451DUOmGgU7iyDy3zn9umnFeix5OkqyXfNO84K1rO1mTxeE'}
                    alt={profile?.full_name || 'User profile portrait'}
                  />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/services/${serviceId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service
          </Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Form */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Book {service.name}</h1>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Customer Info */}
                {(step === 1 || step === 3) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Information</h2>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Booking Details */}
                {(step === 2 || step === 3) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Project Location
                      </label>
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter your project location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          required
                          value={formData.time}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity / Units
                      </label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        placeholder="Add any special requirements or notes..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  {step > 1 && (
                    <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">{service.name}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {service.base_price.toFixed(0)} SR × {formData.quantity}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(0)} SR</p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-xs text-blue-700">
                    <strong>Waiting for Offers:</strong> Service providers will send you their offers, and you can choose the best one.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Building className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-400">© 2024 ServiceHailing KSA. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-slate-400 hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
