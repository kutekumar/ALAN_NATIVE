import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontFamily } from '../styles/fonts';

const { width } = Dimensions.get('window');

interface WorkingErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function WorkingErrorModal({ 
  visible, 
  title, 
  message, 
  onClose 
}: WorkingErrorModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={50} color="#EF4444" />
            </View>
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Got it</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 380,
    width: width > 400 ? 380 : width - 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: FontFamily.primary,
    fontSize: 24,
    fontWeight: '400',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 120,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.primary,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});