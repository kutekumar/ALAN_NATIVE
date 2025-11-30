import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../services/supabase';
import { Restaurant, MenuItem, MainStackParamList } from '../types';
import { MenuItemCard } from '../components/MenuItemCard';
import { textStyles } from '../styles/fonts';
import { MobileLayout } from '../components';
import { useCart } from '../context/CartContext';

type RestaurantDetailRouteProp = RouteProp<MainStackParamList, 'RestaurantDetail'>;
type RestaurantDetailNavigationProp = StackNavigationProp<MainStackParamList, 'RestaurantDetail'>;

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.4;

export default function RestaurantDetailScreen() {
  const navigation = useNavigation<RestaurantDetailNavigationProp>();
  const route = useRoute<RestaurantDetailRouteProp>();
  const { restaurantId } = route.params;
  const { addItem, removeItem, updateQuantity: updateCartQuantity, cart, getTotalPrice, getTotalItems, setOrderType } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localOrderType, setLocalOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) throw restaurantError;

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('available', true)
        .order('name', { ascending: true });

      if (menuError) throw menuError;

      setRestaurant(restaurantData);
      setMenuItems(menuData || []);
      setFilteredMenuItems(menuData || []);
    } catch (err: any) {
      console.error('Error fetching restaurant data:', err);
      setError(err.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMenuItems(menuItems);
    } else {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenuItems(filtered);
    }
  }, [searchQuery, menuItems]);

  const updateLocalQuantity = (itemId: string, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      // Update cart context as well
      if (newQty === 0) {
        // Remove from cart
        removeItem(itemId);
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      } else {
        // Update cart quantity
        updateCartQuantity(itemId, newQty);
        return { ...prev, [itemId]: newQty };
      }
    });
  };

  const openMenuModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setModalVisible(true);
  };

  // Update cart order type when user changes selection
  const handleOrderTypeChange = (type: 'dine_in' | 'takeaway') => {
    setLocalOrderType(type);
    setOrderType(type);
  };

  const handleAddToCart = (item: MenuItem) => {
    const cartItem = {
      menuId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurantId,
    };
    addItem(cartItem);
    updateLocalQuantity(item.id, 1);
  };

  const handleCallRestaurant = () => {
    if (restaurant?.phone) {
      const phoneUrl = `tel:${restaurant.phone}`;
      Linking.openURL(phoneUrl);
    }
  };

  const renderRating = () => {
    if (!restaurant) return null;
    
    const stars = [];
    const fullStars = Math.floor(restaurant.rating);
    const hasHalfStar = restaurant.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half-star" name="star-half" size={16} color="#FFD700" />
      );
    }

    // Fill remaining with outline stars
    const remainingStars = 5 - Math.ceil(restaurant.rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons key={`outline-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={[styles.ratingText, textStyles.bodySmall]}>
          {restaurant.rating.toFixed(1)} Rating
        </Text>
      </View>
    );
  };

  const renderGlassOverlay = (content: React.ReactNode) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={20} tint="light" style={styles.glassOverlay}>
          {content}
        </BlurView>
      );
    } else {
      return (
        <View style={[styles.glassOverlay, styles.glassOverlayFallback]}>
          {content}
        </View>
      );
    }
  };

  const renderHeroRating = () => {
    if (!restaurant?.rating && restaurant?.rating !== 0) return null;
    
    return (
      <View style={styles.heroRatingWrapper}>
        <View style={styles.heroStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.floor(restaurant.rating) ? 'star' : 'star-outline'}
              size={9}
              color="#FFD700"
              style={styles.heroStar}
            />
          ))}
        </View>
        <Text style={styles.heroRatingText}>
          {restaurant.rating.toFixed(1)} • {restaurant.review_count || 0} reviews
        </Text>
      </View>
    );
  };

  // Since we don't have categories, we'll display all menu items in a single list

  if (loading) {
    return (
      <MobileLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={[styles.loadingText, textStyles.bodyMedium]}>
            Loading restaurant details...
          </Text>
        </View>
      </MobileLayout>
    );
  }

  if (error || !restaurant) {
    return (
      <MobileLayout>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={[styles.errorTitle, textStyles.heading4]}>
            Unable to Load Restaurant
          </Text>
          <Text style={[styles.errorText, textStyles.bodyMedium]}>
            {error || 'Restaurant not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRestaurantData}
          >
            <Text style={[styles.retryButtonText, textStyles.buttonText]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout backgroundImage={{ uri: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Restaurant Info Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: restaurant.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay for Better Text Contrast */}
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={40} tint="light" style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>

          {/* Restaurant Complete Info Overlay */}
          <View style={styles.heroInfoContainer}>
            <BlurView intensity={60} tint="dark" style={styles.heroInfoBlur}>
              {/* Main Restaurant Title - Centered */}
              <View style={styles.heroMainInfo}>
                <Text style={styles.heroRestaurantName}>
                  {restaurant.name}
                </Text>
                
                {/* Restaurant Description - Centered below title */}
                {restaurant.description && (
                  <Text style={styles.heroDescriptionText}>
                    {restaurant.description}
                  </Text>
                )}
              </View>

              {/* Restaurant Details Grid */}
              <View style={styles.heroDetailsGrid}>
                <Text style={styles.heroCuisineType}>
                  {restaurant.cuisine_type}
                </Text>
                
                <View style={styles.heroRatingContainer}>
                  {renderHeroRating()}
                </View>

                {/* Address */}
                <View style={styles.heroDetailItem}>
                  <View style={styles.heroIconContainer}>
                    <Ionicons name="location" size={18} color="#D4AF37" />
                  </View>
                  <View style={styles.heroDetailText}>
                    <Text style={styles.heroDetailLabel}>Location</Text>
                    <Text style={styles.heroDetailValue}>{restaurant.address}</Text>
                  </View>
                </View>

                {/* Phone */}
                {restaurant.phone && (
                  <TouchableOpacity 
                    style={styles.heroDetailItem}
                    onPress={handleCallRestaurant}
                    activeOpacity={0.7}
                  >
                    <View style={styles.heroIconContainer}>
                      <Ionicons name="call" size={18} color="#D4AF37" />
                    </View>
                    <View style={styles.heroDetailText}>
                      <Text style={styles.heroDetailLabel}>Phone</Text>
                      <Text style={[styles.heroDetailValue, styles.heroPhoneText]}>
                        {restaurant.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Opening Hours */}
                <View style={styles.heroDetailItem}>
                  <View style={styles.heroIconContainer}>
                    <Ionicons name="time" size={18} color="#D4AF37" />
                  </View>
                  <View style={styles.heroDetailText}>
                    <Text style={styles.heroDetailLabel}>Hours</Text>
                    <Text style={styles.heroDetailValue}>{restaurant.open_hours}</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Menu Section - Now Starts Earlier */}
        <View style={styles.detailsContainer}>

          {/* Order Type Selection */}
          <View style={styles.orderTypeSection}>
            <Text style={[styles.sectionTitle, textStyles.heading4]}>
              Order Type
            </Text>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  localOrderType === 'dine_in' && styles.activeTab,
                ]}
                onPress={() => handleOrderTypeChange('dine_in')}
              >
                <Text style={[
                  styles.tabText,
                  localOrderType === 'dine_in' && styles.activeTabText,
                ]}>
                  Dine In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  localOrderType === 'takeaway' && styles.activeTab,
                ]}
                onPress={() => handleOrderTypeChange('takeaway')}
              >
                <Text style={[
                  styles.tabText,
                  localOrderType === 'takeaway' && styles.activeTabText,
                ]}>
                  Take Away
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <View style={styles.menuHeader}>
              <Ionicons name="restaurant" size={28} color="#D4AF37" />
              <Text style={[styles.sectionTitle, textStyles.heading3]}>
                Our Menu
              </Text>
            </View>

            {/* Menu Search */}
            <View style={styles.searchContainer}>
              <LinearGradient
                colors={searchFocused ? ['#ffffff', '#fffef8'] : ['#ffffff', '#fefcf3']}
                style={[
                  styles.searchInputContainer,
                  searchFocused && styles.searchInputContainerFocused
                ]}
              >
                <Ionicons 
                  name="search" 
                  size={18} 
                  color={searchFocused ? "#D4AF37" : "#B8860B"} 
                  style={styles.searchIcon} 
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search menu items..."
                  placeholderTextColor="#B8860B"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close-circle" size={18} color="#B8860B" />
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
            
            {loading ? (
              <View style={styles.menuLoadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={[styles.loadingText, textStyles.bodyMedium]}>
                  Loading menu items...
                </Text>
              </View>
            ) : menuItems.length === 0 ? (
              <View style={styles.emptyMenuContainer}>
                <Ionicons name="restaurant" size={48} color="#94a3b8" />
                <Text style={[styles.emptyMenuText, textStyles.bodyMedium]}>
                  No menu items available at the moment
                </Text>
              </View>
            ) : (
              <View style={styles.menuItemsContainer}>
                <Text style={[styles.menuCount, textStyles.bodySmall]}>
                  {filteredMenuItems.length} item{filteredMenuItems.length !== 1 ? 's' : ''} 
                  {searchQuery ? ` found for "${searchQuery}"` : ' available'}
                </Text>
                {filteredMenuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={quantities[item.id] || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={(change) => updateLocalQuantity(item.id, change)}
                    onImagePress={() => openMenuModal(item)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Menu Item Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          {selectedMenuItem && (
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              {selectedMenuItem.image_url && (
                <Image
                  source={{ uri: selectedMenuItem.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.modalGradient}
              >
                <View style={styles.modalInfo}>
                  <Text style={[styles.modalItemName, textStyles.heading3]}>
                    {selectedMenuItem.name}
                  </Text>
                  <Text style={[styles.modalItemDescription, textStyles.bodyMedium]}>
                    {selectedMenuItem.description}
                  </Text>
                  <View style={styles.modalPriceContainer}>
                    <Text style={[styles.modalPrice, textStyles.heading4]}>
                      {selectedMenuItem.price.toFixed(0)} MMK
                    </Text>
                    <TouchableOpacity
                      style={styles.modalAddButton}
                      onPress={() => {
                        handleAddToCart(selectedMenuItem);
                        setModalVisible(false);
                      }}
                    >
                      <LinearGradient
                        colors={['#D4AF37', '#FFD700']}
                        style={styles.modalAddButtonGradient}
                      >
                        <Ionicons name="add" size={20} color="#ffffff" />
                        <Text style={[styles.modalAddButtonText, textStyles.buttonText]}>
                          Add
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
      </Modal>

      {/* Sticky Cart Bar */}
      {getTotalItems() > 0 && (
        <View style={styles.stickyCartBar}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            style={styles.cartBarGradient}
          >
            <View style={styles.cartBarContent}>
              <View style={styles.cartBarInfo}>
                <Text style={[styles.cartBarItems, textStyles.buttonText]}>
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.cartBarTotal, textStyles.buttonText]}>
                  {getTotalPrice().toFixed(0)} MMK
                </Text>
              </View>
              <View style={styles.cartBarButtons}>
                <TouchableOpacity
                  style={styles.viewOrdersButton}
                  onPress={() => navigation.navigate('Cart' as never)}
                >
                  <Text style={[styles.viewOrdersText, textStyles.buttonText]}>
                    View Orders
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => navigation.navigate('Checkout' as never)}
                >
                  <Text style={[styles.payText, textStyles.buttonText]}>
                    Pay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  },
  // New Hero Section Styles - Half Size
  heroContainer: {
    position: 'relative',
    height: height * 0.325, // Half of 0.65 = 0.325
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10, // 20 ÷ 2 = 10
  },
  heroInfoBlur: {
    borderRadius: 10, // 20 ÷ 2 = 10
    padding: 12, // 24 ÷ 2 = 12
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  heroMainInfo: {
    marginBottom: 10, // 20 ÷ 2 = 10
    alignItems: 'center', // Center alignment
  },
  heroRestaurantName: {
    fontSize: 16, // 32 ÷ 2 = 16
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4, // 8 ÷ 2 = 4
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 }, // 2 ÷ 2 = 1
    textShadowRadius: 2, // 4 ÷ 2 = 2
    textAlign: 'center', // Center text alignment
  },
  heroCuisineType: {
    fontSize: 9, // 18 ÷ 2 = 9
    color: '#D4AF37',
    marginBottom: 6, // 12 ÷ 2 = 6
    fontWeight: '500',
  },
  heroRatingContainer: {
    marginBottom: 4, // 8 ÷ 2 = 4
  },
  heroRatingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStars: {
    flexDirection: 'row',
    marginRight: 4, // 8 ÷ 2 = 4
  },
  heroStar: {
    marginRight: 1, // 2 ÷ 2 = 1
  },
  heroRatingText: {
    fontSize: 8, // 16 ÷ 2 = 8
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  heroDetailsGrid: {
    marginBottom: 8, // 16 ÷ 2 = 8
  },
  heroDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6, // 12 ÷ 2 = 6
    paddingVertical: 2, // 4 ÷ 2 = 2
  },
  heroIconContainer: {
    width: 16, // 32 ÷ 2 = 16
    height: 16, // 32 ÷ 2 = 16
    borderRadius: 8, // 16 ÷ 2 = 8
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6, // 12 ÷ 2 = 6
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  heroDetailText: {
    flex: 1,
  },
  heroDetailLabel: {
    fontSize: 6, // 12 ÷ 2 = 6
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 1, // 2 ÷ 2 = 1
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  heroDetailValue: {
    fontSize: 7.5, // 15 ÷ 2 = 7.5
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 10, // 20 ÷ 2 = 10
  },
  heroPhoneText: {
    textDecorationLine: 'underline',
    color: '#D4AF37',
  },
  heroDescriptionContainer: {
    marginTop: 4, // 8 ÷ 2 = 4
    paddingTop: 8, // 16 ÷ 2 = 8
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroDescriptionText: {
    fontSize: 7, // 14 ÷ 2 = 7
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 10, // 20 ÷ 2 = 10
    fontStyle: 'italic',
    textAlign: 'center', // Center text alignment
    marginTop: 2, // Small spacing above description
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
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
  headerContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
    marginBottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  glassOverlay: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  glassOverlayFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  restaurantInfo: {
    alignItems: 'center',
  },
  restaurantName: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  cuisineType: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    color: '#64748b',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    flex: 1,
    color: '#1e293b',
  },
  phoneText: {
    color: '#D4AF37',
    textDecorationLine: 'underline',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1e293b',
    marginBottom: 12,
    fontWeight: '700',
  },
  description: {
    color: '#64748b',
    lineHeight: 24,
  },
  menuSection: {
    marginBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  emptyMenuContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMenuText: {
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
  menuItemsContainer: {
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  menuLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  menuCount: {
    color: '#64748b',
    marginBottom: 20,
    marginLeft: 20,
    fontStyle: 'italic',
    fontSize: 14,
  },
  // Order Type Styles
  orderTypeSection: {
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  // Search Styles
  searchContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: '#ffffff',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInputContainerFocused: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '400',
    // Remove default focus styles
    ...Platform.select({
      ios: {
        borderWidth: 0,
        outlineStyle: 'none',
      },
      android: {
        borderWidth: 0,
        outlineStyle: 'none',
      },
      web: {
        borderWidth: 0,
        outlineStyle: 'none',
        outlineWidth: 0,
      },
    }),
  },
  clearSearchButton: {
    padding: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: 400, // Same as restaurant card width
    maxWidth: width - 40, // Fallback for smaller screens
    maxHeight: height * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
  },
  modalInfo: {
    padding: 24,
  },
  modalItemName: {
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '700',
  },
  modalItemDescription: {
    color: '#f1f5f9',
    marginBottom: 16,
    lineHeight: 22,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalPrice: {
    color: '#FFD700',
    fontWeight: '700',
  },
  modalAddButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  modalAddButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Sticky Cart Bar Styles
  stickyCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cartBarGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cartBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBarInfo: {
    flex: 1,
  },
  cartBarItems: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cartBarTotal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  cartBarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewOrdersButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewOrdersText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  payText: {
    color: '#D4AF37',
    fontWeight: '700',
    fontSize: 14,
  },
});