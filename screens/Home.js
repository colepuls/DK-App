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

export default function Home({ navigation }) {
  const [dreams, setDreams] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');

  // Swipe navigation setup
  const screenWidth = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = screenWidth * 0.3;
  
  // Animation values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation values for staggered elements
  const searchOpacity = useSharedValue(0);
  const filterOpacity = useSharedValue(0);
  const emptyStateOpacity = useSharedValue(0);
  const dreamListOpacity = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - navigate to Help
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Help');
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - navigate to Create
        translateX.value = withSpring(-screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Create');
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

  // Define all available mood options
  const allAvailableMoods = ['Joyful', 'Sad', 'Neutral', 'Strange', 'Scary'];

  // Get unique moods from existing dreams (for backward compatibility)
  const uniqueMoodsFromDreams = [...new Set(dreams.flatMap(d => {
    const moods = d.mood ? d.mood.split(', ') : ['Neutral'];
    return moods.filter(mood => mood !== 'unknown');
  }))];

  // Combine all available moods with any custom moods from dreams
  const allMoods = [...new Set([...allAvailableMoods, ...uniqueMoodsFromDreams])];

  const filtered = dreams.filter(d => {
    const matchesQuery = d.title.toLowerCase().includes(query.toLowerCase()) ||
                        d.text.toLowerCase().includes(query.toLowerCase());
    
    const dreamMoods = d.mood ? d.mood.split(', ') : ['Neutral'];
    const matchesMood = selectedMood === 'all' || dreamMoods.includes(selectedMood);
    
    return matchesQuery && matchesMood;
  });

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset translateX to 0
      translateX.value = 0;
      // Ensure opacity is 1 when screen comes into focus
      opacity.value = 1;

      // Reset staggered animation values
      searchOpacity.value = 0;
      filterOpacity.value = 0;
      emptyStateOpacity.value = 0;
      dreamListOpacity.value = 0;

      // Trigger staggered animations with faster timing
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

  // Helper function to sort dreams by timestamp (newest first)
  const sortDreamsByTimestamp = (dreamsArray) => {
    return dreamsArray.sort((a, b) => {
      const timestampA = new Date(a.timestamp || 0);
      const timestampB = new Date(b.timestamp || 0);
      return timestampB - timestampA;
    });
  };

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

  const handleDelete = async (id) => {
    const updated = dreams.filter(d => d.id !== id);
    // Sort dreams by timestamp in descending order (newest first)
    const sortedUpdated = sortDreamsByTimestamp(updated);
    setDreams(sortedUpdated);
    await AsyncStorage.setItem('dreams', JSON.stringify(sortedUpdated));
  };

  const handleEdit = (id) => {
    const dream = dreams.find(d => d.id === id);
    if (!dream) return;
    setCurrentId(id);
    setNewTitle(dream.title);
    setShowModal(true);
  };

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

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      activeOffsetX={[-6, 6]}
      failOffsetY={[-25, 25]}
      simultaneousHandlers
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={{ flex: 1 }}>
          {/* Header */}
          <Header 
            icon={Moon}
            title="Dream Journal"
            actionIcon={Plus}
            onActionPress={() => navigation.navigate('Create')}
          />

          {/* Search Bar */}
          <Animated.View style={[styles.searchContainer, searchStyle]}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              placeholder="Search dreams..."
              placeholderTextColor="#6B7280"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </Animated.View>

          {/* Mood Filter */}
          <Animated.View style={[styles.filterContainer, filterStyle]}>
            <View style={styles.filterScrollContainer}>
              <TouchableOpacity
                style={[styles.moodButton, selectedMood === 'all' && styles.moodButtonActive]}
                onPress={() => setSelectedMood('all')}
              >
                <Text style={[styles.moodButtonText, selectedMood === 'all' && styles.moodButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              
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

          {/* Empty States */}
          {filtered.length === 0 && dreams.length > 0 && (
            <Animated.View style={[styles.emptyState, emptyStateStyle]}>
              <Text style={styles.emptyStateText}>
                No dreams match your search criteria
              </Text>
            </Animated.View>
          )}

          {dreams.length === 0 && (
            <Animated.View style={[styles.emptyState, emptyStateStyle]}>
              <Moon size={48} color="#8B5CF6" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>Welcome to Your Dream Journal</Text>
              <Text style={styles.emptyStateText}>
                Start by creating your first dream entry. Tap the + button to begin your journey!
              </Text>
            </Animated.View>
          )}

          {/* Dreams List */}
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  contentContainerStyle: {
    paddingBottom: 40,
  },
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
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
