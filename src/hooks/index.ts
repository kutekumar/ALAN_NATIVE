 // Export all custom hooks from this file
 export { useAuth } from '../context/AuthProvider';
 export { useRestaurants, useFeaturedRestaurants } from './useRestaurants';
 export { useBlogs, useFeaturedBlogs } from './useBlogs';
 export { useBlogComments, useAddBlogComment } from './useBlogComments';
 export {
   useCustomerLoyaltySummary,
   useCustomerNotifications,
   useMarkNotificationRead,
   useMarkAllNotificationsRead
 } from './useLoyalty';
 
 // Placeholder for future hooks
 // export { useProducts } from './useProducts';
 // export { useOrders } from './useOrders';
 // export { useCart } from './useCart';