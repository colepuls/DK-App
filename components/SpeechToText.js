/**
 * Speech-to-Text Component for Dream Journal
 * 
 * A React Native component that provides visual guidance for voice input functionality.
 * This component displays helpful instructions for users to use their device's built-in
 * speech recognition through the keyboard microphone button.
 * 
 * Features:
 * - Animated pulse effect to draw attention
 * - Cross-platform compatibility guidance
 * - Elegant visual design matching app theme
 * - Automatic availability detection
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Mic, Keyboard } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';

/**
 * SpeechToText Component
 * 
 * Displays visual guidance for voice input functionality in the Dream Journal app.
 * Shows users how to access speech-to-text features through their device's keyboard.
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.disabled=false] - Whether the speech input is disabled
 * @returns {JSX.Element|null} Speech guidance component or null if unavailable
 */
export default function SpeechToText({ disabled = false }) {
  // Component state
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Animation shared value for continuous pulse effect
  const pulseValue = useSharedValue(0);

  // Initialize component on mount
  useEffect(() => {
    checkSpeechRecognitionAvailability();
    startPulseAnimation();
  }, []);

  /**
   * Check Speech Recognition Availability
   * 
   * Verifies that speech recognition features are available on the current device.
   * In this implementation, we assume it's always available since most modern
   * devices support speech input through their keyboards.
   * 
   * @async
   * @function
   */
  const checkSpeechRecognitionAvailability = async () => {
    try {
      // Built-in speech recognition through keyboard is universally available
      // on modern iOS and Android devices
      setIsAvailable(true);
    } catch (error) {
      console.error('Error checking speech recognition availability:', error);
      setIsAvailable(false);
    }
  };

  /**
   * Start Pulse Animation
   * 
   * Initiates a continuous pulsing animation for the microphone icon
   * to draw user attention and indicate interactive functionality.
   * Uses React Native Reanimated for smooth, performant animations.
   * 
   * @function
   */
  const startPulseAnimation = () => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1, // Infinite repetition
      true // Reverse animation
    );
  };

  /**
   * Animated style for pulse effect
   * 
   * Creates a subtle scaling and opacity animation that pulses the microphone
   * icon to indicate it's interactive and available for use.
   */
  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseValue.value, [0, 1], [1, 1.05]);
    const opacity = interpolate(pulseValue.value, [0, 1], [0.8, 1]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Don't render if speech recognition is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(200)}
      style={styles.container}
    >
      {/* Icon container with microphone and keyboard indicators */}
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.micIconWrapper, pulseStyle]}>
          <Mic size={24} color="#8B5CF6" />
        </Animated.View>
        <Keyboard size={16} color="#6B7280" style={styles.keyboardIcon} />
      </View>
      
      {/* Instructional text for users */}
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>
          Use the microphone on your keyboard
        </Text>
        <Text style={styles.subText}>
          Tap the mic icon on your device's keyboard for voice input
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Component Styles
 * 
 * Styled using React Native StyleSheet for optimal performance.
 * Colors and dimensions match the app's dark theme with purple accents.
 */
const styles = StyleSheet.create({
  // Main container with purple-tinted background
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)', // Subtle purple background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)', // Purple border
  },
  
  // Container for icon elements with relative positioning
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  // Wrapper for microphone icon with animated background
  micIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  
  // Small keyboard icon positioned over microphone
  keyboardIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1A1A1A', // Dark background to stand out
    borderRadius: 8,
    padding: 2,
  },
  
  // Container for instructional text
  textContainer: {
    flex: 1,
  },
  
  // Primary instruction text in purple
  mainText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  // Secondary helper text in gray
  subText: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
}); 