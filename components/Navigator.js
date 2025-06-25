import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { House, BadgePlus, MessageCircleQuestion, Moon, BarChart3 } from 'lucide-react-native';

export default function Navigator() {
  const navigation = useNavigation();
  const route = useRoute();

  const getIconColor = (routeName) => {
    return route.name === routeName ? '#FFFFFF' : '#6B7280';
  };

  const getIconSize = (routeName) => {
    return route.name === routeName ? 22 : 18;
  };

  const handlePress = (routeName) => {
    if (route.name !== routeName) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.navContainer}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navGradient}
      >
        <View style={styles.nav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handlePress('Home')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              route.name === 'Home' && styles.activeIconContainer
            ]}>
              <House 
                size={getIconSize('Home')} 
                color={getIconColor('Home')} 
              />
            </View>
            <Text 
              style={[
                styles.navLabel,
                route.name === 'Home' && styles.activeNavLabel
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handlePress('Create')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              route.name === 'Create' && styles.activeIconContainer
            ]}>
              <BadgePlus 
                size={getIconSize('Create')} 
                color={getIconColor('Create')} 
              />
            </View>
            <Text 
              style={[
                styles.navLabel,
                route.name === 'Create' && styles.activeNavLabel
              ]}
            >
              New Dream
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handlePress('Help')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              route.name === 'Help' && styles.activeIconContainer
            ]}>
              <MessageCircleQuestion 
                size={getIconSize('Help')} 
                color={getIconColor('Help')} 
              />
            </View>
            <Text 
              style={[
                styles.navLabel,
                route.name === 'Help' && styles.activeNavLabel
              ]}
            >
              AI Help
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handlePress('Stats')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              route.name === 'Stats' && styles.activeIconContainer
            ]}>
              <BarChart3 
                size={getIconSize('Stats')} 
                color={getIconColor('Stats')} 
              />
            </View>
            <Text 
              style={[
                styles.navLabel,
                route.name === 'Stats' && styles.activeNavLabel
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  navGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: 8,
    paddingBottom: 12, // Extra padding for safe area
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  activeIconContainer: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
