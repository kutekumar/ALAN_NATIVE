import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MobileLayout } from '../components';
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

type OrderDetailRouteProp = RouteProp<{ OrderDetail: { orderId: string } }, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={[styles.loadingText, textStyles.bodyMedium]}>
            Loading order details...
          </Text>
        </View>
      </MobileLayout>
    );
  }

  if (error || !order) {
    return (
      <MobileLayout>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={[styles.errorTitle, textStyles.heading4]}>
            Unable to Load Order
          </Text>
          <Text style={[styles.errorText, textStyles.bodyMedium]}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
            <Text style={[styles.retryButtonText, textStyles.buttonText]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, textStyles.heading3]}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Status */}
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.statusGradient}
            >
              <View style={styles.statusContent}>
                <Ionicons 
                  name={getStatusIcon(order.status) as any} 
                  size={32} 
                  color="#ffffff" 
                />
                <Text style={[styles.statusTitle, textStyles.heading4]}>
                  Order Confirmed
                </Text>
                <Text style={[styles.statusText, textStyles.bodyMedium]}>
                  Your order has been successfully placed
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* QR Code */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order QR Code</Text>
            <View style={styles.qrContainer}>
              <Text style={[styles.qrCode, textStyles.heading6]}>{order.qr_code}</Text>
              <Text style={[styles.qrText, textStyles.bodySmall]}>
                Show this code to the restaurant
              </Text>
            </View>
          </View>

          {/* Order Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Information</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, textStyles.bodyMedium]}>Order Type</Text>
                <Text style={[styles.infoValue, textStyles.bodyMedium]}>{order.order_type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, textStyles.bodyMedium]}>Payment Method</Text>
                <Text style={[styles.infoValue, textStyles.bodyMedium]}>{order.payment_method}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, textStyles.bodyMedium]}>Order Date</Text>
                <Text style={[styles.infoValue, textStyles.bodyMedium]}>
                  {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Items</Text>
            <View style={styles.itemsContainer}>
              {order.order_items.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, textStyles.bodyMedium]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemPrice, textStyles.bodySmall]}>
                      ${item.price.toFixed(2)} each
                    </Text>
                  </View>
                  <View style={styles.itemQuantityContainer}>
                    <Text style={[styles.itemQuantity, textStyles.bodyMedium]}>
                      x{item.quantity}
                    </Text>
                  </View>
                  <View style={styles.itemTotalContainer}>
                    <Text style={[styles.itemTotal, textStyles.bodyMedium]}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Payment Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, textStyles.heading5]}>Total Paid</Text>
                <Text style={[styles.totalValue, textStyles.heading5]}>
                  ${order.total_amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={[styles.homeButtonText, textStyles.buttonText]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1e293b',
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusContainer: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: 24,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '700',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1e293b',
    marginBottom: 12,
    fontWeight: '700',
  },
  qrContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrCode: {
    color: '#1e293b',
    fontFamily: 'monospace',
    marginBottom: 8,
    fontWeight: '700',
  },
  qrText: {
    color: '#64748b',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  itemsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    color: '#1e293b',
    marginBottom: 2,
    fontWeight: '500',
  },
  itemPrice: {
    color: '#64748b',
  },
  itemQuantityContainer: {
    flex: 1,
    alignItems: 'center',
  },
  itemQuantity: {
    color: '#64748b',
    fontWeight: '500',
  },
  itemTotalContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemTotal: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#64748b',
  },
  summaryValue: {
    color: '#1e293b',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#1e293b',
    fontWeight: '700',
  },
  totalValue: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  homeButton: {
    backgroundColor: '#64748b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});