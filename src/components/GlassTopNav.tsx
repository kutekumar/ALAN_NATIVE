import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks';
import { CustomerNotification } from '../types';

interface GlassTopNavProps {
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  onNavigateToOrders?: () => void;
}

const { width } = Dimensions.get('window');

export const GlassTopNav: React.FC<GlassTopNavProps> = ({
  onNotificationPress,
  onLogoutPress,
  onNavigateToOrders
}) => {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: notifications = [] } = useCustomerNotifications(profile?.id);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  
  const unreadNotifications = notifications.filter(n => n.status === 'unread');
  const unreadCount = unreadNotifications.length;

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<CustomerNotification | null>(null);
  const [notificationModalVisible, setNotificationModalVisible] = React.useState(false);
  const [orderDetails, setOrderDetails] = React.useState<any>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = React.useState(false);

  const handleLogout = () => {
    if (onLogoutPress) {
      onLogoutPress();
    } else {
      signOut();
    }
  };

  const handleNotificationClick = async (notification: CustomerNotification) => {
    // Mark as read
    if (notification.status === 'unread') {
      markAsRead.mutate(notification.id);
    }

    // If it's an order notification, fetch order details and show modal
    if (notification.order_id) {
      setSelectedNotification(notification);
      setNotificationModalVisible(true);
      setLoadingOrderDetails(true);
      
      try {
        const { supabase } = await import('../services/supabase');
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
          .eq('id', notification.order_id)
          .single();

        if (!error && data) {
          setOrderDetails({
            ...data,
            restaurant_name: data.restaurants?.name || 'Unknown Restaurant',
            restaurant_image: data.restaurants?.image_url,
            restaurant_address: data.restaurants?.address,
          });
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoadingOrderDetails(false);
      }
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (profile?.id) {
      markAllAsRead.mutate(profile.id);
    }
  };

  const handleViewOrder = () => {
    setNotificationModalVisible(false);
    if (onNavigateToOrders) {
      onNavigateToOrders();
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.navContent}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/ALANLOGO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Right side icons */}
            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsOpen(prev => !prev)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={22} color="#D4AF37" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Notification Dropdown Modal */}
      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={[styles.dropdownWrapper, { top: insets.top + 70 }]}>
                  <BlurView intensity={95} tint="light" style={styles.dropdownBlur}>
                    <View style={styles.dropdownContent}>
                      <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                          <TouchableOpacity
                            onPress={handleMarkAllAsRead}
                            style={styles.markAllButton}
                          >
                            <Text style={styles.markAllText}>Mark all read</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {notifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                          <Ionicons name="notifications-off-outline" size={40} color="#9ca3af" />
                          <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                      ) : (
                        <ScrollView 
                          style={styles.dropdownScroll}
                          showsVerticalScrollIndicator={false}
                        >
                          {notifications.map(notification => (
                            <TouchableOpacity
                              key={notification.id}
                              style={[
                                styles.dropdownItem,
                                notification.status === 'unread' && styles.dropdownItemUnread,
                              ]}
                              onPress={() => handleNotificationClick(notification)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.dropdownIcon}>
                                <Ionicons
                                  name={notification.order_id ? 'receipt' : 'notifications'}
                                  size={16}
                                  color={notification.status === 'unread' ? '#D4AF37' : '#64748B'}
                                />
                              </View>
                              <View style={styles.dropdownTextContainer}>
                                <Text
                                  style={[
                                    styles.dropdownItemTitle,
                                    notification.status === 'unread' && styles.dropdownItemTitleUnread,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {notification.title}
                                </Text>
                                <Text
                                  style={styles.dropdownItemMessage}
                                  numberOfLines={2}
                                >
                                  {notification.message}
                                </Text>
                                <Text style={styles.dropdownItemMeta}>
                                  {new Date(notification.created_at).toLocaleTimeString(undefined, {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </BlurView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Notification Detail Modal */}
      <Modal
        transparent
        visible={notificationModalVisible}
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNotificationModalVisible(false)}>
          <View style={styles.orderModalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.orderModalContent}>
                <LinearGradient
                  colors={['#ffffff', '#fefefe']}
                  style={styles.orderModalGradient}
                >
                  <TouchableOpacity
                    style={styles.orderModalClose}
                    onPress={() => setNotificationModalVisible(false)}
                  >
                    <Ionicons name="close-circle" size={28} color="#64748b" />
                  </TouchableOpacity>

                  {loadingOrderDetails ? (
                    <View style={styles.orderModalLoading}>
                      <Text style={styles.orderModalLoadingText}>Loading order details...</Text>
                    </View>
                  ) : orderDetails ? (
                    <>
                      <View style={styles.orderModalHeader}>
                        <View style={styles.orderModalIcon}>
                          <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                        </View>
                        <Text style={styles.orderModalTitle}>
                          {selectedNotification?.title || 'Order Confirmed'}
                        </Text>
                        <Text style={styles.orderModalSubtitle}>
                          Order #{orderDetails.id.slice(-6).toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.orderDetailsSection}>
                        <View style={styles.orderDetailRow}>
                          <Ionicons name="restaurant" size={18} color="#D4AF37" />
                          <Text style={styles.orderDetailLabel}>Restaurant</Text>
                        </View>
                        <Text style={styles.orderDetailValue}>
                          {orderDetails.restaurant_name}
                        </Text>
                      </View>

                      <View style={styles.orderDetailsSection}>
                        <View style={styles.orderDetailRow}>
                          <Ionicons name="receipt" size={18} color="#D4AF37" />
                          <Text style={styles.orderDetailLabel}>Items</Text>
                        </View>
                        {orderDetails.order_items.map((item: any, index: number) => (
                          <View key={index} style={styles.orderItemRow}>
                            <Text style={styles.orderItemName}>{item.name} x{item.quantity}</Text>
                            <Text style={styles.orderItemPrice}>{item.price * item.quantity} MMK</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.orderTotalSection}>
                        <View style={styles.orderDetailRow}>
                          <Ionicons name="cash" size={18} color="#D4AF37" />
                          <Text style={styles.orderDetailLabel}>Total Amount</Text>
                        </View>
                        <Text style={styles.orderTotalValue}>
                          {orderDetails.total_amount} MMK
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.viewOrderButton}
                        onPress={handleViewOrder}
                      >
                        <LinearGradient
                          colors={['#D4AF37', '#FFD700']}
                          style={styles.viewOrderGradient}
                        >
                          <Ionicons name="list" size={20} color="#ffffff" />
                          <Text style={styles.viewOrderText}>View All Orders</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.orderModalLoading}>
                      <Text style={styles.orderModalLoadingText}>Order details not available</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    overflow: 'visible',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 32,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownWrapper: {
    position: 'absolute',
    right: 20,
    width: 320,
    maxHeight: 450,
  },
  dropdownBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  dropdownContent: {
    maxHeight: 440,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  dropdownScroll: {
    maxHeight: 360,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemUnread: {
    backgroundColor: '#FFFBEB',
  },
  dropdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  dropdownTextContainer: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
  },
  dropdownItemTitleUnread: {
    color: '#B45309',
  },
  dropdownItemMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  dropdownItemMeta: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  // Order Detail Modal Styles
  orderModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderModalContent: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  orderModalGradient: {
    padding: 24,
  },
  orderModalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  orderModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  orderModalIcon: {
    marginBottom: 12,
  },
  orderModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  orderModalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  orderDetailsSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  orderDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  orderDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 26,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  orderTotalSection: {
    marginBottom: 20,
  },
  orderTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    textAlign: 'center',
    marginTop: 8,
  },
  viewOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewOrderText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  orderModalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  orderModalLoadingText: {
    fontSize: 14,
    color: '#64748B',
  },
});