import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { textStyles } from '../styles/fonts';

interface SimpleModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
}

export default function SimpleModal({ 
  visible, 
  title, 
  message, 
  onClose, 
  type = 'error' 
}: SimpleModalProps) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={48} color="#10B981" />;
      case 'info':
        return <Ionicons name="information-circle" size={48} color="#3B82F6" />;
      default:
        return <Ionicons name="alert-circle" size={48} color="#EF4444" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return '#D1FAE5';
      case 'info':
        return '#DBEAFE';
      default:
        return '#FEE2E2';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
            {getIcon()}
          </View>
          
          <Text style={[styles.title, textStyles.heading3]}>{title}</Text>
          <Text style={[styles.message, textStyles.body]}>{message}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={[styles.buttonText, textStyles.buttonText]}>Got it</Text>
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
  overlayTouch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#64748B',
    textAlign: 'center',
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
    textAlign: 'center',
  },
});