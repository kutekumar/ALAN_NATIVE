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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MobileLayout } from '../components';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../services/supabase';
import { textStyles } from '../styles/fonts';

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
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
}

export default function OrdersScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const showQRCode = (order: Order) => {
    setSelectedOrder(order);
    setQrModalVisible(true);
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

  if (loading) {
    return (
      <MobileLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={[styles.loadingText, textStyles.bodyMedium]}>
            Loading your orders...
          </Text>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, textStyles.heading2]}>My Orders</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color={refreshing ? "#94a3b8" : "#D4AF37"} 
            />
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#94a3b8" />
            <Text style={[styles.emptyTitle, textStyles.heading4]}>No orders yet</Text>
            <Text style={[styles.emptyText, textStyles.bodyMedium]}>
              Your order history will appear here
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home' as never)}
            >
              <Text style={[styles.browseButtonText, textStyles.buttonText]}>
                Start Ordering
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, textStyles.heading6]}>
                      Order #{order.qr_code}
                    </Text>
                    <Text style={[styles.orderDate, textStyles.bodySmall]}>
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Ionicons 
                      name={getStatusIcon(order.status) as any} 
                      size={14} 
                      color="#ffffff" 
                    />
                    <Text style={[styles.statusText, textStyles.caption]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderMeta}>
                    <Text style={[styles.orderType, textStyles.bodySmall]}>
                      {order.order_type} • {order.payment_method}
                    </Text>
                    <Text style={[styles.itemCount, textStyles.bodySmall]}>
                      {getTotalItems(order.order_items)} item{getTotalItems(order.order_items) !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <Text style={[styles.totalAmount, textStyles.heading6]}>
                    ${order.total_amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => showQRCode(order)}
                  >
                    <Ionicons name="qr-code-outline" size={18} color="#D4AF37" />
                    <Text style={[styles.qrButtonText, textStyles.buttonText]}>
                      Show QR Code
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('OrderDetail' as never, { orderId: order.id } as never)}
                  >
                    <Text style={[styles.detailsButtonText, textStyles.buttonText]}>
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* QR Code Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={qrModalVisible}
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setQrModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>

              {selectedOrder && (
                <>
                  <LinearGradient
                    colors={['#D4AF37', '#FFD700']}
                    style={styles.qrHeader}
                  >
                    <Ionicons name="qr-code" size={48} color="#ffffff" />
                    <Text style={[styles.qrTitle, textStyles.heading4]}>
                      Your Order QR Code
                    </Text>
                    <Text style={[styles.qrSubtitle, textStyles.bodyMedium]}>
                      Show this to the restaurant
                    </Text>
                  </LinearGradient>

                  <View style={styles.qrCodeContainer}>
                    <View style={styles.qrCodeBox}>
                      <Text style={[styles.qrCodeText, textStyles.heading1]}>
                        {selectedOrder.qr_code}
                      </Text>
                    </View>
                    <Text style={[styles.qrInstructions, textStyles.bodySmall]}>
                      Present this QR code to the restaurant staff to confirm your order
                    </Text>
                  </View>

                  <View style={styles.orderSummary}>
                    <Text style={[styles.summaryTitle, textStyles.heading6]}>
                      Order Summary
                    </Text>
                    <Text style={[styles.summaryText, textStyles.bodyMedium]}>
                      {getTotalItems(selectedOrder.order_items)} items • ${selectedOrder.total_amount.toFixed(2)}
                    </Text>
                    <Text style={[styles.summaryText, textStyles.bodyMedium]}>
                      {selectedOrder.order_type} • {selectedOrder.payment_method}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    color: '#1e293b',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 10,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderMeta: {
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
  qrButton: {
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
  qrButtonText: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
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
  qrCodeContainer: {
    padding: 32,
    alignItems: 'center',
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
  qrCodeText: {
    color: '#1e293b',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrInstructions: {
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
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