import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { useOnboarding } from '../context/OnboardingProvider';
import HomeScreen from '../screens/Home';
import ProfileScreen from '../screens/Profile';
import AuthStack from './AuthStack';
import Onboarding from '../screens/Onboarding';

// Placeholder screens
const OrdersScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="receipt-outline" size={64} color="#ee7620" />
    <Text style={styles.placeholderTitle}>Orders</Text>
    <Text style={styles.placeholderText}>Your order history will appear here</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Ionicons name="notifications-outline" size={64} color="#ee7620" />
    <Text style={styles.placeholderTitle}>Notifications</Text>
    <Text style={styles.placeholderText}>Stay updated with your orders</Text>
  </View>
);

// ProfileScreen now imported from separate file

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ee7620',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
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
  return <BottomTabNavigator />;
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