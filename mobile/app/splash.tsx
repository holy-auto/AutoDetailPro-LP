import { useEffect, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.3)).current;
  const droplet1Opacity = useRef(new Animated.Value(0)).current;
  const droplet1TranslateY = useRef(new Animated.Value(0)).current;
  const droplet2Opacity = useRef(new Animated.Value(0)).current;
  const droplet2TranslateX = useRef(new Animated.Value(0)).current;
  const overallFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Logo appears with spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Pulse/shimmer loop on the logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Shimmer on the icon ring
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerLoop.start();

    // Phase 2b: Decorative water droplets
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(droplet1Opacity, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(droplet1TranslateY, {
          toValue: -20,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(droplet2Opacity, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(droplet2TranslateX, {
          toValue: 15,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Phase 3: Title fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Phase 4: Tagline fades in
    setTimeout(() => {
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
    }, 1000);

    // Phase 5: Fade out and navigate
    const exitTimer = setTimeout(() => {
      pulseLoop.stop();
      shimmerLoop.stop();
      Animated.timing(overallFade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: overallFade }]}>
      <LinearGradient
        colors={['#162D4A', Colors.primary, '#243F64', '#162D4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative background circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.content}>
          {/* Logo area */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { scale: pulseAnim }],
              },
            ]}
          >
            {/* Shimmer ring */}
            <Animated.View
              style={[styles.shimmerRing, { opacity: shimmerOpacity }]}
            />

            {/* Icon background */}
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="car-wash"
                size={52}
                color={Colors.white}
              />
            </View>

            {/* Decorative water droplets */}
            <Animated.View
              style={[
                styles.droplet1,
                {
                  opacity: droplet1Opacity,
                  transform: [{ translateY: droplet1TranslateY }],
                },
              ]}
            >
              <Ionicons name="water" size={16} color={Colors.primarySoft} />
            </Animated.View>
            <Animated.View
              style={[
                styles.droplet2,
                {
                  opacity: droplet2Opacity,
                  transform: [{ translateX: droplet2TranslateX }],
                },
              ]}
            >
              <Ionicons name="water" size={12} color={Colors.primaryPale} />
            </Animated.View>
          </Animated.View>

          {/* App name */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <Text style={styles.title}>Mobile Wash</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={{
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            }}
          >
            <Text style={styles.tagline}>出張カーディテイリング</Text>
          </Animated.View>
        </View>

        {/* Bottom decorative line */}
        <View style={styles.bottomBar}>
          <Animated.View
            style={[styles.bottomLine, { opacity: taglineOpacity }]}
          />
        </View>
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
  bgCircle1: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.25,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: Colors.primaryMedium,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  droplet1: {
    position: 'absolute',
    top: -8,
    right: 5,
  },
  droplet2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(191, 219, 254, 0.85)',
    letterSpacing: 2,
    textAlign: 'center',
    fontWeight: '300',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  bottomLine: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
  },
});
