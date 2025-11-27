import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthProvider';
import { useOnboarding } from '../context/OnboardingProvider';
import { textStyles } from '../styles/fonts';
import { MobileLayout } from '../components';

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();

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
    <MobileLayout>
      <SafeAreaView style={styles.container}>
      {/* Header Gradient */}
      <LinearGradient
        colors={['#FFF8DC', '#FFFFFF']}
        style={styles.headerGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                <Text style={[styles.avatarText, textStyles.heading3]}>{getInitials(profile?.full_name)}</Text>
              </LinearGradient>
            )}
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, textStyles.heading2]}>
              {profile?.full_name || 'ALAN LUX User'}
            </Text>
            <Text style={[styles.profileEmail, textStyles.body]}>{profile?.email}</Text>
            {profile?.phone && (
              <View style={styles.phoneContainer}>
                <Ionicons name="call" size={16} color="#64748B" />
                <Text style={[styles.profilePhone, textStyles.bodySmall]}>{profile.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Details Card */}
        <View style={styles.detailsCard}>
          <Text style={[styles.cardTitle, textStyles.heading3]}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={20} color="#D4AF37" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, textStyles.label]}>Full Name</Text>
              <Text style={[styles.detailValue, textStyles.body]}>
                {profile?.full_name || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="mail-outline" size={20} color="#D4AF37" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, textStyles.label]}>Email Address</Text>
              <Text style={[styles.detailValue, textStyles.body]}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="call-outline" size={20} color="#D4AF37" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, textStyles.label]}>Phone Number</Text>
              <Text style={[styles.detailValue, textStyles.body]}>
                {profile?.phone || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="globe-outline" size={20} color="#D4AF37" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, textStyles.label]}>Language</Text>
              <Text style={[styles.detailValue, textStyles.body]}>
                {profile?.language === 'en' ? 'English' : profile?.language || 'English'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#D4AF37" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, textStyles.label]}>Member Since</Text>
              <Text style={[styles.detailValue, textStyles.body]}>
                {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={[styles.cardTitle, textStyles.heading3]}>Your Activity</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, textStyles.heading2]}>0</Text>
              <Text style={[styles.statLabel, textStyles.bodySmall]}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, textStyles.heading2]}>0</Text>
              <Text style={[styles.statLabel, textStyles.bodySmall]}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, textStyles.heading2]}>0</Text>
              <Text style={[styles.statLabel, textStyles.bodySmall]}>Reviews</Text>
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
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={[styles.editButtonText, textStyles.buttonText]}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
            <Ionicons name="refresh-outline" size={20} color="#D4AF37" />
            <Text style={[styles.resetButtonText, textStyles.body]}>Reset & See Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.logoutButtonText, textStyles.body]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
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
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  editButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});