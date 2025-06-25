import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EllipsisVertical, Pencil, Trash, Clock, Brain, Heart, Frown, Meh, Zap, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';

export default function DreamCard({ dream, onEdit, onDelete, navigation }) {
  const [showMenu, setShowMenu] = useState(false);

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

  const getMoodIcon = (mood) => {
    const icons = {
      Joyful: Heart,
      Sad: Frown,
      Neutral: Meh,
      Strange: Zap,
      Scary: AlertTriangle,
    };
    return icons[mood] || Meh;
  };

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

  const getDreamPreview = (text) => {
    const maxLength = 120;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    toggleMenu();
    onEdit(dream.id);
  };

  const handleDelete = () => {
    toggleMenu();
    onDelete(dream.id);
  };

  const handleAnalysis = () => {
    navigation.navigate('View', { id: dream.id, showAnalysis: true });
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('View', { id: dream.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>{dream.title}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.analysisButton}
                onPress={handleAnalysis}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Brain size={16} color="#06D6A0" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={toggleMenu}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <EllipsisVertical size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.preview} numberOfLines={3}>
            {getDreamPreview(dream.text)}
          </Text>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {renderMoodTags(dream.mood)}
            </View>

            {dream.timestamp && (
              <View style={styles.dateContainer}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.dateText}>{formatDate(dream.timestamp)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {showMenu && (
        <Animated.View 
          entering={SlideInRight.duration(200)} 
          exiting={SlideOutRight.duration(200)}
          style={styles.menu}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleEdit}
            >
              <Pencil size={16} color="#8B5CF6" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDelete}
            >
              <Trash size={16} color="#EF4444" />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
    position: 'relative',
  },
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
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  menuContent: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#3A3A3A',
    marginVertical: 4,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  menuButton: {
    padding: 4,
    borderRadius: 8,
  },
});
