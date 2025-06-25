import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Moon, Calendar, Heart } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';

const screenWidth = Dimensions.get('window').width;

export default function Stats({ navigation }) {
  const [dreams, setDreams] = useState([]);
  const [stats, setStats] = useState({
    totalDreams: 0,
    moodCounts: {},
    mostCommonMood: '',
    averageDreamsPerMonth: 0,
    recentActivity: []
  });

  // Swipe navigation setup
  const SWIPE_THRESHOLD = screenWidth * 0.3;
  
  // Animation values for smooth transitions
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animation values for staggered elements
  const card1Opacity = useSharedValue(0);
  const card2Opacity = useSharedValue(0);
  const card3Opacity = useSharedValue(0);
  const chart1Opacity = useSharedValue(0);
  const chart2Opacity = useSharedValue(0);
  const emptyStateOpacity = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Swipe right - navigate to Create
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Create');
      } else if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
        // Swipe left - navigate to Help
        translateX.value = withSpring(-screenWidth, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(navigation.navigate)('Help');
      } else {
        // Reset to original position
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    },
    onFail: () => {
      // Reset values if gesture fails
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }
      ],
      opacity: opacity.value,
    };
  });

  // Animated styles for staggered elements
  const card1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
  }));

  const card2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
  }));

  const card3Style = useAnimatedStyle(() => ({
    opacity: card3Opacity.value,
  }));

  const chart1Style = useAnimatedStyle(() => ({
    opacity: chart1Opacity.value,
  }));

  const chart2Style = useAnimatedStyle(() => ({
    opacity: chart2Opacity.value,
  }));

  const emptyStateStyle = useAnimatedStyle(() => ({
    opacity: emptyStateOpacity.value,
  }));

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset translateX to 0
      translateX.value = 0;
      // Ensure opacity is 1 when screen comes into focus
      opacity.value = 1;

      // Trigger staggered animations
      card1Opacity.value = 0;
      card2Opacity.value = 0;
      card3Opacity.value = 0;
      chart1Opacity.value = 0;
      chart2Opacity.value = 0;
      emptyStateOpacity.value = 0;

      // Animate cards in sequence with faster timing
      card1Opacity.value = withTiming(1, { duration: 300 }, () => {
        card2Opacity.value = withTiming(1, { duration: 300 }, () => {
          card3Opacity.value = withTiming(1, { duration: 300 }, () => {
            // Animate charts
            chart1Opacity.value = withTiming(1, { duration: 300 }, () => {
              chart2Opacity.value = withTiming(1, { duration: 300 });
            });
          });
        });
      });

      // Animate empty state if needed
      if (stats.totalDreams === 0) {
        emptyStateOpacity.value = withTiming(1, { duration: 300 });
      }
    }, [stats.totalDreams])
  );

  const loadDreams = async () => {
    const saved = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
    setDreams(saved);
    calculateStats(saved);
  };

  useFocusEffect(
    useCallback(() => {
      loadDreams();
    }, [])
  );

  const calculateStats = (dreamsData) => {
    // Mood counts
    const moodCounts = {};
    dreamsData.forEach(dream => {
      const moods = dream.mood ? dream.mood.split(', ') : ['Neutral'];
      moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
    });

    // Most common mood
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'Neutral'
    );

    // Recent activity (last 7 days)
    const now = new Date();
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayDreams = dreamsData.filter(dream => {
        const dreamDate = new Date(dream.timestamp);
        return dreamDate.toDateString() === date.toDateString();
      });
      recentActivity.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayDreams.length
      });
    }

    setStats({
      totalDreams: dreamsData.length,
      moodCounts,
      mostCommonMood,
      averageDreamsPerMonth: Math.round((dreamsData.length / Math.max(1, getMonthsSinceFirstDream(dreamsData))) * 10) / 10,
      recentActivity
    });
  };

  const getMonthsSinceFirstDream = (dreamsData) => {
    if (dreamsData.length === 0) return 1;
    const firstDream = new Date(dreamsData[dreamsData.length - 1].timestamp);
    const now = new Date();
    return Math.max(1, (now.getFullYear() - firstDream.getFullYear()) * 12 + 
      (now.getMonth() - firstDream.getMonth()));
  };

  const getMoodColor = (mood) => {
    const colors = {
      Joyful: '#10B981',
      Sad: '#3B82F6',
      Neutral: '#6B7280',
      Strange: '#F59E0B',
      Scary: '#EF4444',
    };
    return colors[mood] || '#6B7280';
  };

  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#111827',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8B5CF6',
    },
  };

  const pieChartData = Object.entries(stats.moodCounts).map(([mood, count]) => ({
    name: mood,
    population: count,
    color: getMoodColor(mood),
    legendFontColor: '#FFFFFF',
    legendFontSize: 12,
  }));

  const barChartData = {
    labels: stats.recentActivity.map(item => item.date),
    datasets: [{
      data: stats.recentActivity.map(item => item.count)
    }]
  };

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      activeOffsetX={[-6, 6]}
      failOffsetY={[-25, 25]}
      simultaneousHandlers
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={{ flex: 1 }}>
          <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Header 
              icon={BarChart3}
              title="Dream Statistics"
            />

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Animated.View style={[styles.summaryCard, card1Style]}>
                  <LinearGradient
                    colors={['#8B5CF6', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <Moon size={24} color="#FFFFFF" />
                    <Text style={styles.cardNumber}>{stats.totalDreams}</Text>
                    <Text style={styles.cardLabel}>Total Dreams</Text>
                  </LinearGradient>
                </Animated.View>

                <Animated.View style={[styles.summaryCard, card2Style]}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <Heart size={24} color="#FFFFFF" />
                    <Text style={styles.cardNumber}>{stats.mostCommonMood}</Text>
                    <Text style={styles.cardLabel}>Most Common Mood</Text>
                  </LinearGradient>
                </Animated.View>
              </View>

              <Animated.View style={[styles.summaryCard, card3Style]}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <Calendar size={24} color="#FFFFFF" />
                  <Text style={styles.cardNumber}>{stats.averageDreamsPerMonth}</Text>
                  <Text style={styles.cardLabel}>Avg. Dreams/Month</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Mood Distribution Chart */}
            {Object.keys(stats.moodCounts).length > 0 && (
              <Animated.View style={[styles.chartContainer, chart1Style]}>
                <View style={styles.chartHeader}>
                  <PieChartIcon size={20} color="#8B5CF6" />
                  <Text style={styles.chartTitle}>Mood Distribution</Text>
                </View>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </Animated.View>
            )}

            {/* Recent Activity Chart */}
            {stats.recentActivity.some(item => item.count > 0) && (
              <Animated.View style={[styles.chartContainer, { paddingLeft: 10, paddingRight: 30 }, chart2Style]}>
                <View style={styles.chartHeader}>
                  <TrendingUp size={20} color="#8B5CF6" />
                  <Text style={styles.chartTitle}>Recent Activity (Last 7 Days)</Text>
                </View>
                <BarChart
                  data={barChartData}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#1F2937',
                    backgroundGradientFrom: '#1F2937',
                    backgroundGradientTo: '#111827',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    barPercentage: 0.6,
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  fromZero
                  showBarTops
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={false}
                  withDots={false}
                  withShadow={false}
                  segments={3}
                />
              </Animated.View>
            )}

            {/* Empty State */}
            {stats.totalDreams === 0 && (
              <Animated.View style={[styles.emptyState, emptyStateStyle]}>
                <Moon size={64} color="#8B5CF6" style={styles.emptyStateIcon} />
                <Text style={styles.emptyStateTitle}>No Dreams Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start recording your dreams to see beautiful statistics and insights!
                </Text>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainerStyle: {
    paddingBottom: 50,
  },
  summaryContainer: {
    margin: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 