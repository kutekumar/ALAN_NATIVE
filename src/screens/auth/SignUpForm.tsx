import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles } from '../../styles/fonts';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const getErrorMessage = (error: any) => {
    if (error.message?.includes('User already registered')) {
      return 'An account with this email already exists. Please try signing in instead.';
    }
    if (error.message?.includes('Password should be at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    if (error.message?.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    return error.message || 'An unexpected error occurred during sign up.';
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      
      if (error) {
        // Platform-specific alert handling
        if (Platform.OS === 'web') {
          window.alert(`Sign Up Failed\n\n${getErrorMessage(error)}`);
        } else {
          Alert.alert(
            'Sign Up Failed',
            getErrorMessage(error),
            [
              {
                text: 'OK',
                style: 'default',
              },
            ]
          );
        }
      }
      // Success is handled by the auth state change
    } catch (error) {
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, textStyles.label]}>Full Name</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, textStyles.inputText]}
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
            </View>
          )}
        />
        {errors.fullName && (
          <Text style={[styles.errorText, textStyles.caption]}>{errors.fullName.message}</Text>
        )}
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, textStyles.label]}>Phone Number</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, textStyles.inputText]}
                placeholder="+95 9xxxxxxxxx"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
            </View>
          )}
        />
        {errors.phone && (
          <Text style={[styles.errorText, textStyles.caption]}>{errors.phone.message}</Text>
        )}
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, textStyles.label]}>Email Address</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, textStyles.inputText]}
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
            </View>
          )}
        />
        {errors.email && (
          <Text style={[styles.errorText, textStyles.caption]}>{errors.email.message}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, textStyles.label]}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                style={[styles.passwordInput, textStyles.inputText]}
                placeholder="Create a secure password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text style={[styles.errorText, textStyles.caption]}>{errors.password.message}</Text>
        )}
      </View>

      {/* Terms Text */}
      <Text style={[styles.termsText, textStyles.caption]}>
        By creating an account, you agree to our{' '}
        <Text style={[styles.linkText, textStyles.caption]}>Terms of Service</Text> and{' '}
        <Text style={[styles.linkText, textStyles.caption]}>Privacy Policy</Text>
      </Text>

      {/* Create Account Button */}
      <TouchableOpacity
        style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#D4AF37', '#FFD700']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={[styles.buttonText, textStyles.buttonText]}>Create Account</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#1a202c',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    minHeight: 52,
    backdropFilter: 'blur(10px)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1a202c',
    outlineStyle: 'none', // Remove web focus outline
    fontWeight: '500',
  },
  passwordInput: {
    flex: 1,
    color: '#1a202c',
    outlineStyle: 'none', // Remove web focus outline
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  termsText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  linkText: {
    color: '#D4AF37',
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});