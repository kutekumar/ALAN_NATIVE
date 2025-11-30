import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MobileLayout } from '../components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../services/supabase';
import { textStyles } from '../styles/fonts';

type PaymentMethod = 'mpu' | 'kbzpay' | 'wavepay';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
}

const paymentOptions: PaymentOption[] = [
  { id: 'mpu', name: 'MPU Card', icon: 'card-outline', color: '#3b82f6' },
  { id: 'kbzpay', name: 'KBZ Pay', icon: 'wallet-outline', color: '#ef4444' },
  { id: 'wavepay', name: 'Wave Pay', icon: 'phone-portrait-outline', color: '#22c55e' },
];

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { profile } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('mpu');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = getTotalPrice();

  const generateQRCode = (): string => {
    // Generate a simple QR code string for the order
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORDER-${timestamp}-${random}`.toUpperCase();
  };

  const createOrder = async (): Promise<string | null> => {
    try {
      if (!profile?.id || !cart.restaurantId) {
        throw new Error('Missing required information');
      }

      // Validate that restaurant exists in database
      const { data: restaurantExists } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', cart.restaurantId)
        .single();

      if (!restaurantExists) {
        throw new Error('Invalid restaurant selected. Please select a valid restaurant.');
      }

      const orderItems = cart.items.map(item => ({
        id: item.menuId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        customer_id: profile.id,
        restaurant_id: cart.restaurantId,
        order_type: cart.orderType,
        payment_method: selectedPayment,
        qr_code: generateQRCode(),
        order_items: orderItems,
        total_amount: totalAmount,
      };

      console.log('Order data to be inserted:', JSON.stringify(orderData, null, 2));

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const simulatePayment = async (): Promise<boolean> => {
    // Simulate payment processing with 1 second delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% success rate for simulation
        const success = Math.random() > 0.05;
        resolve(success);
      }, 1000);
    });
  };

  const handlePayment = async () => {
    if (cart.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return;
    }
 
    setIsProcessing(true);
    
    console.log('Starting payment process...');
    console.log('Cart items:', cart.items);
    console.log('Profile ID:', profile?.id);
    console.log('Restaurant ID:', cart.restaurantId);
 
    try {
      // Simulate payment processing
      const paymentSuccess = await simulatePayment();
 
      if (!paymentSuccess) {
        throw new Error('Payment failed. Please try again.');
      }
 
      // Create order in database
      const orderDataForLog = {
        customer_id: profile?.id,
        restaurant_id: cart.restaurantId,
        order_type: cart.orderType,
        payment_method: selectedPayment,
        total_amount: totalAmount,
        order_items: cart.items.map(item => ({
          id: item.menuId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      };
      console.log('Creating order with data:', orderDataForLog);
      
      const orderId = await createOrder();
      console.log('Order created with ID:', orderId);
 
      if (!orderId) {
        throw new Error('Failed to create order.');
      }

      // Create in-app notification for this order (unread by default)
      try {
        if (profile?.id) {
          let restaurantName: string | null = null;
          if (cart.restaurantId) {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('name')
              .eq('id', cart.restaurantId)
              .single();
            restaurantName = restaurant?.name ?? null;
          }

          await supabase.from('customer_notifications').insert({
            customer_id: profile.id,
            order_id: orderId,
            title: 'Order placed successfully',
            message: `Your order ${orderId.slice(-6).toUpperCase()} has been placed.`,
            restaurant_name: restaurantName,
          });
        }
      } catch (notifyError) {
        console.error('Error creating order notification:', notifyError);
      }
 
      // Clear cart after successful payment
      clearCart();
 
      // Navigate directly to OrderDetail screen
      navigation.navigate('OrderDetail' as never, { orderId } as never);
 
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, textStyles.heading3]}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, textStyles.bodyMedium]}>
                  {cart.items.reduce((total, item) => total + item.quantity, 0)} items
                </Text>
                <Text style={[styles.summaryValue, textStyles.bodyMedium]}>
                  {getTotalPrice().toFixed(0)} MMK
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, textStyles.heading5]}>Total</Text>
                <Text style={[styles.totalValue, textStyles.heading5]}>
                  {totalAmount.toFixed(0)} MMK
                </Text>
              </View>
            </View>
          </View>

          {/* Order Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Type</Text>
            <View style={styles.orderTypeContainer}>
              <Ionicons 
                name={cart.orderType === 'dine_in' ? 'restaurant-outline' : 'bag-outline'} 
                size={24} 
                color="#D4AF37" 
              />
              <Text style={[styles.orderTypeText, textStyles.bodyMedium]}>
                {cart.orderType === 'dine_in' ? 'Dine In' : 'Take Away'}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Payment Method</Text>
            <View style={styles.paymentContainer}>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.paymentOption,
                    selectedPayment === option.id && styles.selectedPaymentOption,
                  ]}
                  onPress={() => setSelectedPayment(option.id)}
                >
                  <View style={styles.paymentOptionContent}>
                    <View style={[styles.paymentIcon, { backgroundColor: option.color }]}>
                      <Ionicons name={option.icon as any} size={24} color="#ffffff" />
                    </View>
                    <Text style={[styles.paymentOptionText, textStyles.bodyMedium]}>
                      {option.name}
                    </Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedPayment === option.id && styles.radioSelected,
                      ]}
                    >
                      {selectedPayment === option.id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Order Items Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Items</Text>
            <View style={styles.itemsPreview}>
              {cart.items.map((item) => (
                <View key={item.menuId} style={styles.itemRow}>
                  <Text style={[styles.itemName, textStyles.bodyMedium]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemQuantity, textStyles.bodySmall]}>
                    x{item.quantity}
                  </Text>
                  <Text style={[styles.itemTotal, textStyles.bodyMedium]}>
                    {(item.price * item.quantity).toFixed(0)} MMK
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? ['#94a3b8', '#94a3b8'] : ['#D4AF37', '#FFD700']}
              style={styles.paymentGradient}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[styles.paymentButtonText, textStyles.buttonText]}>
                    Processing Payment...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#ffffff" />
                  <Text style={[styles.paymentButtonText, textStyles.buttonText]}>
                    Pay {totalAmount.toFixed(0)} MMK
                  </Text>
                </>
              )}
            </LinearGradient>
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
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#1e293b',
    marginBottom: 12,
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
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  orderTypeText: {
    color: '#1e293b',
    fontWeight: '500',
  },
  paymentContainer: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedPaymentOption: {
    borderColor: '#D4AF37',
    backgroundColor: '#fffbeb',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentOptionText: {
    color: '#1e293b',
    fontWeight: '500',
  },
  radioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#D4AF37',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  itemsPreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    color: '#1e293b',
  },
  itemQuantity: {
    color: '#64748b',
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    color: '#D4AF37',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  paymentButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paymentButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});