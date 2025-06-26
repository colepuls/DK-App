/**
 * Dream Journal App - Main Application Component
 * 
 * This is the root component of the Dream Journal application, a React Native app
 * that allows users to record, analyze, and track their dreams with AI assistance.
 * 
 * Key Features:
 * - Custom dark theme with purple accent colors
 * - Bottom tab navigation with animated transitions
 * - Stack navigation for dream viewing
 * - Gesture handling for smooth interactions
 * - Beautiful animated splash screen
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

import React, { useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Moon, PenTool, MessageCircle, BarChart3 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight, FadeIn } from 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Home from './screens/Home';
import DreamInput from './screens/Create';
import AIChat from './screens/Help';
import DreamView from './screens/DreamViewScreen';
import Stats from './screens/Stats';
import SplashScreen from './components/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Custom dark theme configuration for the app
 * Uses a sophisticated color palette with purple accents and dark backgrounds
 * for optimal readability and modern aesthetics
 */
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A0A0A',        // Deep black background
    text: '#FFFFFF',              // Pure white text
    card: '#1A1A1A',              // Dark card backgrounds
    border: '#2A2A2A',            // Subtle borders
    primary: '#8B5CF6',           // Main purple accent
    secondary: '#A855F7',         // Secondary purple
    accent: '#06D6A0',            // Teal accent for highlights
    success: '#10B981',           // Green for success states
    warning: '#F59E0B',           // Orange for warnings
    error: '#EF4444',             // Red for errors
    notification: '#3B82F6',      // Blue for notifications
  },
};

/**
 * Custom Tab Bar Component
 * 
 * Creates a floating tab bar with smooth animations and visual feedback.
 * Each tab has an icon that changes color and size based on focus state.
 * 
 * @param {Object} state - Current navigation state
 * @param {Object} descriptors - Tab descriptors with options
 * @param {Object} navigation - Navigation object
 * @returns {JSX.Element} Custom tab bar component
 */
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Determine tab label - prioritize tabBarLabel, then title, then route name
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          /**
           * Handle tab press with proper navigation events
           * Prevents default behavior if already focused or event is prevented
           */
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          /**
           * Handle long press for accessibility and additional actions
           */
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          /**
           * Get appropriate icon for each tab with dynamic sizing and coloring
           * Icons are slightly larger when focused for better visual feedback
           */
          const getIcon = () => {
            const iconSize = isFocused ? 18 : 16;
            const iconColor = isFocused ? '#8B5CF6' : '#6B7280';
            
            switch (route.name) {
              case 'Home':
                return <Moon size={iconSize} color={iconColor} />;
              case 'Create':
                return <PenTool size={iconSize} color={iconColor} />;
              case 'Help':
                return <MessageCircle size={iconSize} color={iconColor} />;
              case 'Stats':
                return <BarChart3 size={iconSize} color={iconColor} />;
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.tabContent,
                  isFocused && styles.tabContentActive
                ]}
              >
                <View style={styles.iconContainer}>
                  {getIcon()}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Tab Navigator Component
 * 
 * Sets up the bottom tab navigation with custom styling and animations.
 * Each tab represents a main section of the app: Journal, Create, Stats, and Assistant.
 * 
 * @returns {JSX.Element} Tab navigator with all main screens
 */
function TabNavigator() {
  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerStyle: { 
          backgroundColor: '#0A0A0A',
          borderBottomWidth: 1,
          borderBottomColor: '#2A2A2A',
          elevation: 0,
          shadowOpacity: 0,
        }, 
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      {/* Home/Journal Tab - Main dream list and recent entries */}
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ 
          title: 'Dream Journal',
          headerShown: false,
          tabBarLabel: 'Journal',
        }} 
      />
      
      {/* Create Tab - New dream entry with AI assistance */}
      <Tab.Screen 
        name="Create" 
        component={DreamInput} 
        options={{ 
          title: 'New Dream',
          headerShown: false,
          tabBarLabel: 'Create',
        }} 
      />
      
      {/* Stats Tab - Dream analytics and insights */}
      <Tab.Screen 
        name="Stats" 
        component={Stats} 
        options={{ 
          title: 'Dream Statistics',
          headerShown: false,
          tabBarLabel: 'Stats',
        }} 
      />
      
      {/* Help Tab - AI assistant for dream interpretation */}
      <Tab.Screen 
        name="Help" 
        component={AIChat} 
        options={{ 
          title: 'AI Assistant',
          headerShown: false,
          tabBarLabel: 'Assistant',
        }} 
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Component
 * 
 * Root component that wraps the entire application with necessary providers
 * and sets up the navigation structure. Uses GestureHandlerRootView for
 * smooth gesture interactions throughout the app. Includes a beautiful
 * animated splash screen that displays on app launch.
 * 
 * @returns {JSX.Element} Complete app with navigation and theming
 */
export default function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const handleSplashFinish = () => {
    setShowSplashScreen(false);
  };

  if (showSplashScreen) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#0A0A0A" />
        <SplashScreen onFinish={handleSplashFinish} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" backgroundColor="#0A0A0A" />
        <Stack.Navigator
          screenOptions={{
            animation: 'fade',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          {/* Main tab navigator as the root screen */}
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          
          {/* Dream view screen for detailed dream reading */}
          <Stack.Screen 
            name="View" 
            component={DreamView} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

/**
 * Styles for the custom tab bar and navigation components
 * Uses a modern floating design with subtle shadows and smooth transitions
 */
const styles = StyleSheet.create({
  // Container for the floating tab bar
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },
  
  // Main tab bar styling with dark theme and rounded corners
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  
  // Individual tab button styling
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 1,
  },
  
  // Tab content container with centered alignment
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 12,
    minWidth: 36,
  },
  
  // Active tab styling with subtle glow effect
  tabContentActive: {
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Icon container for proper positioning
  iconContainer: {
    position: 'relative',
  },
  
  // Tab label styling for accessibility
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Active tab label styling
  tabLabelActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
