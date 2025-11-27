import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { textStyles } from '../styles/fonts';

interface NewRestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px margin on each side

export const NewRestaurantCard: React.FC<NewRestaurantCardProps> = ({
  restaurant,
  onPress,
}) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(restaurant.rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name="star" 
          size={12} 
          color={i < fullStars ? '#FFD700' : '#E5E7EB'} 
          style={styles.star}
        />
      );
    }
    
    return stars;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* Card with shadow and glow effect */}
      <View style={styles.card}>
        {/* Restaurant Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: restaurant.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
            }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Rating badge on image */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
          </View>

          {/* Cuisine type badge */}
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.9)', 'rgba(255, 215, 0, 0.9)']}
            style={styles.cuisineBadge}
          >
            <Text style={styles.cuisineText}>{restaurant.cuisine_type}</Text>
          </LinearGradient>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, textStyles.heading4]} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
          </View>

          <Text style={[styles.description, textStyles.bodySmall]} numberOfLines={2}>
            {restaurant.description}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text style={[styles.address, textStyles.caption]} numberOfLines={1}>
              {restaurant.address}
            </Text>
          </View>

          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={[styles.hours, textStyles.caption]}>
              {restaurant.open_hours}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    // Enhanced glow effect
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  cuisineBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cuisineText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.1)',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    color: '#2d3748',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginLeft: 1,
  },
  description: {
    color: '#4a5568',
    lineHeight: 18,
    marginBottom: 10,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  address: {
    color: '#718096',
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    color: '#718096',
    marginLeft: 6,
    fontSize: 12,
  },
});