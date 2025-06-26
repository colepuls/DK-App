import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, Tag, Calendar, Clock, Brain, ArrowLeft, Hash } from 'lucide-react-native';
import ReAnimated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, FadeIn } from 'react-native-reanimated';
import { analyzeDream } from '../apis/GeminiAPI';
import Header from '../components/Header';
import { useFocusEffect } from '@react-navigation/native';
// import DreamSceneryViewer from '../components/DreamSceneryViewer';

// Simple animated thinking component using React Native's built-in Animated API
const SimpleAnimatedThinking = () => {
  const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(fadeAnim1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim1, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(fadeAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(fadeAnim2, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(fadeAnim3, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(fadeAnim3, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ]).start();
      }, 400);
    };

    animateDots();
    const interval = setInterval(animateDots, 1200);

    return () => clearInterval(interval);
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

  return (
    <View style={styles.thinkingContainer}>
      <Brain size={14} color="#FFFFFF" />
      <Text style={styles.thinkingText}>Analyzing</Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: fadeAnim1 }]} />
        <Animated.View style={[styles.dot, { opacity: fadeAnim2 }]} />
        <Animated.View style={[styles.dot, { opacity: fadeAnim3 }]} />
      </View>
    </View>
  );
};

export default function DreamView({ route, navigation }) {
  const { id, showAnalysis } = route?.params || {};
  const [dream, setDream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Animation values for staggered elements
  const titleOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const metadataOpacity = useSharedValue(0);
  const analysisOpacity = useSharedValue(0);

  // Helper function to sort dreams by timestamp (newest first)
  const sortDreamsByTimestamp = (dreamsArray) => {
    return dreamsArray.sort((a, b) => {
      const timestampA = new Date(a.timestamp || 0);
      const timestampB = new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
  };

  // Animated styles for staggered elements
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const metadataStyle = useAnimatedStyle(() => ({
    opacity: metadataOpacity.value,
  }));

  const analysisStyle = useAnimatedStyle(() => ({
    opacity: analysisOpacity.value,
  }));

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset staggered animation values
      titleOpacity.value = 0;
      textOpacity.value = 0;
      metadataOpacity.value = 0;
      analysisOpacity.value = 0;

      // Trigger staggered animations
      titleOpacity.value = withTiming(1, { duration: 600 }, () => {
        textOpacity.value = withTiming(1, { duration: 600 }, () => {
          metadataOpacity.value = withTiming(1, { duration: 600 }, () => {
            analysisOpacity.value = withTiming(1, { duration: 600 });
          });
        });
      });
    }, [dream])
  );

  useEffect(() => {
    if (!id) {
      setError('No dream ID provided');
      return;
    }

    (async () => {
      try {
        const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
        const found = dreams.find(d => d.id === id);
        if (found) {
          setDream(found);
        } else {
          setError('Dream not found');
        }
      } catch (err) {
        console.error('Error loading dream:', err);
        setError('Error loading dream');
      }
    })();
  }, [id]);

  // Auto-scroll to analysis when showAnalysis is true
  useEffect(() => {
    if (showAnalysis && dream?.analysis) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [showAnalysis, dream?.analysis]);

  const getMoodColor = (mood) => {
    const colors = {
      Joyful: '#10B981',
      Sad: '#3B82F6',
      Neutral: '#6B7280',
      Strange: '#F59E0B',
      Scary: '#EF4444',
    };
    return colors[mood] || '#6B7280';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMoodTags = (mood) => {
    if (!mood) return null;
    
    const moods = mood.split(', ');
    
    return (
      <View style={styles.moodTagsContainer}>
        {moods.map((singleMood, index) => (
          <View 
            key={index}
            style={[
              styles.moodTag, 
              { 
                backgroundColor: getMoodColor(singleMood),
                marginRight: index < moods.length - 1 ? 8 : 0
              }
            ]}
          >
            <Text style={styles.moodTagText}>{singleMood}</Text>
          </View>
        ))}
      </View>
    );
  };

  const generateAnalysis = async () => {
    if (!dream || !dream.text) return;
    
    setLoading(true);
    try {
      // Get dream history for context
      const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      const analysisText = await analyzeDream(dream.text, dreams);
      
      // Update the dream with analysis
      const updatedDream = { ...dream, analysis: analysisText };
      setDream(updatedDream);
      
      // Save to storage with sorting by timestamp (newest first)
      const updatedDreams = dreams.map(d => d.id === dream.id ? updatedDream : d);
      const sortedDreams = sortDreamsByTimestamp(updatedDreams);
      await AsyncStorage.setItem('dreams', JSON.stringify(sortedDreams));
      
      // Scroll to analysis
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
    } catch (err) {
      console.error('Failed to get dream analysis:', err);
      Alert.alert('Error', 'Failed to analyze dream.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading dream...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ReAnimated.View entering={FadeIn.duration(400).delay(100)} style={{ flex: 1 }}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Header 
            icon={Eye}
            title="Dream Details"
            backIcon={ArrowLeft}
            onBackPress={() => navigation.goBack()}
          />

          {/* Dream Content */}
          <ReAnimated.View entering={FadeInUp.delay(200).duration(800)} style={styles.contentContainer}>
            {/* Title Section */}
            <ReAnimated.View style={[styles.titleSection, titleStyle]}>
              <Text style={styles.titleLabel}>Dream Title</Text>
              <Text style={styles.title}>{dream.title}</Text>
            </ReAnimated.View>

            {/* Dream Text */}
            <ReAnimated.View style={[styles.textSection, textStyle]}>
              <Text style={styles.textLabel}>Dream Description</Text>
              <Text style={styles.text}>{dream.text}</Text>
            </ReAnimated.View>

            {/* Metadata */}
            <ReAnimated.View style={[styles.metadataSection, metadataStyle]}>
              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <Tag size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.metadataContent}>
                    <Text style={styles.metadataLabel}>Mood</Text>
                    {renderMoodTags(dream.mood)}
                  </View>
                </View>

                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <Calendar size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.metadataContent}>
                    <Text style={styles.metadataLabel}>Date</Text>
                    <Text style={styles.metadataValue}>{formatDate(dream.timestamp)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <Clock size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.metadataContent}>
                    <Text style={styles.metadataLabel}>Time</Text>
                    <Text style={styles.metadataValue}>{formatTime(dream.timestamp)}</Text>
                  </View>
                </View>

                <View style={styles.metadataItem}>
                  <View style={styles.metadataIcon}>
                    <Hash size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.metadataContent}>
                    <Text style={styles.metadataLabel}>ID</Text>
                    <Text style={styles.metadataValue}>#{dream.id}</Text>
                  </View>
                </View>
              </View>
            </ReAnimated.View>
          </ReAnimated.View>

          {/* AI Analysis Section */}
          <ReAnimated.View style={[styles.analysisContainer, analysisStyle]}>
            <View style={styles.analysisHeader}>
              <View style={styles.analysisHeaderLeft}>
                <Brain size={20} color="#06D6A0" />
                <Text style={styles.analysisTitle}>AI Analysis</Text>
              </View>
            </View>

            {!dream.analysis ? (
              <View style={styles.analysisContent}>
                <Text style={styles.analysisPlaceholder}>
                  Get AI-powered insights about your dream by generating an analysis.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
                  onPress={generateAnalysis}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <SimpleAnimatedThinking />
                  ) : (
                    <>
                      <Brain size={14} color="#FFFFFF" />
                      <Text style={styles.analyzeButtonText}>Generate Analysis</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.analysisText}>{dream.analysis}</Text>
            )}
          </ReAnimated.View>
        </ScrollView>
      </ReAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
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
  titleSection: {
    marginBottom: 24,
  },
  titleLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  textSection: {
    marginBottom: 24,
  },
  textLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  metadataSection: {
    gap: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metadataItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metadataIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metadataValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  moodTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  analysisContainer: {
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
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analysisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#06D6A0',
    shadowColor: '#06D6A0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'flex-start',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  analysisText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  analysisPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  analysisContent: {
    gap: 16,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
});
