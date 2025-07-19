import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CheckCircle, X, Heart, Frown, Meh, Zap, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

export default function EditSuccessModal({ visible, mood, onClose }) {
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
              <MoodIcon size={14} color="#FFFFFF" />
              <Text style={styles.moodText}>{singleMood}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View entering={FadeIn.duration(300)} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <CheckCircle size={48} color="#10B981" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.successTitle}>Dream Updated!</Text>
              <Text style={styles.successSubtitle}>
                Your dream has been successfully updated in your journal.
              </Text>
            </View>

            <View style={styles.moodContainer}>
              <Text style={styles.moodLabel}>Updated Mood</Text>
              {renderMoodTags(mood)}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  moodLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonContainer: {
    width: '100%',
  },
  doneButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
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
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 