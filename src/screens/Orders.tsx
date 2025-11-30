import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthProvider';
import type { MainStackParamList } from '../types';
import { supabase } from '../services/supabase';
import { textStyles } from '../styles/fonts';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_image?: string;
  restaurant_address?: string;
  order_type: string;
  payment_method: string;
  status: string;
  qr_code: string;
  order_items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  created_at: string;
  restaurants?: {
    name: string;
    image_url: string;
    address: string;
  };
}

type OrdersScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch actual orders with restaurant information
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            name,
            image_url,
            address
          )
        `)
        .eq('customer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include restaurant info at top level
      const transformedOrders = (data || []).map(order => ({
        ...order,
        restaurant_name: order.restaurants?.name || 'Unknown Restaurant',
        restaurant_image: order.restaurants?.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
        restaurant_address: order.restaurants?.address || 'Address not available'
      }));

      setOrders(transformedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#22c55e';
      case 'completed': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'checkmark-circle';
      case 'completed': return 'checkmark-done-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getTotalItems = (orderItems: Order['order_items']) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'dine_in': return 'restaurant';
      case 'takeaway': return 'bag';
      case 'delivery': return 'bicycle';
      default: return 'receipt';
    }
  };

  const formatOrderTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'dine_in': 'Dine In',
      'takeaway': 'Take Away',
    };
    return typeMap[type.toLowerCase()] || type;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>
          Loading your orders...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={styles.container}
      >
        <ScrollView
          style={styles.ordersList}
          contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.ordersContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header - now part of scrollable content */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
              <View style={styles.refreshButton}>
                <Ionicons 
                  name="refresh" 
                  size={20} 
                  color={refreshing ? "#94a3b8" : "#D4AF37"} 
                />
              </View>
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={64} color="#D4AF37" />
              </View>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>
                Your order history will appear here
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Main')}
              >
                <LinearGradient
                  colors={['#D4AF37', '#B8860B']}
                  style={styles.browseGradient}
                >
                  <Text style={styles.browseButtonText}>
                    Start Ordering
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#ffffff', '#fefefe']}
                  style={styles.cardGradient}
                >
                  {/* Restaurant Image Header */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: order.restaurant_image }}
                      style={styles.restaurantImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                      />
                      
                      {/* Status Badge on Image */}
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Ionicons 
                          name={getStatusIcon(order.status) as any} 
                          size={12} 
                          color="#ffffff" 
                        />
                        <Text style={styles.statusText}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Restaurant Info Section */}
                  <View style={styles.infoSection}>
                    <View style={styles.restaurantHeader}>
                      <Text style={styles.restaurantName}>
                        {order.restaurant_name}
                      </Text>
                      <View style={styles.orderTypeContainer}>
                        <Ionicons 
                          name={getOrderTypeIcon(order.order_type) as any} 
                          size={14} 
                          color="#D4AF37" 
                        />
                        <Text style={styles.orderTypeText}>
                          {formatOrderTypeDisplay(order.order_type)}
                        </Text>
                      </View>
                    </View>

                    {/* Order Details */}
                    <View style={styles.orderDetails}>
                      <View style={styles.orderMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={14} color="#64748b" />
                          <Text style={styles.metaText}>
                            {formatDate(order.created_at).date}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color="#64748b" />
                          <Text style={styles.metaText}>
                            {formatDate(order.created_at).time}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Total</Text>
                        <Text style={styles.priceAmount}>
                          {order.total_amount.toFixed(0)} MMK
                        </Text>
                      </View>
                    </View>

                    {/* Order Items Summary */}
                    <View style={styles.itemsSummary}>
                      <Text style={styles.itemsText}>
                        {getTotalItems(order.order_items)} items • Order #{order.id.slice(-6).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 80, // Space for sticky glass nav
    paddingBottom: 20,
    marginHorizontal: -20, // Compensate for ScrollView contentContainerStyle padding
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  browseGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for glass bottom tabs
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 120, // Space for glass bottom tabs
  },
  orderCard: {
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoSection: {
    padding: 20,
  },
  restaurantHeader: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderTypeText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  orderMeta: {
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  itemsSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-end',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 11,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  qrButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  qrGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  qrButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  orderDetailsBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderMetaBottomSection: {
    flex: 1,
  },
  orderType: {
    color: '#64748b',
    marginBottom: 2,
  },
  itemCount: {
    color: '#64748b',
  },
  totalAmount: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  qrActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  qrActionButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 10,
  },
  detailsButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: width * 0.95,
    maxWidth: 450,
    maxHeight: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -8,
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrCodeContainer: {
    marginBottom: 24,
  },
  qrBackground: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  qrPattern: {
    marginBottom: 16,
  },
  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: '#000000',
  },
  qrPixel: {
    width: 18,
    height: 18,
    margin: 1,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderInfoAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  qrHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  qrTitle: {
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  qrSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  qrCodeBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 3,
    borderColor: '#D4AF37',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  orderSummary: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryTitle: {
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    color: '#64748b',
    marginBottom: 4,
  },
});