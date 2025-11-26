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

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const { signIn } = useAuth();
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
      console.log('Starting sign in process...');
      const result = await signIn(data.email, data.password);
      console.log('Sign in result:', result);
      
      setIsLoading(false);
      
      if (result?.error) {
        console.log('Sign in error detected:', result.error);
        const errorMessage = getErrorMessage(result.error);
        console.log('Showing alert with message:', errorMessage);
        
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
      } else {
        console.log('Sign in successful');
      }
    } catch (error: any) {
      console.log('Sign in catch error:', error);
      setIsLoading(false);
      
      // Platform-specific alert handling
      if (Platform.OS === 'web') {
        window.alert(`Connection Error\n\nUnable to connect to the server. Please check your internet connection and try again.\n\nError: ${error.message || error}`);
      } else {
        Alert.alert(
          'Connection Error',
          `Unable to connect to the server. Please check your internet connection and try again. Error: ${error.message || error}`,
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      }
    }
  };


  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
                placeholder="Enter your password"
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

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={[styles.forgotPasswordText, textStyles.bodySmall]}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.signInButton, isLoading && styles.buttonDisabled]}
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
              <Text style={[styles.buttonText, textStyles.buttonText]}>Sign In</Text>
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
    marginBottom: 24,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    padding: 4,
  },
  forgotPasswordText: {
    color: '#D4AF37',
  },
  signInButton: {
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