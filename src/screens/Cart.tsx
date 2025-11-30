import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MobileLayout } from '../components';
import { useCart } from '../context/CartContext';
import { textStyles } from '../styles/fonts';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    
    navigation.navigate('Checkout' as never);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  if (cart.items.length === 0) {
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
            <Text style={[styles.headerTitle, textStyles.heading3]}>Your Cart</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Empty State */}
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={80} color="#94a3b8" />
            <Text style={[styles.emptyTitle, textStyles.heading4]}>Your cart is empty</Text>
            <Text style={[styles.emptyText, textStyles.bodyMedium]}>
              Add some delicious items to get started!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.browseButtonText, textStyles.buttonText]}>
                Browse Menu
              </Text>
            </TouchableOpacity>
          </View>
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, textStyles.heading3]}>Your Cart</Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Type */}
          <View style={styles.orderTypeContainer}>
            <Text style={[styles.orderTypeText, textStyles.bodyMedium]}>
              Order Type: {cart.orderType}
            </Text>
          </View>

          {/* Cart Items */}
          <View style={styles.itemsContainer}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
            </Text>
            
            {cart.items.map((item) => (
              <View key={item.menuId} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, textStyles.heading6]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, textStyles.bodyMedium]}>
                    {item.price.toFixed(0)} MMK each
                  </Text>
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.menuId, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#D4AF37" />
                  </TouchableOpacity>
                  
                  <Text style={[styles.quantityText, textStyles.buttonText]}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.menuId, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color="#D4AF37" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemTotal}>
                  <Text style={[styles.itemTotalText, textStyles.heading6]}>
                    {(item.price * item.quantity).toFixed(0)} MMK
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.menuId)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text style={[styles.sectionTitle, textStyles.heading5]}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, textStyles.bodyMedium]}>Subtotal</Text>
              <Text style={[styles.summaryValue, textStyles.bodyMedium]}>
                {getTotalPrice().toFixed(0)} MMK
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, textStyles.heading5]}>Total</Text>
              <Text style={[styles.totalValue, textStyles.heading5]}>
                {getTotalPrice().toFixed(0)} MMK
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Checkout Button */}
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.checkoutGradient}
            >
              <Text style={[styles.checkoutButtonText, textStyles.buttonText]}>
                Proceed to Checkout
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
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
  orderTypeContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderTypeText: {
    color: '#64748b',
    textAlign: 'center',
  },
  itemsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1e293b',
    marginBottom: 16,
    fontWeight: '700',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#1e293b',
    marginBottom: 4,
    fontWeight: '600',
  },
  itemPrice: {
    color: '#64748b',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    color: '#D4AF37',
    fontWeight: '700',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    paddingTop: 12,
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
  checkoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Empty state styles
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
});