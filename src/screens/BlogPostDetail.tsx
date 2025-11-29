import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { MainStackParamList } from '../types';
import { BlogPost, BlogComment } from '../types';
import { useBlogComments, useAddBlogComment } from '../hooks';
import { useAuth } from '../context/AuthProvider';
import RenderHtml from 'react-native-render-html';

type BlogPostDetailScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BlogPostDetailScreen() {
  const navigation = useNavigation<BlogPostDetailScreenNavigationProp>();
  const route = useRoute();
  const { profile, user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blogPost = (route.params as any)?.blogPost as BlogPost;
  const blogPostId = blogPost?.id;

  const { data: comments = [], isLoading: commentsLoading } = useBlogComments(blogPostId);
  const addCommentMutation = useAddBlogComment();

  const handleAddComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync({
        blogPostId,
        customerId: user.id,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!blogPost) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Blog post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const isWideScreen = screenWidth > 768;
  const contentWidth = isWideScreen ? Math.min(screenWidth * 0.7, 800) : screenWidth;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {/* Wrapper for responsive width */}
        <View style={isWideScreen ? { alignItems: 'center' } : {}}>
          <View style={isWideScreen ? { width: contentWidth } : { width: '100%' }}>
            {/* Hero Image */}
            <View style={styles.heroContainer}>
              {blogPost.hero_image_url && blogPost.hero_image_url !== 'https://via.placeholder.com/300x200' ? (
                <Image source={{ uri: blogPost.hero_image_url }} style={styles.heroImage} />
              ) : (
                <View style={styles.placeholderHero}>
                  <Ionicons name="image-outline" size={60} color="#9ca3af" />
                </View>
              )}
              <View style={styles.categoryBadgeDetail}>
                <Text style={styles.categoryText}>{blogPost.restaurant_name || 'ALAN LUX'}</Text>
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{blogPost.title}</Text>

              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#D4AF37" />
                  <Text style={styles.metaText}>{blogPost.read_time} min read</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#D4AF37" />
                  <Text style={styles.metaText}>{formatDate(blogPost.created_at)}</Text>
                </View>
              </View>

              {/* Content - Rendered as HTML */}
              <RenderHtml
                contentWidth={contentWidth - 40}
                source={{ html: blogPost.content }}
                defaultTextProps={{ selectable: true }}
                tagsStyles={{
                  p: { marginVertical: 8, lineHeight: 24, color: '#374151', fontSize: 16 },
                  strong: { fontWeight: '700', color: '#1f2937' },
                  em: { fontStyle: 'italic', color: '#374151' },
                  br: { display: 'block', height: 0 },
                  a: { color: '#D4AF37', textDecorationLine: 'underline' },
                  h1: { fontSize: 28, fontWeight: 'bold', marginVertical: 16, color: '#1f2937' },
                  h2: { fontSize: 24, fontWeight: 'bold', marginVertical: 14, color: '#1f2937' },
                  h3: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, color: '#1f2937' },
                  h4: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#1f2937' },
                  ul: { marginVertical: 12, paddingLeft: 16 },
                  ol: { marginVertical: 12, paddingLeft: 16 },
                  li: { marginVertical: 4, fontSize: 16, color: '#374151', lineHeight: 24 },
                  blockquote: { 
                    borderLeftWidth: 4, 
                    borderLeftColor: '#D4AF37', 
                    paddingLeft: 16, 
                    marginVertical: 12,
                    fontStyle: 'italic',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    paddingVertical: 12,
                    paddingRight: 12,
                    borderRadius: 4,
                  },
                  code: { 
                    backgroundColor: '#f3f4f6', 
                    color: '#d946ef', 
                    fontFamily: 'monospace',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  },
                }}
              />

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <View style={styles.commentsSectionHeader}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#1f2937" />
                  <Text style={styles.commentsSectionTitle}>Comments ({comments.length})</Text>
                </View>

                {/* Add Comment Box */}
                {user ? (
                  <View style={styles.addCommentContainer}>
                    <View style={styles.commentInputRow}>
                      <View style={styles.avatarSmall}>
                        {profile?.avatar_url ? (
                          <Image source={{ uri: profile.avatar_url }} style={styles.avatarSmall} />
                        ) : (
                          <Ionicons name="person-circle" size={32} color="#D4AF37" />
                        )}
                      </View>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment..."
                        placeholderTextColor="#9ca3af"
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        editable={!isSubmitting}
                      />
                      {commentText.trim() && (
                        <TouchableOpacity
                          style={[
                            styles.submitButton,
                            isSubmitting && styles.submitButtonDisabled,
                          ]}
                          onPress={handleAddComment}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Ionicons name="send" size={20} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.loginPrompt}>
                    <Text style={styles.loginPromptText}>Sign in to comment</Text>
                  </View>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#D4AF37" />
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  </View>
                ) : comments.length > 0 ? (
                  <View>
                    {comments.map((comment, index) => (
                      <View key={comment.id}>
                        <View style={styles.commentCard}>
                          <View style={styles.commentHeader}>
                            <View style={styles.commentAuthor}>
                              {comment.customer_avatar ? (
                                <Image source={{ uri: comment.customer_avatar }} style={styles.avatar} />
                              ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                  <Ionicons name="person-circle" size={32} color="#D4AF37" />
                                </View>
                              )}
                              <View style={styles.authorInfo}>
                                <Text style={styles.commentAuthorName}>{comment.customer_name}</Text>
                                <Text style={styles.commentTime}>
                                  {formatDate(comment.created_at)} at {formatTime(comment.created_at)}
                                </Text>
                              </View>
                            </View>
                            {comment.is_edited && (
                              <Text style={styles.editedBadge}>Edited</Text>
                            )}
                          </View>
                          <Text style={styles.commentContent}>{comment.content}</Text>
                        </View>
                        {index < comments.length - 1 && <View style={styles.commentsSeparator} />}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noCommentsContainer}>
                    <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                    <Text style={styles.noCommentsSubtext}>
                      Be the first to share your thoughts!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: '#f8fafc',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderHero: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeDetail: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomColor: '#f1f5f9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
    marginTop: 30,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
  },
  addCommentContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loginPrompt: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  authorInfo: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  editedBadge: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  commentsSeparator: {
    height: 8,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});
