import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Send, Mail, Lock, LogOut, Trash2, Eye, EyeOff, Shield, HelpCircle, AlertTriangle } from 'lucide-react-native';
import { signOut, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  withDelay,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Header from '../components/Header';
import { useFocusEffect } from '@react-navigation/native';

export default function Account({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const scrollRef = useRef();

  // Swipe navigation setup
  const screenWidth = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = screenWidth * 0.3;
  
  // Animation values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation values for staggered elements
  const welcomeOpacity = useSharedValue(0);
  const sectionsOpacity = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - navigate to Stats
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Stats');
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - navigate to Home
        translateX.value = withSpring(-screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Home');
      } else {
        // Reset to original position
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    },
    onFail: () => {
      // Reset values if gesture fails
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }
      ],
      opacity: opacity.value,
    };
  });

  // Animated styles for staggered elements
  const welcomeStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
  }));

  const sectionsStyle = useAnimatedStyle(() => ({
    opacity: sectionsOpacity.value,
  }));

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset translateX to 0
      translateX.value = 0;
      // Ensure opacity is 1 when screen comes into focus
      opacity.value = 1;

      // Reset staggered animation values
      welcomeOpacity.value = 0;
      sectionsOpacity.value = 0;

      // Trigger staggered animations
      welcomeOpacity.value = withTiming(1, { duration: 600 }, () => {
        sectionsOpacity.value = withTiming(1, { duration: 600 });
      });

      // Get current user email
      if (auth.currentUser) {
        setUserEmail(auth.currentUser.email || '');
      }
    }, [])
  );

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation will be handled by the auth state listener in App.js
            } catch (error) {
              Alert.alert('Logout Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password updated successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      let errorMessage = 'Failed to update password. Please try again.';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password is too weak. Please choose a stronger password.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please logout and login again before changing your password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Password Change Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your dream data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                throw new Error('No authenticated user found');
              }

              // Delete user account
              await deleteUser(user);
              
              // Clear local storage
              await AsyncStorage.clear();
              
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              // Navigation will be handled by the auth state listener in App.js
            } catch (error) {
              let errorMessage = 'Failed to delete account. Please try again.';
              
              switch (error.code) {
                case 'auth/requires-recent-login':
                  errorMessage = 'Please logout and login again before deleting your account.';
                  break;
                default:
                  errorMessage = error.message;
              }
              
              Alert.alert('Delete Account Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle contact support
   */
  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For support, please email us at:\n\nsupport@dreamjournal.app\n\nWe\'ll get back to you as soon as possible.',
      [
        {
          text: 'Copy Email',
          onPress: () => {
            // In a real app, you might want to use a clipboard library
            Alert.alert('Email Copied', 'support@dreamjournal.app has been copied to your clipboard.');
          },
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      activeOffsetX={[-6, 6]}
      failOffsetY={[-25, 25]}
      simultaneousHandlers
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={{ flex: 1 }}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header */}
            <Header 
              icon={User}
              title="Account"
              secondaryActionIcon={LogOut}
              onSecondaryActionPress={handleLogout}
            />

            {/* Content */}
            <ScrollView 
              ref={scrollRef} 
              style={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContent}
            >
              {/* Welcome Section */}
              <Animated.View style={[styles.welcomeContainer, welcomeStyle]}>
                <View style={styles.welcomeContent}>
                  <View style={styles.welcomeHeader}>
                    <User size={24} color="#8B5CF6" />
                    <Text style={styles.welcomeTitle}>Account Settings</Text>
                  </View>
                  <Text style={styles.welcomeText}>
                    Manage your account settings and preferences
                  </Text>
                  {userEmail && (
                    <View style={styles.emailContainer}>
                      <Mail size={16} color="#6B7280" />
                      <Text style={styles.emailText}>{userEmail}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Account Sections */}
              <Animated.View style={[styles.sectionsContainer, sectionsStyle]}>
                
                {/* Change Password Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Lock size={20} color="#8B5CF6" />
                    <Text style={styles.sectionTitle}>Change Password</Text>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        placeholderTextColor="#6B7280"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={styles.eyeButton}
                      >
                        {showCurrentPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor="#6B7280"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.eyeButton}
                      >
                        {showNewPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Lock size={16} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor="#6B7280"
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                      >
                        {showConfirmPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleChangePassword}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Update Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Contact Support Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <HelpCircle size={20} color="#F59E0B" />
                    <Text style={styles.sectionTitle}>Contact Support</Text>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Need help? Our support team is here to assist you with any questions or issues.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.supportButton]}
                    onPress={handleContactSupport}
                    activeOpacity={0.8}
                  >
                    <Mail size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Contact Support</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete Account Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <AlertTriangle size={20} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Delete Account</Text>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={handleDeleteAccount}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Delete Account</Text>
                  </TouchableOpacity>
                </View>

              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContent: {
    paddingVertical: 20,
    paddingBottom: 160,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  welcomeText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emailText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  sectionsContainer: {
    gap: 20,
  },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  eyeButton: {
    padding: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  supportButton: {
    backgroundColor: '#F59E0B',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
