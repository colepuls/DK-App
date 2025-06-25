import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PenTool, Save } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import SaveDreamModal from '../components/SaveDreamModal';
import SuccessModal from '../components/SuccessModal';
import SpeechToText from '../components/SpeechToText';
import { generateMoodTag } from '../apis/GeminiAPI';
import Header from '../components/Header';
import { useFocusEffect } from '@react-navigation/native';

export default function Create({ navigation }) {
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedMood, setSavedMood] = useState('');
  const [generatedMood, setGeneratedMood] = useState('');

  // Swipe navigation setup
  const screenWidth = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = screenWidth * 0.3;
  
  // Animation values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation values for staggered elements
  const inputOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - navigate to Home
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Home');
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - navigate to Stats
        translateX.value = withSpring(-screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Stats');
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
  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset translateX to 0
      translateX.value = 0;
      // Ensure opacity is 1 when screen comes into focus
      opacity.value = 1;

      // Reset staggered animation values
      inputOpacity.value = 0;
      buttonOpacity.value = 0;

      // Trigger staggered animations
      inputOpacity.value = withTiming(1, { duration: 600 }, () => {
        // Only show button if there's already text
        if (body.trim()) {
          buttonOpacity.value = withTiming(1, { duration: 600 });
        }
      });
    }, []) // Remove body dependency to prevent re-triggering on every keystroke
  );

  // Separate effect to handle button visibility when text changes
  useEffect(() => {
    if (body.trim()) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
    } else {
      buttonOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [body]);

  // Helper function to sort dreams by timestamp (newest first)
  const sortDreamsByTimestamp = (dreamsArray) => {
    return dreamsArray.sort((a, b) => {
      const timestampA = new Date(a.timestamp || 0);
      const timestampB = new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;
    
    // Generate mood before showing modal
    let mood = 'Neutral'; // Default to Neutral
    try {
      console.log('Generating mood for dream:', body.substring(0, 100) + '...');
      mood = await generateMoodTag(body);
      console.log('Generated mood:', mood);
    } catch (err) {
      console.error('Failed to get mood from AI:', err);
      // Keep the default 'Neutral' mood
    }
    
    setGeneratedMood(mood);
    setShowModal(true);
  };

  const saveDream = async () => {
    if (!title.trim()) return;

    const newDream = {
      id: Date.now(),
      title: title.trim(),
      text: body,
      mood: generatedMood,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      existing.push(newDream);
      // Sort dreams by timestamp in descending order (newest first)
      const sortedDreams = sortDreamsByTimestamp(existing);
      await AsyncStorage.setItem('dreams', JSON.stringify(sortedDreams));
      setBody('');
      setTitle('');
      setShowModal(false);
      setGeneratedMood('');
      
      // Show success modal instead of alert
      setSavedMood(generatedMood);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving dream:', err);
      Alert.alert('Error', 'Failed to save dream.');
    }
  };

  const handleSpeechText = (text) => {
    // Append the speech text to the existing text with proper spacing
    setBody(prevBody => {
      const trimmedPrev = prevBody.trim();
      const trimmedNew = text.trim();
      
      if (!trimmedPrev) {
        return trimmedNew;
      }
      
      // Add proper spacing and punctuation
      const lastChar = trimmedPrev.slice(-1);
      const needsSpace = lastChar !== ' ' && lastChar !== '.' && lastChar !== '!' && lastChar !== '?';
      const needsPeriod = !lastChar.match(/[.!?]/);
      
      let separator = needsSpace ? ' ' : '';
      if (needsPeriod && !trimmedNew.startsWith('and') && !trimmedNew.startsWith('but') && !trimmedNew.startsWith('or')) {
        separator += '. ';
      }
      
      return trimmedPrev + separator + trimmedNew;
    });
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
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <Header 
                icon={PenTool}
                title="Record Your Dream"
              />

              {/* Dream Input */}
              <Animated.View style={[styles.inputContainer, inputStyle]}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Describe your dream</Text>
                </View>
                <TextInput
                  placeholder="Write down every detail you remember from your dream..."
                  placeholderTextColor="#6B7280"
                  value={body}
                  onChangeText={setBody}
                  multiline
                  style={styles.input}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {body.length} characters
                </Text>
                
                {/* Speech to Text Component */}
                <SpeechToText 
                  onTextReceived={handleSpeechText}
                  disabled={false}
                  placeholder="Tap to speak your dream..."
                />
              </Animated.View>

              {/* Action Buttons */}
              {body.trim() && (
                <Animated.View style={[styles.buttonContainer, buttonStyle]}>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Save size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Dream</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>

        <SaveDreamModal
          visible={showModal}
          titleValue={title}
          onTitleChange={setTitle}
          onSave={saveDream}
          onCancel={() => {
            setShowModal(false);
            setGeneratedMood('');
          }}
          mood={generatedMood}
        />

        <SuccessModal
          visible={showSuccessModal}
          mood={savedMood}
          onClose={() => setShowSuccessModal(false)}
        />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  inputContainer: {
    margin: 20,
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
  inputHeader: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  buttonContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
