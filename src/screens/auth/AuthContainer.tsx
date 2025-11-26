import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { textStyles } from '../../styles/fonts';

const { width } = Dimensions.get('window');

type AuthTabType = 'signIn' | 'signUp';

export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState<AuthTabType>('signIn');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab: AuthTabType) => {
    if (tab === activeTab) return;

    // Fade out current form
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      
      // Slide animation for tab indicator
      Animated.timing(slideAnim, {
        toValue: tab === 'signIn' ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fade in new form
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const cardWidth = Math.min(width - 48, 432); // Max width for the card
  const tabWidth = (cardWidth - 70) / 2; // Calculate proper tab width
  
  const tabIndicatorTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, tabWidth + 3], // Proper positioning
  });

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg' }}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === 'ios' ? 10 : 5}
      >
        {/* Overlay for better contrast */}
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/ALANLOGO.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.appName, textStyles.appTitle]}>ALAN LUX</Text>
              <Text style={[styles.tagline, textStyles.appSubtitle]}>Premium Dining Experience</Text>
            </View>

            {/* Auth Card with Glassmorphism */}
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="light" style={styles.authCard}>
                <View style={styles.glassmorphismOverlay}>
                  {renderCardContent()}
                </View>
              </BlurView>
            ) : (
              <View style={[styles.authCard, styles.glassmorphismFallback]}>
                {renderCardContent()}
              </View>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );

  function renderCardContent() {
    return (
      <>
        <Text style={[styles.welcomeText, textStyles.body]}>
          Welcome! Sign in or create an account to continue
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: tabWidth,
                  transform: [{ translateX: tabIndicatorTranslateX }],
                },
              ]}
            />
            <TouchableOpacity
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handleTabChange('signIn')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  textStyles.tabButtonText,
                  activeTab === 'signIn' && styles.activeTabText,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handleTabChange('signUp')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  textStyles.tabButtonText,
                  activeTab === 'signUp' && styles.activeTabText,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Content */}
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {activeTab === 'signIn' ? <SignInForm /> : <SignUpForm />}
        </Animated.View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#D4AF37',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  authCard: {
    borderRadius: 24,
    padding: 32,
    maxWidth: 432,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  glassmorphismOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  glassmorphismFallback: {
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  welcomeText: {
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    fontWeight: '600',
  },
  tabContainer: {
    marginBottom: 32,
  },
  tabBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 3,
    flexDirection: 'row',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    height: 42,
    backgroundColor: '#D4AF37',
    borderRadius: 9,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tab: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    minHeight: 42,
    zIndex: 2,
  },
  activeTab: {
    // Styling handled by indicator
  },
  tabText: {
    color: '#2d3748',
    textAlign: 'center',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    minHeight: 300,
  },
});

// Note: You'll need to install expo-linear-gradient
// Run: npx expo install expo-linear-gradient