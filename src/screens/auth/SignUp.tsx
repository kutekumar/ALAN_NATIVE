import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import SimpleModal from '../../components/SimpleModal';
import { textStyles } from '../../styles/fonts';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
  onNavigateToSignIn: () => void;
}

export default function SignUp({ onNavigateToSignIn }: SignUpProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [successModal, setSuccessModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const getErrorMessage = (error: any) => {
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('User already registered') || errorMsg.includes('already_registered')) {
      return 'An account with this email already exists. Please try signing in instead.';
    }
    if (errorMsg.includes('Password should be at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    if (errorMsg.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMsg.includes('Signup is disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    
    return errorMsg || 'An unexpected error occurred during sign up. Please try again.';
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      
      if (error) {
        const errorMessage = getErrorMessage(error);
        setErrorModal({
          visible: true,
          title: 'Sign Up Failed',
          message: errorMessage,
        });
      } else {
        setSuccessModal({
          visible: true,
          title: 'Account Created!',
          message: 'Your account has been created successfully. You can now sign in.',
        });
      }
    } catch (error: any) {
      setErrorModal({
        visible: true,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setErrorModal({ visible: false, title: '', message: '' });
  };

  const closeSuccessModal = () => {
    setSuccessModal({ visible: false, title: '', message: '' });
    onNavigateToSignIn();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, textStyles.authTitle]}>Create Account</Text>
            <Text style={[styles.subtitle, textStyles.body]}>Join ALAN LUX today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, textStyles.label]}>Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      textStyles.inputText,
                      errors.fullName && styles.inputError,
                    ]}
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.fullName && (
                <Text style={[styles.errorText, textStyles.caption]}>{errors.fullName.message}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, textStyles.label]}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      textStyles.inputText,
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
                <Text style={[styles.errorText, textStyles.caption]}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, textStyles.label]}>Password</Text>
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.passwordInput,
                        textStyles.inputText,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, textStyles.caption]}>{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, textStyles.label]}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.passwordInput,
                        textStyles.inputText,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirm your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={[styles.errorText, textStyles.caption]}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.signUpButtonText, textStyles.buttonText]}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <Text style={[styles.termsText, textStyles.caption]}>
              By creating an account, you agree to our{' '}
              <Text style={[styles.linkText, textStyles.caption]}>Terms of Service</Text> and{' '}
              <Text style={[styles.linkText, textStyles.caption]}>Privacy Policy</Text>
            </Text>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, textStyles.bodySmall]}>Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignIn}>
                <Text style={[styles.signInLink, textStyles.bodySmall]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <SimpleModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={closeErrorModal}
        type="error"
      />

      {/* Success Modal */}
      <SimpleModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        onClose={closeSuccessModal}
        type="success"
      />
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748b',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: '#ee7620',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ee7620',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#ffffff',
  },
  termsText: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  linkText: {
    color: '#ee7620',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#64748b',
  },
  signInLink: {
    color: '#ee7620',
  },
});