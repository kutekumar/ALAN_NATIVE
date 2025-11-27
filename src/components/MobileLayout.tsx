import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Image, ImageSourcePropType } from 'react-native';

interface MobileLayoutProps {
  children: React.ReactNode;
  backgroundImage?: ImageSourcePropType;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, backgroundImage }) => {
  const isWeb = Platform.OS === 'web';
  const isMobile = screenWidth <= 768;
  
  if (isWeb && !isMobile) {
    // Desktop web view - center the mobile layout with full height
    return (
      <View style={styles.webContainer}>
        {backgroundImage && (
          <Image
            source={backgroundImage}
            style={styles.webBackgroundImage}
            resizeMode="cover"
            blurRadius={8}
          />
        )}
        <View style={styles.mobileContainer}>
          {children}
        </View>
      </View>
    );
  }
  
  // Native mobile or small screen - full width
  return (
    <View style={styles.fullContainer}>
      {backgroundImage && (
        <Image
          source={backgroundImage}
          style={styles.mobileBackgroundImage}
          resizeMode="cover"
          blurRadius={8}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  webBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  mobileContainer: {
    width: 400, // Slightly larger for better viewing
    height: Math.min(screenHeight - 40, 900), // Full height minus padding
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
  },
  fullContainer: {
    flex: 1,
    position: 'relative',
  },
  mobileBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
});