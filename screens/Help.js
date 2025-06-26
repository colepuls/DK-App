import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageCircle, Send, Brain, Lightbulb } from 'lucide-react-native';
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
import { getDreamHelp } from '../apis/GeminiAPI';
import Header from '../components/Header';
import { useFocusEffect } from '@react-navigation/native';

// Animated Thinking Component
const AnimatedThinking = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);
  const brainScale = useSharedValue(1);

  useEffect(() => {
    // Animate dots in sequence
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    );
    
    dot2.value = withDelay(200, withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    ));
    
    dot3.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    ));

    // Animate brain icon
    brainScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.8 + dot1.value * 0.2 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.8 + dot2.value * 0.2 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.8 + dot3.value * 0.2 }],
  }));

  const brainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: brainScale.value }],
  }));

  return (
    <View style={styles.thinkingContainer}>
      <Animated.View style={brainStyle}>
        <Brain size={16} color="#8B5CF6" />
      </Animated.View>
      <Text style={styles.thinkingText}>Thinking</Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
};

export default function Help({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dreamData, setDreamData] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef();

  // Swipe navigation setup
  const screenWidth = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = screenWidth * 0.3;
  
  // Animation values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation values for staggered elements
  const welcomeOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);

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

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
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
      inputOpacity.value = 0;

      // Trigger staggered animations
      welcomeOpacity.value = withTiming(1, { duration: 600 }, () => {
        inputOpacity.value = withTiming(1, { duration: 600 });
      });
    }, [])
  );

  useEffect(() => {
    loadDreamData();
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

  const loadDreamData = async () => {
    try {
      const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      setDreamData(dreams);
    } catch (error) {
      console.error('Error loading dream data:', error);
    }
  };

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setPrompt('');

    try {
      const response = await getDreamHelp(prompt, dreamData);
      const aiMessage = { sender: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errMessage = { sender: 'ai', text: 'Error contacting AI.' };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickStats = () => {
    const totalDreams = dreamData.length;
    const moodCounts = dreamData.reduce((acc, dream) => {
      acc[dream.mood] = (acc[dream.mood] || 0) + 1;
      return acc;
    }, {});
    
    return { totalDreams, moodCounts };
  };

  const stats = getQuickStats();

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
              icon={MessageCircle}
              title="AI Assistant"
            />

            {/* Messages */}
            <ScrollView 
              ref={scrollRef} 
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.length === 0 && (
                <Animated.View style={[styles.welcomeContainer, welcomeStyle]}>
                  <View style={styles.welcomeContent}>
                    <View style={styles.welcomeHeader}>
                      <Brain size={24} color="#8B5CF6" />
                      <Text style={styles.welcomeTitle}>Dream Journal Assistant</Text>
                    </View>
                    <Text style={styles.welcomeText}>
                      Ask me anything about your dreams, the app, or get tips for better dream journaling!
                    </Text>
                    <View style={styles.suggestionsContainer}>
                      <View style={styles.suggestionsHeader}>
                        <Lightbulb size={16} color="#F59E0B" />
                        <Text style={styles.suggestionsTitle}>Try asking:</Text>
                      </View>
                      <Text style={styles.suggestion}>• "How many scary dreams do I have?"</Text>
                      <Text style={styles.suggestion}>• "What patterns do you see in my dreams?"</Text>
                      <Text style={styles.suggestion}>• "How do I edit a dream?"</Text>
                      <Text style={styles.suggestion}>• "Give me tips for better dream recall"</Text>
                    </View>
                  </View>
                </Animated.View>
              )}
              
              {messages.map((m, i) => (
                <View 
                  key={i} 
                  style={m.sender === 'user' ? styles.userContainer : styles.aiContainer}
                >
                  <View style={m.sender === 'user' ? styles.userMessage : styles.aiMessage}>
                    <Text style={m.sender === 'user' ? styles.userText : styles.aiText}>
                      {m.text}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && (
                <View style={styles.aiContainer}>
                  <View style={styles.aiMessage}>
                    <AnimatedThinking />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <Animated.View style={[styles.inputContainer, inputStyle, { paddingBottom: keyboardVisible ? 20 : 80 }]}>
              <TextInput
                placeholder="Ask me anything about your dreams..."
                placeholderTextColor="#6B7280"
                value={prompt}
                onChangeText={setPrompt}
                style={styles.input}
                multiline
                maxLength={500}
                keyboardAppearance="dark"
              />
              <TouchableOpacity 
                style={[styles.sendButton, !prompt.trim() && styles.sendButtonDisabled]}
                onPress={handleAsk}
                disabled={!prompt.trim() || loading}
                activeOpacity={0.8}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
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
    marginBottom: 20,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionsTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  suggestion: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessage: {
    backgroundColor: '#8B5CF6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  aiContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiMessage: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
});
