import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SimpleErrorModal({ visible, title, message, onClose }: SimpleErrorModalProps) {
  console.log('SimpleErrorModal render:', { visible, title, message });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});