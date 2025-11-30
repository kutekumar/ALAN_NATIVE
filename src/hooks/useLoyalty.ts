import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { CustomerLoyaltySummary, CustomerNotification } from '../types';

const fetchCustomerLoyaltySummary = async (
  customerId: string
): Promise<CustomerLoyaltySummary | null> => {
  const { data, error } = await supabase
    .from('customer_loyalty_summary')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if ((error as any).code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch loyalty summary: ${error.message}`);
  }

  return data as CustomerLoyaltySummary;
};

export const useCustomerLoyaltySummary = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer_loyalty_summary', customerId],
    queryFn: () => fetchCustomerLoyaltySummary(customerId as string),
    enabled: !!customerId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
  });
};

const fetchCustomerNotifications = async (
  customerId: string
): Promise<CustomerNotification[]> => {
  const { data, error } = await supabase
    .from('customer_notifications')
    .select(
      'id, customer_id, order_id, title, message, status, created_at, reply_content, restaurant_name, blog_post_id'
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || []) as CustomerNotification[];
};

export const useCustomerNotifications = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer_notifications', customerId],
    queryFn: () => fetchCustomerNotifications(customerId as string),
    enabled: !!customerId,
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 2,
  });
};

// Mark a single notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_notifications'] });
    },
  });
};

// Mark all notifications as read for a customer
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ status: 'read' })
        .eq('customer_id', customerId)
        .eq('status', 'unread');

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_notifications'] });
    },
  });
};