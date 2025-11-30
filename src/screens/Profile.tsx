import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthProvider';
import { useOnboarding } from '../context/OnboardingProvider';
import { useCustomerLoyaltySummary } from '../hooks';

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();
 
  const { data: loyaltySummary, isLoading: loyaltyLoading } =
    useCustomerLoyaltySummary(user?.id);
 
  const loyaltyPoints = loyaltySummary?.total_points ?? 0;
  const loyaltyCompleted = loyaltySummary?.total_completed_orders ?? 0;
  const loyaltySpent = loyaltySummary?.total_spent ?? 0;
  const loyaltyBadge = loyaltySummary?.current_badge ?? 'Newbie';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      await resetOnboarding();
      await signOut();
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'AL';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#D4AF37', '#FFD700']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
                </LinearGradient>
              )}
              <View style={styles.onlineIndicator} />
            </View>

            <Text style={styles.profileName}>
              {profile?.full_name || 'ALAN LUX User'}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            {profile?.phone && (
              <View style={styles.phoneContainer}>
                <Ionicons name="call" size={14} color="#64748B" />
                <Text style={styles.profilePhone}>{profile.phone}</Text>
              </View>
            )}
          </View>

          {/* Loyalty Rewards Card */}
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <Ionicons name="trophy" size={24} color="#D4AF37" />
              <Text style={styles.loyaltyTitle}>Loyalty Rewards</Text>
            </View>
            
            <View style={styles.badgeSection}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={styles.badgeCircle}
              >
                <Ionicons name="ribbon" size={32} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.badgeName}>{loyaltyBadge}</Text>
              <Text style={styles.badgeSubtext}>Current Tier</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="star" size={20} color="#D4AF37" />
                </View>
                <Text style={styles.statValue}>
                  {loyaltyLoading ? '—' : loyaltyPoints}
                </Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-done-circle" size={20} color="#D4AF37" />
                </View>
                <Text style={styles.statValue}>
                  {loyaltyLoading ? '—' : loyaltyCompleted}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="cash" size={20} color="#D4AF37" />
                </View>
                <Text style={styles.statValue}>
                  {loyaltyLoading ? '—' : loyaltySpent.toFixed(0)} MMK
                </Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
            </View>
          </View>

          {/* Account Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Account Details</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color="#D4AF37" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>
                  {profile?.full_name || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="mail-outline" size={20} color="#D4AF37" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{profile?.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="call-outline" size={20} color="#D4AF37" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>
                  {profile?.phone || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="globe-outline" size={20} color="#D4AF37" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>
                  {profile?.language === 'en' ? 'English' : profile?.language || 'English'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#D4AF37" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Member Since</Text>
                <Text style={styles.detailValue}>
                  {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={styles.editButtonGradient}
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
              <Ionicons name="refresh-outline" size={18} color="#64748B" />
              <Text style={styles.resetButtonText}>Reset & See Onboarding</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profilePhone: {
    fontSize: 13,
    color: '#64748B',
  },
  loyaltyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgeSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  badgeSubtext: {
    fontSize: 13,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  editButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    gap: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});