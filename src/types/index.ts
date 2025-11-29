// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Orders: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  RestaurantDetail: { restaurantId: string };
};

export type MainStackParamList = {
  Main: undefined;
  RestaurantDetail: { restaurantId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  BlogPostDetail: { blogPost: BlogPost };
};

// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

// Address types
export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  cuisine_type: string;
  address: string;
  phone: string;
  image_url: string;
  rating: number;
  open_hours: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// MenuItem types
export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

// Cart types
export interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}
// Blog types based on database schema
export interface BlogPost {
  id: string; // UUID from database
  restaurant_id: string; // Restaurant ID from database
  author_id: string; // Author ID from database
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  hero_image_url: string;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for UI
  author_name?: string; // Will be populated from profiles table
  restaurant_name?: string; // Will be populated from restaurants table
  read_time?: number; // Calculated based on content length
}

export interface BlogFilters {
  featured?: boolean;
  limit?: number;
  offset?: number;
  restaurant_id?: string;
  published?: boolean;
}

export interface BlogComment {
  id: string;
  blog_post_id: string;
  customer_id: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
  customer_name?: string; // Will be populated from profiles table
  customer_avatar?: string; // Will be populated from profiles table
}

export interface BlogPostImage {
  id: string;
  blog_post_id: string;
  image_url: string;
  caption?: string;
  position?: number;
  created_at: string;
}