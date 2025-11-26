import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface TestErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function TestErrorModal({ visible, title, message, onClose }: TestErrorModalProps) {
  console.log('TestErrorModal props:', { visible, title, message });
  
  React.useEffect(() => {
    if (visible) {
      console.log('TestErrorModal is visible, showing alert');
      Alert.alert(title, message, [
        {
          text: 'Got it',
          onPress: onClose,
        }
      ]);
    }
  }, [visible, title, message, onClose]);

  if (visible) {
    return (
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});