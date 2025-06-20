import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './screens/Home';
import DreamInput from './screens/Create';
import AIChat from './screens/Help';
import DreamView from './screens/View';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Create" component={DreamInput} />
        <Stack.Screen name="Help" component={AIChat} />
        <Stack.Screen name="View" component={DreamView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}