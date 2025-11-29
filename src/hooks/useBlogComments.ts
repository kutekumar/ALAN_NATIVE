import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { BlogComment } from '../types';

const fetchBlogComments = async (blogPostId: string): Promise<BlogComment[]> => {
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      id,
      blog_post_id,
      customer_id,
      content,
      is_edited,
      is_deleted,
      created_at,
      updated_at,
      parent_comment_id
    `)
    .eq('blog_post_id', blogPostId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  // Fetch customer profiles separately to avoid join issues
  const customerIds = [...new Set((data || []).map(c => c.customer_id))];
  
  let profilesMap: { [key: string]: any } = {};
  if (customerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', customerIds);
    
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
  }

  const transformedData: BlogComment[] = (data || []).map((comment: any) => {
    const profile = profilesMap[comment.customer_id];
    return {
      id: comment.id,
      blog_post_id: comment.blog_post_id,
      customer_id: comment.customer_id,
      content: comment.content,
      is_edited: comment.is_edited,
      is_deleted: comment.is_deleted,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_comment_id: comment.parent_comment_id,
      customer_name: profile?.full_name || 'Anonymous User',
      customer_avatar: profile?.avatar_url,
    };
  });

  return transformedData;
};

const addBlogComment = async (
  blogPostId: string,
  customerId: string,
  content: string,
  parentCommentId?: string
): Promise<BlogComment> => {
  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      blog_post_id: blogPostId,
      customer_id: customerId,
      content,
      parent_comment_id: parentCommentId || null,
    })
    .select(`
      id,
      blog_post_id,
      customer_id,
      content,
      is_edited,
      is_deleted,
      created_at,
      updated_at,
      parent_comment_id
    `)
    .single();

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  // Fetch the customer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', customerId)
    .single();

  return {
    id: data.id,
    blog_post_id: data.blog_post_id,
    customer_id: data.customer_id,
    content: data.content,
    is_edited: data.is_edited,
    is_deleted: data.is_deleted,
    created_at: data.created_at,
    updated_at: data.updated_at,
    parent_comment_id: data.parent_comment_id,
    customer_name: profile?.full_name || 'Anonymous User',
    customer_avatar: profile?.avatar_url,
  };
};

export const useBlogComments = (blogPostId: string) => {
  return useQuery({
    queryKey: ['blog_comments', blogPostId],
    queryFn: () => fetchBlogComments(blogPostId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!blogPostId,
    retry: 2,
  });
};

export const useAddBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      blogPostId,
      customerId,
      content,
      parentCommentId,
    }: {
      blogPostId: string;
      customerId: string;
      content: string;
      parentCommentId?: string;
    }) => addBlogComment(blogPostId, customerId, content, parentCommentId),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({
        queryKey: ['blog_comments', newComment.blog_post_id],
      });
    },
  });
};
