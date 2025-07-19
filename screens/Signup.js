/**
 * Signup Screen - Firebase Authentication
 * 
 * This screen handles user registration with email and password using Firebase Authentication.
 * Features include:
 * - Email and password input fields
 * - Confirm password field with validation
 * - Form validation
 * - Error handling and display
 * - Loading states
 * - Navigation to login
 * - Consistent dark theme styling
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, signInWithApple } from '../firebase';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Header from '../components/Header';
import ErrorModal from '../components/ErrorModal';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';

// Apple Logo Component
const AppleLogo = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      fill={color}
    />
  </Svg>
);

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  /**
   * Validate form inputs and return error messages
   */
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle signup form submission
   */
  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert(
        'Account Created', 
        'Your account has been created successfully!',
        [{ text: 'OK' }]
      );
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support';
          break;
        default:
          errorMessage = error.message;
      }
      
      setErrorModal({
        visible: true,
        title: 'Signup Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to login screen
   */
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  /**
   * Handle Apple Sign-In using Expo Apple Authentication
   */
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Request Apple Authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Use our custom Apple Sign-In function
      await signInWithApple(credential.identityToken, credential.nonce);
      
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      let errorMessage = 'An error occurred during Apple Sign-In';
      
      if (error.code === 'ERR_CANCELED') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'ERR_INVALID_RESPONSE') {
        errorMessage = 'Invalid response from Apple';
      } else if (error.code === 'ERR_NOT_AVAILABLE') {
        errorMessage = 'Apple Sign-In is not available on this device';
      } else if (error.code === 'auth/invalid-credential') {
        if (error.message.includes('audience')) {
          errorMessage = 'Apple Sign-In is not available in development mode. Please use a production build or email/password sign-in.';
        } else {
          errorMessage = 'Apple Sign-In configuration issue. Please try again or use email/password sign-in.';
        }
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setErrorModal({
        visible: true,
        title: 'Apple Sign-In Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close error modal
   */
  const closeErrorModal = () => {
    setErrorModal({
      visible: false,
      title: '',
      message: '',
    });
  };

  /**
   * Retry Apple Sign-In
   */
  const retryAppleSignIn = () => {
    closeErrorModal();
    handleAppleSignIn();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          icon={User}
          title="Sign Up"
        />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start recording your dreams</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {/* Apple Sign-In Button */}
            <TouchableOpacity
              style={[styles.appleButton, loading && styles.appleButtonDisabled]}
              onPress={handleAppleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.appleButtonContent}>
                <AppleLogo />
                <Text style={styles.appleButtonText}>
                  {loading ? 'Signing In...' : 'Continue with Apple'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={closeErrorModal}
        onRetry={retryAppleSignIn}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  signupButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  signupButtonDisabled: {
    backgroundColor: '#4C1D95',
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  loginLink: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  appleButtonDisabled: {
    opacity: 0.7,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 