import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  onNavigateBack: () => void;
}

export default function ForgotPassword({ onNavigateBack }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        Alert.alert(
          'Reset Failed',
          error.message || 'An error occurred while sending reset email'
        );
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      setIsLoading(true);
      try {
        const { error } = await resetPassword(email);
        if (!error) {
          Alert.alert('Email Sent', 'Password reset email sent again.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to resend email');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success State */}
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color="#ee7620" />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailText}>{getValues('email')}</Text>
            </Text>
            <Text style={styles.instructionText}>
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </Text>

            {/* Resend Button */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ee7620" />
              ) : (
                <Text style={styles.resendButtonText}>Resend Email</Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backArrow} onPress={onNavigateBack}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError,
                    ]}
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity style={styles.backToSignIn} onPress={onNavigateBack}>
              <Ionicons name="arrow-back" size={16} color="#64748b" />
              <Text style={styles.backToSignInText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  backArrow: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#ee7620',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#ee7620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToSignInText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  // Success state styles
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#fef7ee',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#ee7620',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  resendButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ee7620',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#ee7620',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});