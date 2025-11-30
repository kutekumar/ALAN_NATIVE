import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Restaurant, RestaurantFilters } from '../types';

const fetchRestaurants = async (filters: RestaurantFilters = {}): Promise<Restaurant[]> => {
  let query = supabase
    .from('restaurants')
    .select(`
      id,
      owner_id,
      name,
      description,
      cuisine_type,
      address,
      phone,
      image_url,
      rating,
      open_hours,
      created_at,
      updated_at
    `);

  // Add search filter
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
  }

  // Add ordering (by rating desc, then by name)
  query = query.order('rating', { ascending: false }).order('name', { ascending: true });

  // Add pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch restaurants: ${error.message}`);
  }

  return data || [];
};

export const useRestaurants = (filters: RestaurantFilters = {}) => {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: () => fetchRestaurants(filters),
    staleTime: 5 * 1000, // 5 seconds (reduced for better refresh)
    gcTime: 30 * 1000, // 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
    retry: 3, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};

export const useFeaturedRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants', 'featured'],
    queryFn: () => fetchRestaurants({ limit: 10, offset: 0 }),
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
    retry: 3, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};