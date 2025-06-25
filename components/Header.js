import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ 
  icon: Icon, 
  title, 
  actionIcon: ActionIcon, 
  onActionPress,
  backIcon: BackIcon,
  onBackPress,
  style 
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          {BackIcon && onBackPress && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <BackIcon size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.iconContainer}>
            <Icon size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {ActionIcon && onActionPress && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onActionPress}
            activeOpacity={0.7}
          >
            <ActionIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
}); 