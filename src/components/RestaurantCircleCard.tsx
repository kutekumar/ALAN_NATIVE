import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { textStyles } from '../styles/fonts';

interface RestaurantCircleCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 70;

export const RestaurantCircleCard: React.FC<RestaurantCircleCardProps> = ({
  restaurant,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: restaurant.image_url || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#ffffff" />
          <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={[styles.name, textStyles.caption]} numberOfLines={2}>
        {restaurant.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: CIRCLE_SIZE + 16,
    marginRight: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  name: {
    textAlign: 'center',
    color: '#2d3748',
    fontWeight: '500',
    lineHeight: 12,
    maxWidth: CIRCLE_SIZE,
    fontSize: 11,
  },
});