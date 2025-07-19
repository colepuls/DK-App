import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { AlertCircle, X, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ErrorModal({ visible, title, message, onRetry, onClose }) {
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
                <AlertCircle size={48} color="#EF4444" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.errorTitle}>{title}</Text>
              <Text style={styles.errorMessage}>
                {message}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {onRetry && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={onRetry}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Close</Text>
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
    backgroundColor: '#EF444420',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 