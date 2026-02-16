import { useState, useEffect } from 'react';
import { Service } from '../app/api/services/route';

export const useServiceById = (id: string) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        
        // First try to fetch from the API
        const response = await fetch(`/api/services/${id}`);
        
        if (response.ok) {
          const data: Service = await response.json();
          setService(data);
          setError(null);
        } else {
          // If API fails, use mock data for demonstration
          console.warn(`API failed with status ${response.status}, using mock data`);
          
          // Create mock service data
          const mockService: Service = {
            id,
            name: 'Sample Equipment Name',
            description: 'This is a sample equipment description. In a real application, this would come from the database.',
            category: 'heavy_equipment',
            image_url: 'https://placehold.co/600x400?text=Equipment+Image',
            base_price: 650,
            price_type: 'daily',
            rating: 4.5,
            review_count: 124,
            provider_name: 'Sample Provider',
            distance: 'San Jose, CA',
            is_instant_booking: true,
            is_available_today: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setService(mockService);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        
        // On error, use mock data for demonstration
        const mockService: Service = {
          id,
          name: 'Sample Equipment Name',
          description: 'This is a sample equipment description. In a real application, this would come from the database.',
          category: 'heavy_equipment',
          image_url: 'https://placehold.co/600x400?text=Equipment+Image',
          base_price: 650,
          price_type: 'daily',
          rating: 4.5,
          review_count: 124,
          provider_name: 'Sample Provider',
          distance: 'San Jose, CA',
          is_instant_booking: true,
          is_available_today: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setService(mockService);
        setError(err instanceof Error ? err.message : 'Failed to fetch service');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  return { service, loading, error };
};