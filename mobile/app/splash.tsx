import { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type SplashScreenProps = {
  onFinish: () => void;
};

// --- Bubble particle config ---
const BUBBLE_COUNT = 8;
const BUBBLES = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
  id: i,
  size: 6 + Math.random() * 10,
  startX: -60 + Math.random() * 120,
  startY: 20 + Math.random() * 40,
  driftX: -30 + Math.random() * 60,
  delay: 200 + Math.random() * 800,
  duration: 2000 + Math.random() * 1500,
}));

// --- Ripple ring config ---
const RIPPLE_COUNT = 3;
const RIPPLES = Array.from({ length: RIPPLE_COUNT }, (_, i) => ({
  id: i,
  delay: i * 400,
  maxScale: 2.5 + i * 0.8,
}));

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // --- Core animations ---
  const overallFade = useRef(new Animated.Value(1)).current;

  // Logo entrance
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-0.15)).current; // radians

  // Logo glow pulse
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  const glowScale = useRef(new Animated.Value(0.95)).current;

  // Shine sweep across logo
  const shineTranslateX = useRef(new Animated.Value(-120)).current;
  const shineOpacity = useRef(new Animated.Value(0)).current;

  // Title
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const titleScale = useRef(new Animated.Value(0.9)).current;

  // Tagline
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;

  // Bottom indicator
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(0)).current;

  // --- Ripple rings ---
  const rippleAnims = useMemo(
    () =>
      RIPPLES.map(() => ({
        scale: new Animated.Value(0.4),
        opacity: new Animated.Value(0.6),
      })),
    [],
  );

  // --- Bubble particles ---
  const bubbleAnims = useMemo(
    () =>
      BUBBLES.map(() => ({
        translateY: new Animated.Value(0),
        translateX: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      })),
    [],
  );

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // ============================================
    // Phase 1: Ripple rings expand (t=0ms)
    // ============================================
    RIPPLES.forEach((ripple, i) => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(rippleAnims[i].scale, {
            toValue: ripple.maxScale,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnims[i].opacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]).start();
      }, ripple.delay);
      cleanups.push(() => clearTimeout(timer));
    });

    // ============================================
    // Phase 2: Logo bounces in with rotation (t=300ms)
    // ============================================
    const logoTimer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
    cleanups.push(() => clearTimeout(logoTimer));

    // ============================================
    // Phase 3: Glow pulse loop (t=700ms)
    // ============================================
    let glowLoop: Animated.CompositeAnimation;
    const glowTimer = setTimeout(() => {
      glowLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.6,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.15,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowScale, {
              toValue: 1.15,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 0.95,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      glowLoop.start();
    }, 700);
    cleanups.push(() => {
      clearTimeout(glowTimer);
      glowLoop?.stop();
    });

    // ============================================
    // Phase 4: Shine sweep across logo (t=900ms)
    // ============================================
    const shineTimer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(shineOpacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shineTranslateX, {
          toValue: 120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(shineOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900);
    cleanups.push(() => clearTimeout(shineTimer));

    // ============================================
    // Phase 5: Bubbles float up (t=600ms+)
    // ============================================
    BUBBLES.forEach((bubble, i) => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(bubbleAnims[i].opacity, {
            toValue: 0.6,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnims[i].scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnims[i].translateY, {
            toValue: -(100 + Math.random() * 120),
            duration: bubble.duration,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnims[i].translateX, {
            toValue: bubble.driftX,
            duration: bubble.duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Fade out at top
          Animated.timing(bubbleAnims[i].opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 600 + bubble.delay);
      cleanups.push(() => clearTimeout(timer));
    });

    // ============================================
    // Phase 6: Title slides in (t=1000ms)
    // ============================================
    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleOpacity, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
    cleanups.push(() => clearTimeout(titleTimer));

    // ============================================
    // Phase 7: Tagline fades in (t=1400ms)
    // ============================================
    const tagTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1400);
    cleanups.push(() => clearTimeout(tagTimer));

    // ============================================
    // Phase 8: Bottom indicator (t=1700ms)
    // ============================================
    const indicatorTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(indicatorOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(indicatorScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1700);
    cleanups.push(() => clearTimeout(indicatorTimer));

    // ============================================
    // Phase 9: Exit (t=3000ms)
    // ============================================
    const exitTimer = setTimeout(() => {
      glowLoop?.stop();
      Animated.timing(overallFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);
    cleanups.push(() => clearTimeout(exitTimer));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-57.3deg', '57.3deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: overallFade }]}>
      <LinearGradient
        colors={['#0D1B2A', '#162D4A', Colors.primary, '#162D4A', '#0D1B2A']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decorative circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />

        {/* --- Ripple rings --- */}
        {RIPPLES.map((_, i) => (
          <Animated.View
            key={`ripple-${i}`}
            style={[
              styles.rippleRing,
              {
                opacity: rippleAnims[i].opacity,
                transform: [{ scale: rippleAnims[i].scale }],
              },
            ]}
          />
        ))}

        <View style={styles.content}>
          {/* --- Bubble particles --- */}
          {BUBBLES.map((bubble, i) => (
            <Animated.View
              key={`bubble-${bubble.id}`}
              style={[
                styles.bubble,
                {
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                  left: SCREEN_WIDTH / 2 + bubble.startX - bubble.size / 2,
                  top: bubble.startY,
                  opacity: bubbleAnims[i].opacity,
                  transform: [
                    { translateY: bubbleAnims[i].translateY },
                    { translateX: bubbleAnims[i].translateX },
                    { scale: bubbleAnims[i].scale },
                  ],
                },
              ]}
            />
          ))}

          {/* --- Logo --- */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotateInterpolate },
                ],
              },
            ]}
          >
            {/* Outer glow */}
            <Animated.View
              style={[
                styles.outerGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />

            {/* Inner ring */}
            <View style={styles.innerRing}>
              {/* Icon background */}
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="car-wash"
                  size={56}
                  color={Colors.white}
                />
              </View>
            </View>

            {/* Shine sweep overlay */}
            <Animated.View
              style={[
                styles.shineOverlay,
                {
                  opacity: shineOpacity,
                  transform: [{ translateX: shineTranslateX }],
                },
              ]}
            />

            {/* Sparkle dots */}
            <View style={[styles.sparkle, styles.sparkle1]}>
              <Ionicons name="sparkles" size={14} color="rgba(96,165,250,0.7)" />
            </View>
            <View style={[styles.sparkle, styles.sparkle2]}>
              <Ionicons name="sparkles" size={10} color="rgba(191,219,254,0.5)" />
            </View>
          </Animated.View>

          {/* --- Title --- */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale },
              ],
            }}
          >
            <Text style={styles.title}>Mobile Wash</Text>
          </Animated.View>

          {/* --- Tagline --- */}
          <Animated.View
            style={{
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            }}
          >
            <Text style={styles.tagline}>出張カーディテイリング</Text>
            <View style={styles.taglineLine} />
          </Animated.View>
        </View>

        {/* --- Bottom indicator --- */}
        <Animated.View
          style={[
            styles.bottomIndicator,
            {
              opacity: indicatorOpacity,
              transform: [{ scale: indicatorScale }],
            },
          ]}
        >
          <View style={styles.dotRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Background decoration ---
  bgCircle1: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.12,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: SCREEN_WIDTH * 0.325,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: SCREEN_WIDTH * 0.275,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  bgCircle3: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.35,
    left: -SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: SCREEN_WIDTH * 0.15,
    backgroundColor: 'rgba(96, 165, 250, 0.03)',
  },

  // --- Ripple rings ---
  rippleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },

  // --- Bubble particles ---
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(147, 197, 253, 0.4)',
    borderWidth: 0.5,
    borderColor: 'rgba(191, 219, 254, 0.3)',
  },

  // --- Logo area ---
  content: {
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  outerGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  innerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shineOverlay: {
    position: 'absolute',
    width: 40,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    transform: [{ skewX: '-15deg' }],
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 2,
    right: 2,
  },
  sparkle2: {
    bottom: 8,
    left: 0,
  },

  // --- Title ---
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    ...Platform.select({
      ios: { fontFamily: 'System' },
    }),
  },

  // --- Tagline ---
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(191, 219, 254, 0.9)',
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '300',
  },
  taglineLine: {
    marginTop: 12,
    width: 50,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(96, 165, 250, 0.35)',
    alignSelf: 'center',
  },

  // --- Bottom indicator ---
  bottomIndicator: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  dotActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.7)',
    width: 18,
    borderRadius: 3,
  },
});
