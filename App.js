import React, { useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { House, BadgePlus, MessageCircleQuestion, BarChart3 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight, FadeIn } from 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Home from './screens/Home';
import DreamInput from './screens/Create';
import AIChat from './screens/Help';
import DreamView from './screens/View';
import Stats from './screens/Stats';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A0A0A',
    text: '#FFFFFF',
    card: '#1A1A1A',
    border: '#2A2A2A',
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#06D6A0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    notification: '#3B82F6',
  },
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = () => {
            const iconSize = isFocused ? 18 : 16;
            const iconColor = isFocused ? '#8B5CF6' : '#6B7280';
            
            switch (route.name) {
              case 'Home':
                return <House size={iconSize} color={iconColor} />;
              case 'Create':
                return <BadgePlus size={iconSize} color={iconColor} />;
              case 'Help':
                return <MessageCircleQuestion size={iconSize} color={iconColor} />;
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

// Tab Navigator Component
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
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ 
          title: 'Dream Journal',
          headerShown: false,
          tabBarLabel: 'Journal',
        }} 
      />
      <Tab.Screen 
        name="Create" 
        component={DreamInput} 
        options={{ 
          title: 'New Dream',
          headerShown: false,
          tabBarLabel: 'Create',
        }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={Stats} 
        options={{ 
          title: 'Dream Statistics',
          headerShown: false,
          tabBarLabel: 'Stats',
        }} 
      />
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

export default function App() {
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
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },
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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 12,
    minWidth: 36,
  },
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
  iconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
