import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Moon, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const FloatingOrb = ({ delay, size, color, startX, startY }) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.6, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }));

    scale.value = withDelay(delay, withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
    }));

    // Floating animation
    translateY.value = withDelay(delay + 500, withRepeat(
      withSequence(
        withTiming(startY - 20, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
        withTiming(startY, { duration: 2000, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    ));

    translateX.value = withDelay(delay + 1000, withRepeat(
      withSequence(
        withTiming(startX + 10, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
        withTiming(startX - 10, { duration: 3000, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.floatingOrb,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const SplashScreen = ({ onFinish }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const sparklesOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const pulseValue = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const gradientRotation = useSharedValue(0);
  const isAnimationComplete = useRef(false);

  useEffect(() => {
    if (isAnimationComplete.current) return;
    
    // Start background fade in
    backgroundOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Start gradient rotation
    gradientRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Start particle animation
    particleOpacity.value = withDelay(200, withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }));

    // Logo animation sequence
    logoScale.value = withSequence(
      withDelay(300, withTiming(1.2, {
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
      })),
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
    );

    logoOpacity.value = withDelay(300, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));

    // Start pulsing animation
    pulseValue.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      true
    ));

    // Sparkles animation
    sparklesOpacity.value = withDelay(800, withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    }));

    // Text animation
    textOpacity.value = withDelay(1000, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));

    // Complete animation and trigger onFinish
    const timer = setTimeout(() => {
      if (!isAnimationComplete.current) {
        isAnimationComplete.current = true;
        onFinish();
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        {
          translateY: interpolate(
            textOpacity.value,
            [0, 1],
            [20, 0]
          ),
        },
      ],
    };
  });

  const sparklesAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: sparklesOpacity.value,
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulseValue.value, [0.8, 1], [0.3, 0.6]),
      transform: [{ scale: interpolate(pulseValue.value, [0.8, 1], [0.9, 1.1]) }],
    };
  });

  const particleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: particleOpacity.value,
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${gradientRotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#0A0A0A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated gradient overlay */}
        <Animated.View style={[styles.gradientOverlay, gradientAnimatedStyle]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'transparent', 'rgba(139, 92, 246, 0.05)']}
            style={styles.overlayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Floating orbs */}
        <FloatingOrb delay={500} size={8} color="rgba(139, 92, 246, 0.4)" startX={width * 0.2} startY={height * 0.3} />
        <FloatingOrb delay={800} size={12} color="rgba(139, 92, 246, 0.3)" startX={width * 0.8} startY={height * 0.2} />
        <FloatingOrb delay={1200} size={6} color="rgba(139, 92, 246, 0.5)" startX={width * 0.1} startY={height * 0.7} />
        <FloatingOrb delay={1500} size={10} color="rgba(139, 92, 246, 0.2)" startX={width * 0.9} startY={height * 0.8} />

        {/* Floating particles background */}
        <Animated.View style={[styles.particlesContainer, particleAnimatedStyle]}>
          {[...Array(12)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height * 0.9,
                  animationDelay: `${index * 0.3}s`,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Animated sparkles background */}
        <Animated.View style={[styles.sparklesContainer, sparklesAnimatedStyle]}>
          {[...Array(8)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sparkle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height * 0.8,
                  animationDelay: `${index * 0.2}s`,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Pulsing background effect */}
          <Animated.View style={[styles.pulseBackground, pulseAnimatedStyle]} />
          
          {/* Logo container */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoBackground}>
              <Moon size={80} color="#8B5CF6" strokeWidth={1.5} />
            </View>
          </Animated.View>

          {/* App title and subtitle */}
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.title}>Dream Journal</Text>
            <Text style={styles.subtitle}>Capture your dreams</Text>
          </Animated.View>
        </View>

        {/* Bottom accent */}
        <View style={styles.bottomAccent} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    width: '100%',
    height: '100%',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 50,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 1,
    opacity: 0.4,
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  pulseBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  logoContainer: {
    marginBottom: 40,
    zIndex: 1,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#A1A1AA',
    letterSpacing: 0.5,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
});

export default SplashScreen; 