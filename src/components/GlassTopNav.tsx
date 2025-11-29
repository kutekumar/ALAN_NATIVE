import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlassTopNavProps {
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
}

export const GlassTopNav: React.FC<GlassTopNavProps> = ({
  onNotificationPress,
  onLogoutPress
}) => {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    if (onLogoutPress) {
      onLogoutPress();
    } else {
      signOut();
    }
  };

  return (
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
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#D4AF37" />
                <View style={styles.notificationDot} />
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
    overflow: 'hidden',
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
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
});