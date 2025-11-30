import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthProvider';
import { useOnboarding } from '../context/OnboardingProvider';
import HomeScreen from '../screens/Home';
import BlogScreen from '../screens/Blog';
import BlogPostDetailScreen from '../screens/BlogPostDetail';
import RestaurantDetailScreen from '../screens/RestaurantDetail';
import CartScreen from '../screens/Cart';
import CheckoutScreen from '../screens/Checkout';
import OrderDetailScreen from '../screens/OrderDetail';
import OrdersScreen from '../screens/Orders';
import ProfileScreen from '../screens/Profile';
import AuthStack from './AuthStack';
import Onboarding from '../screens/Onboarding';
import { MobileLayout, GlassLayoutWrapper } from '../components';

// Main Tab Navigator with Glass Effect
const Stack = createStackNavigator();

function CustomTabNavigator({ route }: { route: any }) {
  const initialTab = route?.params?.initialTab ?? 'Home';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [homeKey, setHomeKey] = useState(0);

  // Respond to changes in initialTab (e.g., View All Orders → Orders tab)
  React.useEffect(() => {
    if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const handleTabPress = (tabName: string) => {
    if (tabName === 'Home' && activeTab !== 'Home') {
      // Force complete remount of Home component with a slight delay
      setTimeout(() => {
        setHomeKey(prev => prev + 1);
      }, 50);
    }
    setActiveTab(tabName);
  };

  const handleNavigateToOrders = () => {
    setActiveTab('Orders');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen key={`home-${homeKey}`} />;
      case 'Orders':
        return <OrdersScreen />;
      case 'Blog':
        return <BlogScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen key={`home-${homeKey}`} />;
    }
  };

  return (
    <MobileLayout>
      <GlassLayoutWrapper
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onNavigateToOrders={handleNavigateToOrders}
      >
        {renderScreen()}
      </GlassLayoutWrapper>
    </MobileLayout>
  );
}

function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Main" component={CustomTabNavigator} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="BlogPostDetail" component={BlogPostDetailScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  const { session, loading } = useAuth();
  const { isFirstLaunch, completeOnboarding } = useOnboarding();

  // Show loading spinner while checking auth status
  if (loading || isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee7620" />
        <Text style={styles.loadingText}>Loading ALAN LUX...</Text>
      </View>
    );
  }

  // Show onboarding for first-time users (only if not authenticated)
  if (isFirstLaunch && !session) {
    return <Onboarding onFinish={completeOnboarding} />;
  }

  // Show auth screens if no session
  if (!session) {
    return <AuthStack />;
  }

  // Show main app if authenticated
  return <MainStackNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
});