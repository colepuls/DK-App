import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Stats from '../screens/Stats';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  BarChart: () => null,
  PieChart: () => null,
  LineChart: () => null,
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  BarChart3: () => null,
  PieChart: () => null,
  TrendingUp: () => null,
  Moon: () => null,
  Calendar: () => null,
  Heart: () => null,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

describe('Stats Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stats />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Dream Statistics')).toBeTruthy();
    });
  });

  it('shows empty state when no dreams exist', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stats />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('No Dreams Yet')).toBeTruthy();
      expect(getByText('Start recording your dreams to see beautiful statistics and insights!')).toBeTruthy();
    });
  });

  it('displays correct statistics when dreams exist', async () => {
    const mockDreams = [
      {
        id: 1,
        title: 'Test Dream 1',
        text: 'This is a test dream with some content',
        mood: 'Joyful',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Test Dream 2',
        text: 'Another test dream',
        mood: 'Sad',
        timestamp: new Date().toISOString()
      }
    ];

    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDreams));

    const { getByText } = render(
      <NavigationContainer>
        <Stats />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('2')).toBeTruthy(); // Total dreams
    });
  });
}); 