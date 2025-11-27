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
import { Ionicons } from '@expo/vector-icons';
import { MenuItem } from '../types';
import { textStyles } from '../styles/fonts';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (change: number) => void;
  onImagePress: () => void;
}

const { width } = Dimensions.get('window');

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  onAddToCart,
  onUpdateQuantity,
  onImagePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Row 1: Menu Item Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.name, textStyles.heading5]} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        {/* Row 2: Image and Description */}
        <View style={styles.imageDescriptionRow}>
          {/* Column 1: Image */}
          {item.image_url && (
            <TouchableOpacity style={styles.imageContainer} onPress={onImagePress}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Ionicons name="expand-outline" size={18} color="#ffffff" />
              </View>
            </TouchableOpacity>
          )}

          {/* Column 2: Description */}
          <View style={[styles.descriptionContainer, !item.image_url && styles.descriptionContainerFullWidth]}>
            <Text style={[styles.description, textStyles.bodySmall]} numberOfLines={4}>
              {item.description}
            </Text>
          </View>
        </View>

        {/* Row 3: Price and Add Button */}
        <View style={styles.priceActionRow}>
          {/* Column 1: Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, textStyles.heading5]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>

          {/* Column 2: Add Button */}
          <View style={styles.actionContainer}>
            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => onAddToCart(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.addButtonText, textStyles.buttonText]}>
                  + Add
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onUpdateQuantity(-1)}
                >
                  <Ionicons name="remove" size={14} color="#D4AF37" />
                </TouchableOpacity>
                <Text style={[styles.quantityText, textStyles.buttonText]}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onUpdateQuantity(1)}
                >
                  <Ionicons name="add" size={14} color="#D4AF37" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.08)',
  },
  content: {
    flexDirection: 'column',
    padding: 18,
  },
  // Row 1: Title
  titleRow: {
    marginBottom: 12,
  },
  // Row 2: Image and Description
  imageDescriptionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  descriptionContainerFullWidth: {
    flex: 1,
  },
  // Row 3: Price and Action
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  name: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  price: {
    color: '#D4AF37',
    fontWeight: '700',
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonText: {
    color: '#64748b',
    fontFamily: 'Suranna_400Regular',
    fontWeight: '600',
    fontSize: 11,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  quantityText: {
    minWidth: 32,
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 6,
  },
});