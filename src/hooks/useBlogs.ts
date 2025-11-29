import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { BlogPost, BlogFilters } from '../types';

const fetchBlogs = async (filters: BlogFilters = {}): Promise<BlogPost[]> => {
  let query = supabase
    .from('blog_posts')
    .select(`
      id,
      restaurant_id,
      author_id,
      title,
      slug,
      content,
      excerpt,
      hero_image_url,
      is_published,
      is_pinned,
      created_at,
      updated_at,
      restaurants!blog_posts_restaurant_id_fkey (
        name
      )
    `);

  // Filter by published status
  if (filters.published !== undefined) {
    query = query.eq('is_published', filters.published);
  } else {
    // Default to only published posts
    query = query.eq('is_published', true);
  }

  // Filter by featured/pinned
  if (filters.featured) {
    query = query.eq('is_pinned', true);
  }

  // Filter by restaurant
  if (filters.restaurant_id) {
    query = query.eq('restaurant_id', filters.restaurant_id);
  }

  // Order by pinned first, then by created_at desc
  query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

  // Add pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch blogs: ${error.message}`);
  }

  // Transform the data to match our BlogPost interface
  const transformedData: BlogPost[] = (data || []).map((post: any) => {
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content ? post.content.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      id: post.id,
      restaurant_id: post.restaurant_id,
      author_id: post.author_id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || post.content?.substring(0, 150) + '...',
      hero_image_url: post.hero_image_url || 'https://via.placeholder.com/300x200',
      is_published: post.is_published,
      is_pinned: post.is_pinned,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_name: 'ALAN LUX Team',
      restaurant_name: post.restaurants?.name || 'ALAN LUX',
      read_time: readTime,
    };
  });

  return transformedData;
};

export const useBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: ['blogs', filters],
    queryFn: () => fetchBlogs(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false,
    retry: 2, // Retry failed requests
  });
};

export const useFeaturedBlogs = () => {
  return useQuery({
    queryKey: ['blogs', 'featured'],
    queryFn: () => fetchBlogs({ featured: true, limit: 5, offset: 0 }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false,
    retry: 2, // Retry failed requests
  });
};