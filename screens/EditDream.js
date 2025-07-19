/**
 * Edit Dream Screen
 * 
 * This screen allows users to edit existing dream entries including:
 * - Dream title
 * - Dream content/text
 * - Mood tag selection
 * 
 * Features:
 * - Consistent design with other app screens
 * - Form validation
 * - Smooth animations
 * - Auto-save functionality
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Save, Heart, Frown, Meh, Zap, AlertTriangle, ArrowLeft, Undo } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import Header from '../components/Header';
import EditSuccessModal from '../components/EditSuccessModal';
import ErrorModal from '../components/ErrorModal';
import { rewriteDream } from '../apis/GeminiAPI';

export default function EditDream({ route, navigation }) {
  const { id } = route?.params || {};
  const [dream, setDream] = useState(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [hasBeenImproved, setHasBeenImproved] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ title: '', message: '', onRetry: null });

  // Animation values for staggered elements
  const titleOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const moodOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  // Available mood options
  const moodOptions = [
    { key: 'Joyful', label: 'Joyful', icon: Heart, color: '#10B981' },
    { key: 'Sad', label: 'Sad', icon: Frown, color: '#3B82F6' },
    { key: 'Neutral', label: 'Neutral', icon: Meh, color: '#6B7280' },
    { key: 'Strange', label: 'Strange', icon: Zap, color: '#F59E0B' },
    { key: 'Scary', label: 'Scary', icon: AlertTriangle, color: '#EF4444' },
  ];

  // Animated styles for staggered elements
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const moodStyle = useAnimatedStyle(() => ({
    opacity: moodOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // Load dream data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setError('No dream ID provided');
        return;
      }

      loadDream();
    }, [id])
  );

  // Reset animation values when dream data changes
  useEffect(() => {
    if (dream) {
      // Trigger staggered animations
      titleOpacity.value = withTiming(1, { duration: 600 }, () => {
        textOpacity.value = withTiming(1, { duration: 600 }, () => {
          moodOpacity.value = withTiming(1, { duration: 600 }, () => {
            buttonOpacity.value = withTiming(1, { duration: 600 });
          });
        });
      });
    }
  }, [dream]);

  // Handle improvement state reset when text is manually changed
  useEffect(() => {
    // Reset improvement state if user manually changes text after improvement
    // Only reset if the current text is different from the last improved version
    // and also different from the original text (to avoid resetting during revert)
    if (hasBeenImproved && text !== rewrittenText && text !== originalText) {
      setHasBeenImproved(false);
      setOriginalText('');
      setRewrittenText('');
    }
  }, [text]);

  /**
   * Load dream data from AsyncStorage
   */
  const loadDream = async () => {
    try {
      const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      const found = dreams.find(d => d.id === id);
      
      if (found) {
        setDream(found);
        setTitle(found.title || '');
        setText(found.text || '');
        setSelectedMood(found.mood || 'Neutral');
        setError(null);
      } else {
        setError('Dream not found');
      }
    } catch (err) {
      console.error('Error loading dream:', err);
      setError('Error loading dream');
    }
  };

  /**
   * Save edited dream to AsyncStorage
   */
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a dream title');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Error', 'Please enter dream content');
      return;
    }

    setLoading(true);
    try {
      const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
              const updatedDreams = dreams.map(d => 
          d.id === id 
            ? { 
                ...d, 
                title: title.trim(), 
                text: text.trim(), 
                mood: selectedMood,
                lastEdited: new Date().toISOString(), // Add timestamp for when dream was last edited
                wasEdited: true // Add flag to indicate dream was edited
              }
            : d
        );

      // Sort dreams by timestamp in descending order (newest first)
      const sortedDreams = sortDreamsByTimestamp(updatedDreams);
      await AsyncStorage.setItem('dreams', JSON.stringify(sortedDreams));
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving dream:', err);
      Alert.alert('Error', 'Failed to save dream changes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper function to sort dreams by timestamp (newest first)
   */
  const sortDreamsByTimestamp = (dreamsArray) => {
    return dreamsArray.sort((a, b) => {
      const timestampA = new Date(a.timestamp || 0);
      const timestampB = new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
  };

  /**
   * Handle AI rewrite of dream content
   * Uses AI to improve grammar and writing quality while preserving all details
   */
  const handleRewrite = async () => {
    if (!text.trim()) return;
    
    setIsRewriting(true);
    try {
      console.log('Rewriting dream with AI...');
      // Store the original text only on the first improvement
      if (!hasBeenImproved) {
        setOriginalText(text);
      }
      const improvedText = await rewriteDream(text);
      
      setRewrittenText(improvedText);
      setText(improvedText);
      setHasBeenImproved(true);
      console.log('Dream rewritten successfully');
    } catch (err) {
      console.error('Failed to rewrite dream:', err);
      setErrorModalData({
        title: 'Improvement Failed',
        message: err.message || 'Failed to improve writing. Please try again.',
        onRetry: handleRewrite
      });
      setShowErrorModal(true);
    } finally {
      setIsRewriting(false);
    }
  };

  /**
   * Handle reverting AI improvements back to original text
   * Restores the original user input and hides the revert button
   */
  const handleRevert = () => {
    setText(originalText);
    // Reset improvement state to hide the revert button
    setHasBeenImproved(false);
    setOriginalText('');
    setRewrittenText('');
  };

  /**
   * Render mood selection buttons
   */
  const renderMoodOptions = () => {
    return (
      <View style={styles.moodOptionsContainer}>
        {moodOptions.map((mood) => {
          const MoodIcon = mood.icon;
          const isSelected = selectedMood === mood.key;
          
          return (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.moodOption,
                isSelected && { backgroundColor: mood.color }
              ]}
              onPress={() => setSelectedMood(mood.key)}
              activeOpacity={0.7}
            >
              <MoodIcon 
                size={16} 
                color={isSelected ? '#FFFFFF' : mood.color} 
              />
              <Text style={[
                styles.moodOptionText,
                isSelected && styles.moodOptionTextSelected
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Header 
          icon={Save}
          title="Edit Dream"
          backIcon={ArrowLeft}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.errorContainer}>
        <Header 
          icon={Save}
          title="Edit Dream"
          backIcon={ArrowLeft}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Loading dream...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            icon={Save}
            title="Edit Dream"
            backIcon={ArrowLeft}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.contentContainer}>
            {/* Title Section */}
            <Animated.View style={[styles.section, titleStyle]}>
              <Text style={styles.label}>Dream Title</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter a title for your dream..."
                placeholderTextColor="#6B7280"
                maxLength={100}
                keyboardAppearance="dark"
              />
              <Text style={styles.characterCount}>
                {title.length}/100
              </Text>
            </Animated.View>

            {/* Text Section */}
            <Animated.View style={[styles.section, textStyle]}>
              <Text style={styles.label}>Dream Content</Text>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Describe your dream..."
                placeholderTextColor="#6B7280"
                multiline
                textAlignVertical="top"
                keyboardAppearance="dark"
              />
              
              {/* Improve Writing and Revert Buttons */}
              {text.trim() && (
                <View style={styles.improveButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.improveButton, (isRewriting || hasBeenImproved) && styles.improveButtonDisabled]}
                    onPress={handleRewrite}
                    activeOpacity={0.8}
                    disabled={isRewriting || hasBeenImproved}
                  >
                    <Text style={styles.improveButtonText}>
                      {isRewriting ? 'Improving...' : hasBeenImproved ? 'Already Improved' : 'Improve Writing'}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Revert Changes Button - only show when text has been improved */}
                  {hasBeenImproved && (
                    <TouchableOpacity 
                      style={styles.revertButton}
                      onPress={handleRevert}
                      activeOpacity={0.8}
                    >
                      <Undo size={20} color="#FFFFFF" />
                      <Text style={styles.revertButtonText}>Revert Changes</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>

            {/* Mood Section */}
            <Animated.View style={[styles.section, moodStyle]}>
              <Text style={styles.label}>Dream Mood</Text>
              {renderMoodOptions()}
            </Animated.View>

            {/* Save Button */}
            <Animated.View style={[styles.buttonContainer, buttonStyle]}>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!title.trim() || !text.trim() || loading) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={!title.trim() || !text.trim() || loading}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <EditSuccessModal
        visible={showSuccessModal}
        mood={selectedMood}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />

      {/* Error Modal for Rewrite */}
      <ErrorModal
        visible={showErrorModal}
        title={errorModalData.title}
        message={errorModalData.message}
        onRetry={errorModalData.onRetry}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
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
    paddingBottom: 20,
  },
  contentContainer: {
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
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
    marginTop: 4,
  },
  moodOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#2A2A2A',
    minWidth: 80,
    justifyContent: 'center',
  },
  moodOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  moodOptionTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 8,
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
  saveButtonDisabled: {
    backgroundColor: '#4B5563',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  improveButtonContainer: {
    marginTop: 12,
    gap: 8,
  },
  improveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  improveButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  improveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  revertButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  revertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 