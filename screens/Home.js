/**
 * Home Screen - Dream Journal Main View
 * 
 * This is the primary screen of the Dream Journal app where users can view,
 * search, filter, and manage their recorded dreams. Features include:
 * 
 * - Swipe navigation between tabs (left/right gestures)
 * - Search functionality with real-time filtering
 * - Mood-based filtering system
 * - Smooth animations and transitions
 * - Dream editing and deletion capabilities
 * - Empty state handling
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Moon, Trash2, Edit3, Plus } from 'lucide-react-native';
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
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import DreamCard from '../components/Card';
import EditDreamModal from '../components/EditDreamModal';
import Header from '../components/Header';

/**
 * Home Screen Component
 * 
 * Main screen that displays the user's dream journal with search, filter,
 * and management capabilities. Includes gesture-based navigation and
 * smooth animations for enhanced user experience.
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 * @returns {JSX.Element} Home screen with dream list and controls
 */
export default function Home({ navigation }) {
  // Core state management for dreams and UI
  const [dreams, setDreams] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');

  // Swipe navigation configuration
  const screenWidth = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = screenWidth * 0.3; // 30% of screen width triggers navigation
  
  // Animation shared values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Staggered animation values for progressive UI reveal
  const searchOpacity = useSharedValue(0);
  const filterOpacity = useSharedValue(0);
  const emptyStateOpacity = useSharedValue(0);
  const dreamListOpacity = useSharedValue(0);

  /**
   * Gesture handler for swipe navigation between tabs
   * Detects horizontal swipes and navigates to adjacent screens
   * with smooth spring animations and velocity-based triggers
   */
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - navigate to Help/Assistant tab
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Help');
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - navigate to Create tab
        translateX.value = withSpring(-screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Create');
      } else {
        // Reset to original position if swipe doesn't meet threshold
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    },
    onFail: () => {
      // Reset values if gesture fails or is interrupted
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    },
  });

  /**
   * Animated style for the main container with transform and opacity
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }
      ],
      opacity: opacity.value,
    };
  });

  // Individual animated styles for staggered UI elements
  const searchStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
  }));

  const filterStyle = useAnimatedStyle(() => ({
    opacity: filterOpacity.value,
  }));

  const emptyStateStyle = useAnimatedStyle(() => ({
    opacity: emptyStateOpacity.value,
  }));

  const dreamListStyle = useAnimatedStyle(() => ({
    opacity: dreamListOpacity.value,
  }));

  // Predefined mood options for consistent categorization
  const allAvailableMoods = ['Joyful', 'Sad', 'Neutral', 'Strange', 'Scary'];

  // Extract unique moods from existing dreams for backward compatibility
  const uniqueMoodsFromDreams = [...new Set(dreams.flatMap(d => {
    const moods = d.mood ? d.mood.split(', ') : ['Neutral'];
    return moods.filter(mood => mood !== 'unknown');
  }))];

  // Combine predefined moods with any custom moods from existing dreams
  const allMoods = [...new Set([...allAvailableMoods, ...uniqueMoodsFromDreams])];

  /**
   * Filter dreams based on search query and selected mood
   * Supports both title and content text search with case-insensitive matching
   */
  const filtered = dreams.filter(d => {
    const matchesQuery = d.title.toLowerCase().includes(query.toLowerCase()) ||
                        d.text.toLowerCase().includes(query.toLowerCase());
    
    const dreamMoods = d.mood ? d.mood.split(', ') : ['Neutral'];
    const matchesMood = selectedMood === 'all' || dreamMoods.includes(selectedMood);
    
    return matchesQuery && matchesMood;
  });

  /**
   * Reset and trigger animations when screen comes into focus
   * Creates a staggered animation sequence for smooth UI reveal
   */
  useFocusEffect(
    useCallback(() => {
      // Reset main animation values
      translateX.value = 0;
      opacity.value = 1;

      // Reset staggered animation values
      searchOpacity.value = 0;
      filterOpacity.value = 0;
      emptyStateOpacity.value = 0;
      dreamListOpacity.value = 0;

      // Trigger staggered animations with cascading timing
      searchOpacity.value = withTiming(1, { duration: 300 }, () => {
        filterOpacity.value = withTiming(1, { duration: 300 }, () => {
          if (filtered.length === 0 || dreams.length === 0) {
            emptyStateOpacity.value = withTiming(1, { duration: 300 });
          } else {
            dreamListOpacity.value = withTiming(1, { duration: 300 });
          }
        });
      });
    }, [dreams.length, filtered.length])
  );

  /**
   * Sort dreams by timestamp in descending order (newest first)
   * Handles cases where timestamp might be missing
   * 
   * @param {Array} dreamsArray - Array of dream objects to sort
   * @returns {Array} Sorted array of dreams
   */
  const sortDreamsByTimestamp = (dreamsArray) => {
    return dreamsArray.sort((a, b) => {
      const timestampA = new Date(a.timestamp || 0);
      const timestampB = new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
  };

  /**
   * Load dreams from AsyncStorage and sort them by timestamp
   * Called on component mount and screen focus
   */
  const loadDreams = async () => {
    const saved = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
    // Sort dreams by timestamp in descending order (newest first)
    const sortedDreams = sortDreamsByTimestamp(saved);
    setDreams(sortedDreams);
  };

  // Load dreams when component mounts
  useEffect(() => {
    loadDreams();
  }, []);

  // Reload dreams whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [])
  );

  /**
   * Delete a dream from storage and update state
   * Maintains sorted order after deletion
   * 
   * @param {string} id - Unique identifier of the dream to delete
   */
  const handleDelete = async (id) => {
    const updated = dreams.filter(d => d.id !== id);
    // Sort dreams by timestamp in descending order (newest first)
    const sortedUpdated = sortDreamsByTimestamp(updated);
    setDreams(sortedUpdated);
    await AsyncStorage.setItem('dreams', JSON.stringify(sortedUpdated));
  };

  /**
   * Open edit modal for a specific dream
   * Pre-populates the modal with current dream title
   * 
   * @param {string} id - Unique identifier of the dream to edit
   */
  const handleEdit = (id) => {
    const dream = dreams.find(d => d.id === id);
    if (!dream) return;
    setCurrentId(id);
    setNewTitle(dream.title);
    setShowModal(true);
  };

  /**
   * Save edited dream title and update storage
   * Validates input and maintains sorted order
   */
  const saveEdit = async () => {
    if (!newTitle.trim()) return;
    const updated = dreams.map(d =>
      d.id === currentId ? { ...d, title: newTitle.trim() } : d
    );
    // Sort dreams by timestamp in descending order (newest first)
    const sortedUpdated = sortDreamsByTimestamp(updated);
    setDreams(sortedUpdated);
    await AsyncStorage.setItem('dreams', JSON.stringify(sortedUpdated));
    setShowModal(false);
    setNewTitle('');
    setCurrentId(null);
  };

  /**
   * Get color for mood indicators based on mood type
   * Provides consistent color coding across the app
   * 
   * @param {string} mood - The mood to get color for
   * @returns {string} Hex color code for the mood
   */
  const getMoodColor = (mood) => {
    const colors = {
      Joyful: '#10B981',    // Green for positive emotions
      Sad: '#3B82F6',       // Blue for melancholic feelings
      Neutral: '#6B7280',   // Gray for neutral states
      Strange: '#F59E0B',   // Orange for unusual dreams
      Scary: '#EF4444',     // Red for frightening content
    };
    return colors[mood] || '#6B7280'; // Default to gray if mood not found
  };

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      activeOffsetX={[-6, 6]}        // Minimum horizontal movement to activate gesture
      failOffsetY={[-25, 25]}        // Vertical movement threshold to fail gesture
      simultaneousHandlers
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={{ flex: 1 }}>
          {/* Header with navigation and action button */}
          <Header 
            icon={Moon}
            title="Dream Journal"
            actionIcon={Plus}
            onActionPress={() => navigation.navigate('Create')}
          />

          {/* Search input with real-time filtering */}
          <Animated.View style={[styles.searchContainer, searchStyle]}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search dreams..."
              placeholderTextColor="#6B7280"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              keyboardAppearance="dark"
            />
          </Animated.View>

          {/* Mood filter buttons with dynamic styling */}
          <Animated.View style={[styles.filterContainer, filterStyle]}>
            <View style={styles.filterScrollContainer}>
              {/* "All" filter button - shows all dreams regardless of mood */}
              <TouchableOpacity
                style={[styles.moodButton, selectedMood === 'all' && styles.moodButtonActive]}
                onPress={() => setSelectedMood('all')}
              >
                <Text style={[styles.moodButtonText, selectedMood === 'all' && styles.moodButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {/* Dynamic mood filter buttons with color-coded styling */}
              {allMoods.map((mood, index) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton, 
                    selectedMood === mood && styles.moodButtonActive,
                    { 
                      borderColor: selectedMood === mood ? getMoodColor(mood) : 'rgba(156, 163, 175, 0.3)',
                      backgroundColor: selectedMood === mood ? `${getMoodColor(mood)}15` : '#1A1A1A'
                    }
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={[
                    styles.moodButtonText, 
                    selectedMood === mood && styles.moodButtonTextActive,
                    { color: selectedMood === mood ? getMoodColor(mood) : '#9CA3AF' }
                  ]}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Empty state for when search/filter returns no results */}
          {filtered.length === 0 && dreams.length > 0 && (
            <Animated.View style={[styles.emptyState, emptyStateStyle]}>
              <Text style={styles.emptyStateText}>
                No dreams match your search criteria
              </Text>
            </Animated.View>
          )}

          {/* Welcome empty state for new users */}
          {dreams.length === 0 && (
            <Animated.View style={[styles.emptyState, emptyStateStyle]}>
              <Moon size={48} color="#8B5CF6" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>Welcome to Your Dream Journal</Text>
              <Text style={styles.emptyStateText}>
                Start by creating your first dream entry. Tap the + button to begin your journey!
              </Text>
            </Animated.View>
          )}

          {/* Scrollable list of dream cards */}
          <Animated.View style={[styles.dreamList, dreamListStyle]}>
            <FlatList
              data={filtered}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item, index }) => (
                <DreamCard dream={item} onEdit={handleEdit} onDelete={handleDelete} navigation={navigation} />
              )}
              contentContainerStyle={styles.contentContainerStyle}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </Animated.View>

        {/* Edit dream modal for title modifications */}
        <EditDreamModal
          visible={showModal}
          titleValue={newTitle}
          onTitleChange={setNewTitle}
          onSave={saveEdit}
          onCancel={() => setShowModal(false)}
        />
      </Animated.View>
    </PanGestureHandler>
  );
}

/**
 * Styles for the Home screen components
 * Uses a dark theme with purple accents and smooth transitions
 */
const styles = StyleSheet.create({
  // Main container with dark background
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  
  // Content container with bottom padding for tab bar
  contentContainerStyle: {
    paddingBottom: 40,
  },
  
  // Search bar styling with dark theme
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0,
  },
  
  // Search icon positioning
  searchIcon: {
    marginRight: 10,
  },
  
  // Search input text styling
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  
  // Filter container for mood buttons
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  moodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 3,
  },
  moodButtonActive: {
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  moodButtonText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  moodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dreamList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
