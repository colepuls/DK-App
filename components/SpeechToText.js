import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { Mic, MicOff, Loader, ExternalLink } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';

export default function SpeechToText({ onTextReceived, disabled = false, placeholder = "Tap to speak..." }) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    checkSpeechRecognitionAvailability();
  }, []);

  const checkSpeechRecognitionAvailability = () => {
    // Most modern devices support speech recognition
    setIsAvailable(true);
  };

  const startListening = async () => {
    if (!isAvailable) {
      Alert.alert('Speech Recognition', 'Speech recognition is not available on this device.');
      return;
    }

    if (disabled) return;

    try {
      setIsListening(true);
      startPulseAnimation();

      // Show instructions for the best speech recognition experience
      Alert.alert(
        'Voice Input',
        'For the best experience:\n\n1. Tap the microphone icon on your keyboard\n2. Speak clearly and naturally\n3. Tap "Done" when finished\n\nYou can also continue typing normally.',
        [
          { 
            text: 'Got it!', 
            onPress: () => {
              stopListening();
              // Show additional tip after a short delay
              setTimeout(() => {
                showKeyboardTip();
              }, 500);
            }
          },
          { 
            text: 'Learn More', 
            onPress: () => {
              stopListening();
              showDetailedInstructions();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error with speech input:', error);
      stopListening();
    }
  };

  const showKeyboardTip = () => {
    Alert.alert(
      'Quick Tip',
      'Look for the microphone icon (🎤) on your keyboard! It\'s usually in the bottom-right corner.',
      [{ text: 'OK' }]
    );
  };

  const showDetailedInstructions = () => {
    Alert.alert(
      'Voice Input Instructions',
      'Voice input works through your device\'s keyboard:\n\n• iOS: Tap the microphone icon on the keyboard\n• Android: Tap the microphone icon on the keyboard\n• Web: Use your browser\'s speech recognition\n\nYour device will convert your speech to text automatically.',
      [
        { text: 'OK' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('App-Prefs:General&path=Keyboard');
            } else if (Platform.OS === 'android') {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  const stopListening = () => {
    setIsListening(false);
    stopPulseAnimation();
  };

  const startPulseAnimation = () => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  };

  const stopPulseAnimation = () => {
    pulseValue.value = withTiming(0, { duration: 300 });
  };

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseValue.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(pulseValue.value, [0, 1], [1, 0.7]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (!isAvailable) {
    return null; // Don't render if speech recognition is not available
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.micButton,
          isListening && styles.micButtonListening,
          disabled && styles.micButtonDisabled
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.micIconContainer, isListening && pulseStyle]}>
          {isListening ? (
            <Loader size={20} color="#FFFFFF" style={styles.spinningIcon} />
          ) : (
            <Mic size={20} color="#FFFFFF" />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {isListening && (
        <View style={styles.statusContainer}>
          <Text style={styles.listeningText}>Tap mic on keyboard</Text>
          <View style={styles.tipContainer}>
            <ExternalLink size={12} color="#8B5CF6" />
            <Text style={styles.tipText}>Look for 🎤 on your keyboard</Text>
          </View>
        </View>
      )}
      
      {!isListening && (
        <Text style={styles.placeholderText}>{placeholder}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonListening: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  micButtonDisabled: {
    backgroundColor: '#6B7280',
    shadowColor: '#6B7280',
  },
  micIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  listeningText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tipText: {
    color: '#8B5CF6',
    fontSize: 10,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
}); 