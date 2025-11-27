import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Restaurant } from '../types';
import { textStyles } from '../styles/fonts';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  style?: any;
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const COMPACT_CARD_WIDTH = width - 40;

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  style,
  compact = false,
}) => {
  const cardWidth = compact ? COMPACT_CARD_WIDTH : CARD_WIDTH;

  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(restaurant.rating);
    const hasHalfStar = restaurant.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`star-${i}`} style={styles.star}>
          ⭐
        </Text>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Text key="half-star" style={styles.star}>
          ⭐
        </Text>
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={[styles.ratingText, textStyles.bodySmall]}>
          {restaurant.rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  const renderGlassOverlay = (content: React.ReactNode) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={20} tint="light" style={styles.overlay}>
          <View style={styles.overlayContent}>{content}</View>
        </BlurView>
      );
    } else {
      return (
        <View style={[styles.overlay, styles.overlayFallback]}>
          {content}
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: cardWidth },
        compact && styles.compactContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: restaurant.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
          }}
          style={[styles.image, compact && styles.compactImage]}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        
        {/* Glass overlay with restaurant info */}
        <View style={styles.infoOverlay}>
          {renderGlassOverlay(
            <View style={styles.info}>
              <Text style={[styles.name, textStyles.heading4]} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <Text style={[styles.cuisine, textStyles.bodySmall]} numberOfLines={1}>
                {restaurant.cuisine_type}
              </Text>
              <View style={styles.detailsRow}>
                {renderRating()}
                <Text style={[styles.hours, textStyles.caption]} numberOfLines={1}>
                  {restaurant.open_hours}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* View Button */}
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            style={styles.viewButton}
          >
            <Text style={[styles.buttonText, textStyles.buttonText]}>
              View
            </Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  compactContainer: {
    marginRight: 0,
    marginBottom: 16,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compactImage: {
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
  },
  overlay: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
  },
  overlayFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  info: {
    // Content styling handled by overlayContent/overlayFallback
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cuisine: {
    color: '#E2E8F0',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    fontSize: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  hours: {
    color: '#E2E8F0',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  viewButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
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