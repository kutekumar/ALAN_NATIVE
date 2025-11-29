import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface GlassBottomTabsProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const tabs: TabItem[] = [
  {
    name: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home'
  },
  {
    name: 'Orders',
    icon: 'receipt-outline',
    iconFocused: 'receipt',
    label: 'Orders'
  },
  {
    name: 'Blog',
    icon: 'library-outline',
    iconFocused: 'library',
    label: 'Blog'
  },
  {
    name: 'Profile',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'Profile'
  }
];

const { width: screenWidth } = Dimensions.get('window');

export const GlassBottomTabs: React.FC<GlassBottomTabsProps> = ({
  activeTab,
  onTabPress
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.tabsContent}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabButton}
                onPress={() => onTabPress(tab.name)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer
                ]}>
                  <Ionicons
                    name={isActive ? tab.iconFocused : tab.icon}
                    size={22}
                    color={isActive ? '#D4AF37' : '#64748b'}
                  />
                </View>
                <Text style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#D4AF37',
    fontWeight: '600',
  },
});