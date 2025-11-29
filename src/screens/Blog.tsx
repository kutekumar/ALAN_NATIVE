import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../types';
import RenderHtml from 'react-native-render-html';
import { MobileLayout } from '../components';
import { useBlogs } from '../hooks';
import { BlogPost } from '../types';
import { useQueryClient } from '@tanstack/react-query';

type BlogScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const getCategoryColor = (restaurantName: string) => {
  // Use restaurant name to determine color
  if (restaurantName?.toLowerCase().includes('italian')) return '#8b5cf6';
  if (restaurantName?.toLowerCase().includes('asian')) return '#ef4444';
  if (restaurantName?.toLowerCase().includes('american')) return '#3b82f6';
  return '#D4AF37'; // Default gold color for ALAN LUX
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function BlogScreen() {
  const navigation = useNavigation<BlogScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    data: blogPosts = [],
    isLoading,
    error,
    refetch
  } = useBlogs({ published: true });

  const handleRefresh = async () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['blogs'] });
    await refetch();
    setRefreshing(false);
  };

  const handleBlogPostPress = (blogPost: BlogPost) => {
    navigation.navigate('BlogPostDetail', { blogPost });
  };

  const renderBlogItem = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => handleBlogPostPress(item)}
    >
      <View style={styles.imageContainer}>
        {item.hero_image_url && item.hero_image_url !== 'https://via.placeholder.com/300x200' ? (
          <Image source={{ uri: item.hero_image_url }} style={styles.postImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
          </View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.restaurant_name || '') }]}>
          <Text style={styles.categoryText}>{item.restaurant_name || 'ALAN LUX'}</Text>
        </View>
      </View>
      
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        
        {/* Render excerpt as HTML if it contains HTML tags, otherwise as plain text */}
        {item.excerpt && (item.excerpt.includes('<') ? (
          <View style={styles.excerptContainer}>
            <RenderHtml
              contentWidth={Dimensions.get('window').width - 60}
              source={{ html: item.excerpt }}
              defaultTextProps={{ selectable: false }}
              tagsStyles={{
                p: { fontSize: 14, color: '#64748b', lineHeight: 22, marginVertical: 0 },
                strong: { fontWeight: '700' },
                em: { fontStyle: 'italic' },
                a: { color: '#D4AF37', textDecorationLine: 'underline' },
              }}
            />
          </View>
        ) : (
          <Text style={styles.postExcerpt} numberOfLines={2}>{item.excerpt}</Text>
        ))}
        
        <View style={styles.postMeta}>
          <Text style={styles.restaurant}>{item.restaurant_name || 'ALAN LUX'}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No blog posts yet</Text>
          <Text style={styles.emptyMessage}>
            Check back soon for the latest news, promotions, and food stories from ALAN LUX.
          </Text>
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <MobileLayout>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Blog & Stories</Text>
            <Text style={styles.subtitle}>Stay updated with our latest news, promotions, and food stories</Text>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Failed to load blog posts</Text>
            <Text style={styles.errorMessage}>Please check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <View style={styles.container}>
        <FlatList
          data={blogPosts}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#D4AF37"
              colors={['#D4AF37']}
            />
          }
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.title}>Blog & Stories</Text>
              <Text style={styles.subtitle}>Stay updated with our latest news, promotions, and food stories</Text>
            </View>
          )}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={() => <View style={styles.bottomSpacing} />}
        />
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for bottom tab bar
  },
  header: {
    padding: 20,
    paddingTop: 80, // Reduced padding for sticky glass nav
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    padding: 20,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 26,
  },
  excerptContainer: {
    marginBottom: 12,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurant: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100, // Extra space for bottom tab bar
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyContent: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyMessage: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: '400',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
    marginTop: 16,
  },
  errorMessage: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },
});