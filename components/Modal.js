import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Keyboard, Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Edit3, Save } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function TitleModal({ visible, titleValue, onTitleChange, onSave, onCancel }) {
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
    };
  });

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });

  const handleSave = () => {
    if (titleValue.trim()) {
      onSave();
    }
  };

  // Calculate modal position to ensure it's always visible above keyboard
  const getModalPosition = () => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      // When keyboard is visible, position modal in the top portion of available space
      const availableHeight = height - keyboardHeight;
      const modalHeight = 320; // Approximate modal height
      const topPosition = Math.max(40, (availableHeight - modalHeight) / 2);
      return { top: topPosition };
    }
    // When keyboard is hidden, center the modal
    return { top: '50%', marginTop: -160 };
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, overlayAnimatedStyle]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={onCancel}
          activeOpacity={1}
        />
        
        <Animated.View 
          entering={SlideInUp.springify()}
          exiting={SlideOutDown.springify()}
          style={[
            styles.modalContainer, 
            modalAnimatedStyle,
            getModalPosition()
          ]}
        >
          <LinearGradient
            colors={['#1F2937', '#374151']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Edit3 size={24} color="#6366F1" />
                <Text style={styles.heading}>Edit Dream Title</Text>
              </View>
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
                value={titleValue}
                onChangeText={onTitleChange}
                placeholder="Enter a meaningful title..."
                placeholderTextColor="#6B7280"
                style={styles.input}
                autoFocus
                multiline
                maxLength={100}
                returnKeyType="done"
                blurOnSubmit={false}
                testID="title-input"
                keyboardAppearance="dark"
              />
              <Text style={styles.characterCount}>
                {titleValue.length}/100
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
                testID="cancel-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  !titleValue.trim() && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={!titleValue.trim()}
                testID="save-button"
              >
                <LinearGradient
                  colors={titleValue.trim() ? ['#6366F1', '#8B5CF6'] : ['#4B5563', '#6B7280']}
                  style={styles.saveButtonGradient}
                >
                  <Save size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    zIndex: 10000,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -width * 0.45 }],
  },
  modalGradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4B5563',
    backgroundColor: '#1F2937',
    padding: 16,
    color: '#FFFFFF',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
