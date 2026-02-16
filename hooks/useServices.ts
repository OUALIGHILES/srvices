import { useState, useEffect } from 'react';
import { Service } from '../app/api/services/route';

export const useServices = (params: { 
  category?: string; 
  search?: string; 
  location?: string; 
  minPrice?: number; 
  maxPrice?: number; 
  instantBooking?: boolean; 
  availableToday?: boolean; 
  limit?: number; 
  offset?: number; 
} = {}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.location) queryParams.append('location', params.location);
        if (params.minPrice !== undefined) queryParams.append('min_price', params.minPrice.toString());
        if (params.maxPrice !== undefined) queryParams.append('max_price', params.maxPrice.toString());
        if (params.instantBooking !== undefined) queryParams.append('instant_booking', params.instantBooking.toString());
        if (params.availableToday !== undefined) queryParams.append('available_today', params.availableToday.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`/api/services?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data: Service[] = await response.json();
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [
    params.category, 
    params.search, 
    params.location, 
    params.minPrice, 
    params.maxPrice, 
    params.instantBooking, 
    params.availableToday, 
    params.limit, 
    params.offset
  ]);

  return { services, loading, error };
};