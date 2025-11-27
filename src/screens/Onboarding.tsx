import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { textStyles } from '../styles/fonts';
import { MobileLayout } from '../components/MobileLayout';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('../../assets/onboarding/slide1.png'),
    title: 'Discover Luxury Dining',
    subtitle: 'Explore Yangon\'s finest restaurants and exclusive culinary experiences',
    description: 'Browse premium restaurants, view exquisite menus, and discover hidden gems across Yangon.',
  },
  {
    id: 2,
    image: require('../../assets/onboarding/slide2.png'),
    title: 'Pre-Order & Skip the Wait',
    subtitle: 'Order ahead and pay seamlessly for instant dining',
    description: 'Select your meals, customize orders, and pay in advance. No more waiting - your food will be ready when you arrive.',
  },
  {
    id: 3,
    image: require('../../assets/onboarding/slide3.png'),
    title: 'QR Code & Enjoy',
    subtitle: 'Show your QR code and enjoy your perfectly prepared meal',
    description: 'Simply show your unique QR code at the restaurant. Choose Dine-In for table service or Take-Out for quick pickup.',
  },
];

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Get responsive width - use mobile layout width on web, full width on mobile
  const isWeb = Platform.OS === 'web';
  const isMobile = width <= 768;
  const slideWidth = (isWeb && !isMobile) ? 400 : width;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setCurrentIndex(index);
  };

  return (
    <MobileLayout>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, textStyles.bodySmall]}>Skip</Text>
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {onboardingData.map((item, index) => (
            <View key={item.id} style={[styles.slide, { width: slideWidth }]}>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={[styles.image, { width: slideWidth * 0.8 }]} resizeMode="contain" />
              </View>
              
              <View style={styles.contentContainer}>
                <Text style={[styles.title, textStyles.onboardingTitle]}>{item.title}</Text>
                <Text style={[styles.subtitle, textStyles.appSubtitle]}>{item.subtitle}</Text>
                <Text style={[styles.description, textStyles.onboardingSubtitle]}>{item.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={[styles.nextButtonText, textStyles.buttonText]}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  imageContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.8,
    height: height * 0.35,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 0.5,
    paddingHorizontal: 20,
  },
  title: {
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    color: '#ee7620',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#ee7620',
  },
  inactiveDot: {
    backgroundColor: '#e2e8f0',
  },
  nextButton: {
    backgroundColor: '#D4AF37',
    marginHorizontal: 24,
    marginBottom: 80,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#B8941F',
  },
  nextButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});