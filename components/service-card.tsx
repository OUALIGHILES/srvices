'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ServiceCardProps {
  id: string
  name: string
  description: string
  image_url?: string
  base_price: number
  price_type: 'fixed' | 'hourly' | 'per_unit'
  rating: number
  review_count: number
  status: 'available' | 'waiting_for_offers' | 'booked'
  allowMessages?: boolean
  allowCalls?: boolean
  provider_name?: string
  distance?: string
}

export function ServiceCard({
  id,
  name,
  description,
  image_url,
  base_price,
  price_type,
  rating,
  review_count,
  status,
  allowMessages = false,
  allowCalls = false,
  provider_name,
  distance,
}: ServiceCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case 'waiting_for_offers':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'booked':
        return 'bg-primary/10 text-primary border border-primary/20'
      default:
        return 'bg-secondary text-foreground border border-border'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'waiting_for_offers':
        return 'Waiting for Offers'
      case 'booked':
        return 'Booked'
      default:
        return status
    }
  }

  const getPriceDisplay = () => {
    const unit = price_type === 'hourly' ? '/Hour' : price_type === 'per_unit' ? '/Unit' : '/Day'
    return `${base_price.toFixed(0)} SR${unit}`
  }

  return (
    <Link href={`/services/${id}`}>
      <div className="overflow-hidden rounded-[0.75rem] border border-border bg-card soft-shadow transition-all duration-300 hover:soft-shadow-md hover:border-accent/50 group">
        {/* Image */}
        <div className="relative h-40 w-full bg-muted sm:h-48 overflow-hidden">
          {image_url ? (
            <Image
              src={image_url || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute right-2 top-2">
            <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="mb-2">
            {provider_name && <p className="text-xs text-muted-foreground">{provider_name}</p>}
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">{name}</h3>
          </div>

          {/* Distance */}
          {distance && <p className="mb-2 text-xs text-muted-foreground">{distance}</p>}

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{description}</p>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-1">
            <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
            <span className="text-sm font-medium text-foreground">
              {rating.toFixed(1)}
              <span className="text-muted-foreground"> ({review_count})</span>
            </span>
          </div>

          {/* Price */}
          <p className="mb-4 text-lg font-bold text-primary sm:text-xl">
            {getPriceDisplay()}
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button size="sm" className="flex-1 text-xs sm:text-sm bg-primary hover:bg-primary/90">
              Book Now
            </Button>

            <div className="flex gap-1">
              {allowMessages && (
                <Button size="sm" variant="outline" className="px-2 bg-transparent">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              {allowCalls && (
                <Button size="sm" variant="outline" className="px-2 bg-transparent">
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
