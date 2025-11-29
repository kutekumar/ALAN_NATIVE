import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../types';
import { supabase } from '../services/supabase';
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

type OrderDetailRouteProp = RouteProp<{ OrderDetail: { orderId: string } }, 'OrderDetail'>;
type OrderDetailScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export default function OrderDetailScreen() {
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
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
        .select(`
          *,
          restaurants (
            name,
            image_url,
            address
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Transform data to include restaurant info at top level
      const transformedOrder = {
        ...data,
        restaurant_name: data.restaurants?.name || 'Unknown Restaurant',
        restaurant_image: data.restaurants?.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
        restaurant_address: data.restaurants?.address || 'Address not available'
      };

      setOrder(transformedOrder);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    navigation.goBack();
  };

  const navigateToOrders = () => {
    // Go back to Checkout, then go back again, then navigate to Orders
    navigation.goBack();
    setTimeout(() => {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('Orders' as never);
      }, 100);
    }, 100);
  };

  if (loading) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading QR Code...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (error || !order) {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>Unable to load QR code</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} transparent animationType="slide">
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" translucent />
      <View style={styles.modalOverlay}>
        <BlurView intensity={50} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.closeButtonGradient}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* QR Code Frame */}
            <View style={styles.qrFrame}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700', '#D4AF37']}
                style={styles.frameGradient}
              >
                <View style={styles.qrContent}>
                  {/* Order Number Only */}
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>
                      Order #{order.id.slice(-6).toUpperCase()}
                    </Text>
                  </View>

                  {/* QR Code */}
                   <View style={styles.qrCodeContainer}>
                     <QRCode
                       value={order.qr_code}
                       size={200}
                       backgroundColor="#ffffff"
                       color="#000000"
                     />
                   </View>

                   {/* View All Orders Button */}
                   <TouchableOpacity 
                     style={styles.viewOrdersButton}
                     onPress={navigateToOrders}
                   >
                     <LinearGradient
                       colors={['#D4AF37', '#FFD700']}
                       style={styles.viewOrdersButtonGradient}
                     >
                       <Ionicons name="list-outline" size={20} color="#ffffff" />
                       <Text style={styles.viewOrdersButtonText}>View All Orders</Text>
                     </LinearGradient>
                   </TouchableOpacity>
                  </View>
                  </LinearGradient>
                  </View>
                  </View>
                  </BlurView>
                  </View>
                  </Modal>
                  );
                  }

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  
  // Loading & Error States
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  
  // Close Button
  closeButton: {
    position: 'absolute',
    top: -20,
    right: -10,
    zIndex: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // QR Frame Styles
  qrFrame: {
    borderRadius: 24,
    padding: 6,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  frameGradient: {
    borderRadius: 20,
    padding: 3,
  },
  qrContent: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
  },
  
  // Order Header
  orderHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // QR Code Container
  qrCodeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  // QR Code Info
  qrCodeInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  instructionText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Total Container
  totalContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    width: '100%',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37',
  },

  // View All Orders Button
  viewOrdersButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  viewOrdersButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  viewOrdersButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});