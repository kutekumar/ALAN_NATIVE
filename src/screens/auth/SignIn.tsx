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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { textStyles } from '../../styles/fonts';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function SignIn({ onNavigateToSignUp, onNavigateToForgotPassword }: SignInProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const getErrorMessage = (error: any) => {
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
      return 'The email or password you entered is incorrect. Please check your credentials and try again.';
    }
    if (errorMsg.includes('Email not confirmed') || errorMsg.includes('email_not_confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (errorMsg.includes('Too many requests') || errorMsg.includes('rate_limit')) {
      return 'Too many sign-in attempts. Please wait a few minutes before trying again.';
    }
    if (errorMsg.includes('User not found')) {
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    }
    
    return errorMsg || 'An unexpected error occurred during sign in. Please try again.';
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        const errorMessage = getErrorMessage(error);
        // Platform-specific alert handling
        if (Platform.OS === 'web') {
          window.alert(`Sign In Failed\n\n${errorMessage}`);
        } else {
          Alert.alert(
            'Sign In Failed',
            errorMessage,
            [
              {
                text: 'OK',
                style: 'default',
              },
            ]
          );
        }
      }
    } catch (error: any) {
      // Platform-specific alert handling
      if (Platform.OS === 'web') {
        window.alert(`Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.`);
      } else {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
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
            <Text style={[styles.title, textStyles.authTitle]}>Welcome Back</Text>
            <Text style={[styles.subtitle, textStyles.body]}>Sign in to ALAN LUX</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={onNavigateToForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, textStyles.bodySmall]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={[styles.signInButtonText, textStyles.buttonText]}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, textStyles.bodySmall]}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToSignUp}>
                <Text style={[styles.signUpLink, textStyles.bodySmall]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#ee7620',
  },
  signInButton: {
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
  signInButtonText: {
    color: '#ffffff',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#64748b',
  },
  signUpLink: {
    color: '#ee7620',
  },
});