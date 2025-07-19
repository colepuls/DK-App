/**
 * Dream Card Component
 * 
 * A reusable card component for displaying dream entries in the journal.
 * Features include mood indicators, timestamp display, preview text,
 * and interactive menu for editing/deleting dreams.
 * 
 * Key Features:
 * - Mood-based color coding and icons
 * - Relative timestamp formatting
 * - Text preview with truncation
 * - Slide-out action menu
 * - Touch interactions for navigation
 * - Smooth animations and transitions
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { EllipsisVertical, Pencil, Trash, Clock, Heart, Frown, Meh, Zap, AlertTriangle } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import DeleteConfirmationModal from './DeleteConfirmationModal';

/**
 * Dream Card Component
 * 
 * Displays a single dream entry with interactive elements and visual indicators.
 * Handles mood display, timestamp formatting, and user interactions.
 * 
 * @param {Object} dream - Dream object containing id, title, text, mood, timestamp
 * @param {Function} onDelete - Callback function for deleting the dream
 * @param {Object} navigation - React Navigation object for screen transitions
 * @returns {JSX.Element} Dream card with interactive elements
 */
export default function DreamCard({ dream, onDelete, navigation }) {
  // State for controlling the action menu visibility
  const [showMenu, setShowMenu] = useState(false);
  // State for controlling the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Animated values for button interactions
  const menuButtonScale = useSharedValue(1);
  const menuButtonRotation = useSharedValue(0);
  const editButtonScale = useSharedValue(1);
  const deleteButtonScale = useSharedValue(1);

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

  /**
   * Get appropriate icon for mood display
   * Uses semantic icons that match the emotional content
   * 
   * @param {string} mood - The mood to get icon for
   * @returns {Component} Lucide React Native icon component
   */
  const getMoodIcon = (mood) => {
    const icons = {
      Joyful: Heart,        // Heart for positive emotions
      Sad: Frown,           // Frown for sad emotions
      Neutral: Meh,         // Meh for neutral emotions
      Strange: Zap,         // Zap for unusual/strange emotions
      Scary: AlertTriangle, // Alert triangle for scary content
    };
    return icons[mood] || Meh; // Default to neutral icon
  };

  /**
   * Format timestamp into human-readable relative time
   * Shows "Just now", "Xh ago", "Yesterday", "X days ago", or full date
   * 
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted relative time string
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
      }
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 2) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * Truncate dream text for preview display
   * Limits text to 120 characters with ellipsis for longer content
   * 
   * @param {string} text - Full dream text content
   * @returns {string} Truncated preview text
   */
  const getDreamPreview = (text) => {
    const maxLength = 120;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Render mood tags with icons and colors
   * Handles multiple moods separated by commas
   * 
   * @param {string} mood - Comma-separated mood string
   * @returns {JSX.Element|null} Mood tag components or null
   */
  const renderMoodTags = (mood) => {
    if (!mood) return null;
    
    const moods = mood.split(', ');
    
    return (
      <View style={styles.moodContainer}>
        {moods.map((singleMood, index) => {
          const MoodIcon = getMoodIcon(singleMood);
          return (
            <View 
              key={index}
              style={[
                styles.moodTag, 
                { 
                  backgroundColor: getMoodColor(singleMood),
                  marginRight: index < moods.length - 1 ? 6 : 0
                }
              ]}
            >
              <MoodIcon size={12} color="#FFFFFF" />
              <Text style={styles.moodText}>{singleMood}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * Close menu with proper animations
   */
  const closeMenu = () => {
    if (showMenu) {
      menuButtonRotation.value = withSpring(0, {
        damping: 15,
        stiffness: 150
      });
      menuButtonScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150
      });
      setShowMenu(false);
    }
  };

  /**
   * Toggle the action menu visibility with animations
   */
  const toggleMenu = () => {
    if (showMenu) {
      closeMenu();
    } else {
      // Opening menu
      menuButtonRotation.value = withSpring(90, {
        damping: 15,
        stiffness: 150
      });
      menuButtonScale.value = withSpring(1.1, {
        damping: 15,
        stiffness: 150
      });
      setShowMenu(true);
    }
  };

  /**
   * Handle edit action - close menu and navigate to edit screen
   */
  const handleEdit = () => {
    editButtonScale.value = withSpring(0.95, { duration: 100 }, () => {
      editButtonScale.value = withSpring(1);
    });
    setTimeout(() => {
      closeMenu();
      navigation.navigate('EditDream', { id: dream.id });
    }, 150);
  };

  /**
   * Handle delete action - close menu and show confirmation modal
   */
  const handleDelete = () => {
    deleteButtonScale.value = withSpring(0.95, { duration: 100 }, () => {
      deleteButtonScale.value = withSpring(1);
    });
    setTimeout(() => {
      closeMenu();
      setShowDeleteModal(true);
    }, 150);
  };

  /**
   * Confirm deletion and call delete callback
   */
  const confirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(dream.id);
  };

  /**
   * Cancel deletion and close modal
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Animated styles
  const menuButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: menuButtonScale.value },
        { rotate: `${menuButtonRotation.value}deg` }
      ],
    };
  });

  const editButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: editButtonScale.value }],
    };
  });

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: deleteButtonScale.value }],
    };
  });



  return (
    <View style={styles.cardContainer}>
      {/* Main card touchable area */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (showMenu) {
            closeMenu();
          } else {
            navigation.navigate('View', { id: dream.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Card header with title and action buttons */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>{dream.title}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Menu toggle button */}
              <Animated.View style={menuButtonAnimatedStyle}>
                <TouchableOpacity 
                  style={[styles.menuButton, showMenu && styles.menuButtonActive]}
                  onPress={toggleMenu}
                  activeOpacity={1}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={[styles.menuButtonInner, showMenu && styles.menuButtonInnerActive]}>
                    <EllipsisVertical size={14} color={showMenu ? "#FFFFFF" : "#9CA3AF"} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Dream text preview */}
          <Text style={styles.preview} numberOfLines={3}>
            {getDreamPreview(dream.text)}
          </Text>

          {/* Card footer with mood tags and timestamp */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {renderMoodTags(dream.mood)}
            </View>

            {/* Timestamp display */}
            {dream.timestamp && (
              <View style={styles.dateContainer}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.dateText}>{formatDate(dream.timestamp)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Slide-out action menu */}
      {showMenu && (
        <Animated.View 
          entering={SlideInRight.duration(300).springify().damping(15).stiffness(150)} 
          exiting={SlideOutRight.duration(200).springify().damping(20)}
          style={styles.menu}
        >
          <View style={styles.menuContent}>
            {/* Edit action */}
            <Animated.View style={editButtonAnimatedStyle}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleEdit}
                activeOpacity={1}
              >
                <Pencil size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </Animated.View>
            {/* Delete action */}
            <Animated.View style={deleteButtonAnimatedStyle}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleDelete}
                activeOpacity={1}
              >
                <Trash size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Overlay to catch clicks outside menu */}
      {showMenu && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.menuOverlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        dreamTitle={dream.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}

/**
 * Styles for the Dream Card component
 * Uses a dark theme with purple accents and smooth transitions
 */
const styles = StyleSheet.create({
  // Container for the entire card with menu positioning
  cardContainer: {
    marginVertical: 8,
    position: 'relative',
  },
  
  // Main card styling with dark theme and shadows
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
    overflow: 'hidden',
  },
  menuContent: {
    padding: 2,
    flexDirection: 'row',
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonInner: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonInnerActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  menuButtonActive: {
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  menuOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
});
