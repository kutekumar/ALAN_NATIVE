import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles } from '../styles/fonts';

export default function HomeScreen() {
  const WelcomeCard = () => (
    <View style={styles.cardContent}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/ALANLOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.title, textStyles.appTitle]}>
        Welcome to ALAN LUX
      </Text>
      <Text style={[styles.subtitle, textStyles.appSubtitle]}>
        Premium Dining Experience
      </Text>
      <Text style={[styles.description, textStyles.body]}>
        Pre-order from luxury restaurants in Yangon. Skip the wait, show your QR code, and enjoy an exceptional dining experience.
      </Text>
    </View>
  );

  const QuickActionsCard = () => (
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, textStyles.heading3]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <View style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>🍽️</Text>
          </View>
          <Text style={[styles.actionText, textStyles.bodySmall]}>Browse Menu</Text>
        </View>
        <View style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📱</Text>
          </View>
          <Text style={[styles.actionText, textStyles.bodySmall]}>My Orders</Text>
        </View>
        <View style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>⭐</Text>
          </View>
          <Text style={[styles.actionText, textStyles.bodySmall]}>Favorites</Text>
        </View>
        <View style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>🎯</Text>
          </View>
          <Text style={[styles.actionText, textStyles.bodySmall]}>Reservations</Text>
        </View>
      </View>
    </View>
  );

  const renderGlassCard = (content: React.ReactNode, style?: any) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={20} tint="light" style={[styles.glassCard, style]}>
          <View style={styles.glassmorphismOverlay}>
            {content}
          </View>
        </BlurView>
      );
    } else {
      return (
        <View style={[styles.glassCard, styles.glassmorphismFallback, style]}>
          {content}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg' }}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === 'ios' ? 8 : 4}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Card */}
            {renderGlassCard(<WelcomeCard />, styles.welcomeCard)}
            
            {/* Quick Actions Card */}
            {renderGlassCard(<QuickActionsCard />, styles.actionsCard)}

            {/* Featured Card */}
            {renderGlassCard(
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, textStyles.heading3]}>Today's Special</Text>
                <Text style={[styles.featuredText, textStyles.body]}>
                  Experience our chef's signature dishes crafted with the finest ingredients. Book your table now for an unforgettable culinary journey.
                </Text>
                <LinearGradient
                  colors={['#D4AF37', '#FFD700']}
                  style={styles.featuredButton}
                >
                  <Text style={[styles.buttonText, textStyles.buttonText]}>Explore Menu</Text>
                </LinearGradient>
              </View>,
              styles.featuredCard
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  glassCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  glassmorphismOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 24,
  },
  glassmorphismFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 24,
  },
  welcomeCard: {
    marginTop: 20,
  },
  actionsCard: {
    // Additional spacing if needed
  },
  featuredCard: {
    marginBottom: 40,
  },
  cardContent: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 40,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  description: {
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    fontWeight: '400',
  },
  cardTitle: {
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
  },
  actionItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 20,
  },
  actionIcon: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuredText: {
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 300,
  },
  featuredButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});