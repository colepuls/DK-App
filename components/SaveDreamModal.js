import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Save, Heart, Frown, Meh, Zap, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import SpeechToText from './SpeechToText';

export default function SaveDreamModal({ visible, titleValue, onTitleChange, onSave, onCancel, mood }) {
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

  const renderMoodTag = (mood) => {
    if (!mood) return null;
    
    const MoodIcon = getMoodIcon(mood);
    
    return (
      <View style={styles.moodContainer}>
        <View 
          style={[
            styles.moodTag, 
            { backgroundColor: getMoodColor(mood) }
          ]}
        >
          <MoodIcon size={14} color="#FFFFFF" />
          <Text style={styles.moodText}>{mood}</Text>
        </View>
      </View>
    );
  };

  const handleSpeechText = (text) => {
    // Set the speech text as the title
    onTitleChange(text);
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={onCancel}
            activeOpacity={1}
          />
          
          <Animated.View entering={FadeIn.duration(300)} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.heading}>Save Your Dream</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onCancel}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="close-button"
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Dream Title</Text>
                <TextInput
                  style={styles.input}
                  value={titleValue}
                  onChangeText={onTitleChange}
                  placeholder="Enter a title for your dream..."
                  placeholderTextColor="#6B7280"
                  autoFocus={true}
                  testID="title-input"
                />
                
                {/* Speech to Text Component */}
                <SpeechToText 
                  onTextReceived={handleSpeechText}
                  disabled={false}
                  placeholder="Tap to speak the title..."
                />
              </View>

              {mood && (
                <View style={styles.moodSection}>
                  <Text style={styles.label}>Dream Mood</Text>
                  {renderMoodTag(mood)}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={onSave}
                  activeOpacity={0.8}
                  testID="save-button"
                >
                  <Save size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Dream</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  moodSection: {
    marginBottom: 24,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 