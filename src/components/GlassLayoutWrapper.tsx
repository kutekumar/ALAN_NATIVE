import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlassTopNav } from './GlassTopNav';
import { GlassBottomTabs } from './GlassBottomTabs';

interface GlassLayoutWrapperProps {
  children: React.ReactNode;
  activeTab: string;
  onTabPress: (tabName: string) => void;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
}

export const GlassLayoutWrapper: React.FC<GlassLayoutWrapperProps> = ({
  children,
  activeTab,
  onTabPress,
  onNotificationPress,
  onLogoutPress
}) => {
  return (
    <View style={styles.container}>
      {/* Main Content */}
      {children}
      
      {/* Glass Navigation Overlay */}
      <GlassTopNav 
        onNotificationPress={onNotificationPress}
        onLogoutPress={onLogoutPress}
      />
      
      <GlassBottomTabs 
        activeTab={activeTab}
        onTabPress={onTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});