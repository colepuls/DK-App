import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './screens/Home';
import DreamInput from './screens/Create';
import AIChat from './screens/Help';
import DreamView from './screens/View';

const Stack = createStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',
    text: '#fff',
    card: '#111',
    border: '#333',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Create" component={DreamInput} />
        <Stack.Screen name="Help" component={AIChat} />
        <Stack.Screen name="View" component={DreamView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
