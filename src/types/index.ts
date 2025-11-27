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