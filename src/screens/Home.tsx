import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
  StatusBar,
  TouchableOpacity,
  ViewStyle,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../types';
import { textStyles } from '../styles/fonts';
import { useRestaurants, useFeaturedRestaurants } from '../hooks';
import { NewRestaurantCard, RestaurantCircleCard, MobileLayout } from '../components';
import { Restaurant } from '../types';
import { useAuth } from '../context/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [page, setPage] = useState(0);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const ITEMS_PER_PAGE = 10;

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const userName = profile?.full_name?.split(' ')[0] || 'there';

  // Fetch featured restaurants (top rated)
  const { 
    data: featuredRestaurants = [], 
    isLoading: featuredLoading,
    refetch: refetchFeatured
  } = useFeaturedRestaurants();

  // Fetch restaurants for infinite scroll
  const { 
    data: restaurants = [], 
    isLoading: restaurantsLoading, 
    error: restaurantsError,
    refetch: refetchRestaurants
  } = useRestaurants({
    search: searchQuery.trim() || undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  // Animation effect
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update all restaurants when new data comes in
  React.useEffect(() => {
    if (page === 0) {
      setAllRestaurants(restaurants);
    } else {
      setAllRestaurants(prev => [...prev, ...restaurants]);
    }
  }, [restaurants, page]);

  // Reset page and data when search query changes
  React.useEffect(() => {
    setPage(0);
    setAllRestaurants([]);
    // Force refetch after state reset
    const timer = setTimeout(() => {
      refetchRestaurants();
    }, 10);
    return () => clearTimeout(timer);
  }, [searchQuery, refetchRestaurants]);

  // Force data load when component mounts (since we remount on tab switch)
  React.useEffect(() => {
    // Clear cache and fetch fresh data on component mount
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    queryClient.invalidateQueries({ queryKey: ['restaurants', 'featured'] });
    
    // Reset state for fresh start
    setPage(0);
    setAllRestaurants([]);
    
    // Fetch fresh data
    const timer = setTimeout(() => {
      refetchRestaurants();
      refetchFeatured();
    }, 50);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array since component remounts on tab switch

  const filteredFeatured = featuredRestaurants.filter(restaurant => 
    restaurant.rating >= 4
  ).slice(0, 8);

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
  };

  const handleLoadMore = useCallback(() => {
    if (!restaurantsLoading && restaurants.length === ITEMS_PER_PAGE) {
      setPage(prev => prev + 1);
    }
  }, [restaurantsLoading, restaurants.length]);

  const handleRefresh = useCallback(async () => {
    setPage(0);
    setAllRestaurants([]);
    // Invalidate cache first, then refetch
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    await Promise.all([refetchFeatured(), refetchRestaurants()]);
  }, [refetchFeatured, refetchRestaurants, queryClient]);

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <NewRestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const renderFeaturedItem = ({ item }: { item: Restaurant }) => (
    <RestaurantCircleCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          {greeting}, {userName}!
        </Text>
        <Text style={styles.subGreeting}>
          What would you like to eat today?
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={searchFocused ? ['#ffffff', '#fffef8'] : ['#ffffff', '#fefcf3']}
            style={[
              styles.searchGradient,
              searchFocused && styles.searchGradientFocused
            ]}
          >
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={18} color={searchFocused ? "#D4AF37" : "#B8860B"} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants, cuisines..."
              placeholderTextColor="#B8860B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setPage(0);
                  setAllRestaurants([]);
                  // Invalidate and refetch restaurants cache
                  queryClient.invalidateQueries({ queryKey: ['restaurants'] });
                }}
              >
                <Ionicons name="close-circle" size={18} color="#B8860B" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      </View>
    </View>
  );
  
  const renderTopRestaurantsSection = () => {
    if (filteredFeatured.length === 0) return null;

    return (
      <View style={styles.topRestaurantsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top Restaurants
          </Text>
        </View>
        <FlatList
          horizontal
          data={filteredFeatured}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => `featured-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topRestaurantsList}
          decelerationRate="fast"
          snapToAlignment="start"
          snapToInterval={86}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={styles.container}
      >
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Main Content - Header moved to ListHeaderComponent for scrollable content */}
          <FlatList
              style={styles.mainList}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
              refreshControl={
                <RefreshControl
                  refreshing={featuredLoading || restaurantsLoading}
                  onRefresh={handleRefresh}
                  tintColor="#D4AF37"
                  colors={['#D4AF37']}
                />
              }
              ListHeaderComponent={() => (
                <View style={styles.listHeader}>
                  {/* Header with Greeting and Search */}
                  {renderHeader()}

                  {/* Top Restaurants Section */}
                  {renderTopRestaurantsSection()}

                  {/* All Restaurants Section Header */}
                  {(allRestaurants.length > 0 || searchQuery) ? (
                    <View style={styles.allRestaurantsHeader}>
                      {searchQuery ? (
                        <Text style={styles.sectionTitle}>
                          Results for "{searchQuery}"
                        </Text>
                      ) : (
                        <View style={styles.dividerContainer}>
                          <View style={styles.dividerLine} />
                          <Text style={styles.dividerText}>Restaurants</Text>
                          <View style={styles.dividerLine} />
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              )}
              data={allRestaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={() => 
                restaurantsLoading && page > 0 ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color="#D4AF37" />
                    <Text style={styles.loadingText}>
                      Loading more restaurants...
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={() => {
                if (!restaurantsLoading && !featuredLoading && searchQuery) {
                  return (
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyContent}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>
                          No restaurants found
                        </Text>
                        <Text style={styles.emptyMessage}>
                          Try adjusting your search or browse our top restaurants above.
                        </Text>
                      </View>
                    </View>
                  );
                }
                return null;
              }}
              contentContainerStyle={styles.listContent}
            />
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingTop: 80, // Reduced padding - just enough space for sticky glass nav
    paddingBottom: 12,
  },
  greetingContainer: {
    marginBottom: 12,
  },
  greeting: {
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 20,
  },
  subGreeting: {
    color: '#6b7280',
    fontWeight: '400',
    fontSize: 14,
  },
  // Search styles
  searchContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    // Remove default iOS border
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
      },
    }),
  },
  searchGradientFocused: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#374151',
    fontSize: 14,
    fontWeight: '400',
    // Remove default iOS border and focus styles
    ...Platform.select({
      ios: {
        borderWidth: 0,
      },
      android: {
        borderWidth: 0,
      },
      web: {
        borderWidth: 0,
      },
    }),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 4,
  },
  // Main list styles
  mainList: {
    flex: 1,
  },
  listHeader: {
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 100, // Space for glass bottom tabs
  },
  // Top restaurants section
  topRestaurantsSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  topRestaurantsList: {
    paddingLeft: 0,
    paddingRight: 16,
    marginTop: 12,
    minHeight: 120, // Minimum height for better scrolling
  },
  // Section styles
  sectionTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 18,
  },
  // Divider styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  dividerText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // All restaurants section
  allRestaurantsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  // Loading and empty states
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyContent: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyMessage: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: '400',
    fontSize: 14,
  },
  loadingText: {
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '400',
    fontSize: 14,
  },
});