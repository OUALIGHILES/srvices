import { Service } from '@/app/api/services/route';

const API_BASE_URL = '/api';

/**
 * Fetches services from the API
 */
export async function getServices(params?: {
  category?: string;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  instantBooking?: boolean;
  availableToday?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  brands?: string[];
  tonnage?: string;
  engineType?: string;
}): Promise<Service[]> {
  try {
    const url = new URL(`${API_BASE_URL}/services`, window.location.origin);

    if (params?.category) url.searchParams.append('category', params.category);
    if (params?.search) url.searchParams.append('search', params.search);
    if (params?.location) url.searchParams.append('location', params.location);
    if (params?.minPrice !== undefined) url.searchParams.append('min_price', params.minPrice.toString());
    if (params?.maxPrice !== undefined) url.searchParams.append('max_price', params.maxPrice.toString());
    if (params?.instantBooking !== undefined) url.searchParams.append('instant_booking', params.instantBooking.toString());
    if (params?.availableToday !== undefined) url.searchParams.append('available_today', params.availableToday.toString());
    if (params?.limit !== undefined) url.searchParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) url.searchParams.append('offset', params.offset.toString());
    if (params?.orderBy) url.searchParams.append('order_by', params.orderBy);
    if (params?.orderDirection) url.searchParams.append('order_direction', params.orderDirection);
    if (params?.brands && params.brands.length > 0) {
      params.brands.forEach(brand => url.searchParams.append('brands[]', brand));
    }
    if (params?.tonnage) url.searchParams.append('tonnage', params.tonnage);
    if (params?.engineType) url.searchParams.append('engine_type', params.engineType);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as Service[];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

/**
 * Fetches featured services for the homepage
 */
export async function getFeaturedServices(): Promise<Service[]> {
  // For now, we'll fetch all services and return the first few
  // In a real implementation, you might want to add a 'featured' flag to your services table
  try {
    const services = await getServices({ limit: 3 });
    return services;
  } catch (error) {
    console.error('Error fetching featured services:', error);
    // Return empty array in case of error
    return [];
  }
}

/**
 * Fetches popular listings near the user's location
 */
export async function getPopularListingsNearby(location?: string): Promise<Service[]> {
  try {
    // If location is provided, use it to filter services
    // Otherwise, we'll return popular services without location filter
    const params: { limit?: number; location?: string; orderBy?: string; orderDirection?: 'asc' | 'desc' } = {
      limit: 3,
      orderBy: 'rating',
      orderDirection: 'desc'
    };
    
    if (location) {
      params.location = location;
    }
    
    const services = await getServices(params);
    return services;
  } catch (error) {
    console.error('Error fetching popular listings nearby:', error);
    // Return empty array in case of error
    return [];
  }
}

/**
 * Gets unique service categories from the database
 */
export async function getServiceCategories(): Promise<{ id: string; name: string }[]> {
  try {
    // For now, we'll fetch services and extract unique categories
    // In a production app, you might want a dedicated endpoint for categories
    const services = await getServices({ limit: 100 }); // Get enough services to extract categories
    
    const categoriesSet = new Set(services.map(service => service.category));
    const categories = Array.from(categoriesSet).map(category => ({
      id: category,
      name: formatCategoryName(category)
    }));
    
    return categories;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    // Return default categories in case of error
    return [
      { id: 'heavy_equipment', name: 'Heavy Equipment' },
      { id: 'water_supply', name: 'Water & Fluid' },
      { id: 'fuel_services', name: 'Fuel Delivery' },
      { id: 'specialized_tools', name: 'Specialized Tools' }
    ];
  }
}

// Helper function to format category names
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}