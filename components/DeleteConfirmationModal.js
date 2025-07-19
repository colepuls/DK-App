import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function DeleteConfirmationModal({ visible, dreamTitle, onConfirm, onCancel }) {
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
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
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onCancel}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Trash2 size={48} color="#EF4444" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Delete Dream?</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to delete "{dreamTitle}"? This action cannot be undone.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
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
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 