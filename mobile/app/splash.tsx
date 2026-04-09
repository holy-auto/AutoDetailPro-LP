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

const { width: SW, height: SH } = Dimensions.get('window');

type Props = { onFinish: () => void };

// ─── Foam bubbles (泡) ───
const FOAM_COUNT = 18;
const FOAM = Array.from({ length: FOAM_COUNT }, (_, i) => ({
  id: i,
  // Random size: small foam = 30, large = 80
  size: 30 + Math.random() * 50,
  // Start from right side (spray direction)
  startX: SW * 0.6 + Math.random() * SW * 0.5,
  startY: SH * 0.1 + Math.random() * SH * 0.8,
  // End scattered across screen
  endX: -SW * 0.1 + Math.random() * SW * 1.2,
  endY: SH * 0.05 + Math.random() * SH * 0.9,
  delay: Math.random() * 500,
  opacity: 0.5 + Math.random() * 0.4,
}));

// ─── Water drip trails (水滴) ───
const DRIP_COUNT = 12;
const DRIPS = Array.from({ length: DRIP_COUNT }, (_, i) => ({
  id: i,
  x: SW * 0.05 + Math.random() * SW * 0.9,
  size: 3 + Math.random() * 5,
  delay: 200 + Math.random() * 600,
  speed: 1200 + Math.random() * 800,
}));

export default function SplashScreen({ onFinish }: Props) {
  // ─── Overall ───
  const overallFade = useRef(new Animated.Value(1)).current;

  // ─── Phase 1: Foam spray ───
  const foamAnims = useMemo(
    () =>
      FOAM.map(() => ({
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })),
    [],
  );

  // ─── Phase 2: Water rinse (top→bottom curtain) ───
  const waterY = useRef(new Animated.Value(-SH)).current;
  const waterOpacity = useRef(new Animated.Value(0)).current;

  // ─── Phase 2b: Water drip trails ───
  const dripAnims = useMemo(
    () =>
      DRIPS.map(() => ({
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })),
    [],
  );

  // ─── Phase 2c: Foam fade-out (all at once when water hits) ───
  const foamGroupOpacity = useRef(new Animated.Value(1)).current;

  // ─── Phase 3: Logo reveal ───
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0.1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;

  // Shine sweep
  const shineX = useRef(new Animated.Value(-100)).current;
  const shineOpacity = useRef(new Animated.Value(0)).current;

  // ─── Phase 4: Title & tagline ───
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(25)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(15)).current;

  // ─── Bottom dots ───
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // =========================================
    // PHASE 1: Foam spray (t=0 ~ 800ms)
    // 泡が右側からスプレーのように飛んでくる
    // =========================================
    FOAM.forEach((f, i) => {
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(foamAnims[i].translateX, {
            toValue: f.endX - f.startX,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(foamAnims[i].translateY, {
            toValue: f.endY - f.startY,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(foamAnims[i].scale, {
            toValue: 1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(foamAnims[i].opacity, {
            toValue: f.opacity,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, f.delay);
      timers.push(t);
    });

    // =========================================
    // PHASE 2: Water rinse (t=1000ms)
    // 水が上から流れて泡を洗い流す
    // =========================================
    const waterTimer = setTimeout(() => {
      // Show water curtain
      Animated.timing(waterOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Water sweeps down
      Animated.timing(waterY, {
        toValue: SH,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // Foam fades as water passes
      setTimeout(() => {
        Animated.timing(foamGroupOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 300);

      // Water drip trails
      DRIPS.forEach((d, i) => {
        const dt = setTimeout(() => {
          Animated.parallel([
            Animated.timing(dripAnims[i].opacity, {
              toValue: 0.6,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(dripAnims[i].translateY, {
              toValue: SH * 0.3 + Math.random() * SH * 0.4,
              duration: d.speed,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Drip fades
            Animated.timing(dripAnims[i].opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
          });
        }, d.delay);
        timers.push(dt);
      });

      // Water curtain fades out after passing
      setTimeout(() => {
        Animated.timing(waterOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 1000);
    }, 1000);
    timers.push(waterTimer);

    // =========================================
    // PHASE 3: Logo reveal (t=2000ms)
    // 洗い終わった後にピカピカのロゴが現れる
    // =========================================
    const logoTimer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow pulse
      const glow = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.1, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glowScale, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
            Animated.timing(glowScale, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
          ]),
        ]),
      );
      glow.start();

      // Cleanup glow on exit
      const stopGlow = setTimeout(() => glow.stop(), 2000);
      timers.push(stopGlow);
    }, 2000);
    timers.push(logoTimer);

    // ─── Shine sweep (t=2400ms) ───
    const shineTimer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(shineOpacity, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(shineX, { toValue: 100, duration: 500, useNativeDriver: true }),
        Animated.timing(shineOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }, 2400);
    timers.push(shineTimer);

    // =========================================
    // PHASE 4: Title + tagline (t=2500ms)
    // =========================================
    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleOpacity, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 2500);
    timers.push(titleTimer);

    const tagTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 2800);
    timers.push(tagTimer);

    // ─── Bottom dots (t=3000ms) ───
    const dotsTimer = setTimeout(() => {
      Animated.timing(dotsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 3000);
    timers.push(dotsTimer);

    // =========================================
    // PHASE 5: Exit (t=3800ms)
    // =========================================
    const exitTimer = setTimeout(() => {
      Animated.timing(overallFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 3800);
    timers.push(exitTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  const rotateStr = logoRotate.interpolate({
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
        {/* ── Background circles ── */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* ================================================
            LAYER 1: Foam bubbles (泡スプレー)
            ================================================ */}
        <Animated.View style={[styles.foamLayer, { opacity: foamGroupOpacity }]}>
          {FOAM.map((f, i) => (
            <Animated.View
              key={f.id}
              style={[
                styles.foamBubble,
                {
                  width: f.size,
                  height: f.size,
                  borderRadius: f.size / 2,
                  left: f.startX,
                  top: f.startY,
                  opacity: foamAnims[i].opacity,
                  transform: [
                    { translateX: foamAnims[i].translateX },
                    { translateY: foamAnims[i].translateY },
                    { scale: foamAnims[i].scale },
                  ],
                },
              ]}
            >
              {/* Inner highlight for 3D bubble look */}
              <View
                style={[
                  styles.foamHighlight,
                  {
                    width: f.size * 0.35,
                    height: f.size * 0.35,
                    borderRadius: f.size * 0.175,
                  },
                ]}
              />
            </Animated.View>
          ))}
        </Animated.View>

        {/* ================================================
            LAYER 2: Water rinse curtain (水流)
            ================================================ */}
        <Animated.View
          style={[
            styles.waterCurtain,
            {
              opacity: waterOpacity,
              transform: [{ translateY: waterY }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(59,130,246,0.01)',
              'rgba(59,130,246,0.12)',
              'rgba(96,165,250,0.25)',
              'rgba(147,197,253,0.18)',
              'rgba(59,130,246,0.08)',
              'rgba(59,130,246,0.01)',
            ]}
            style={styles.waterGradient}
          />
        </Animated.View>

        {/* ── Water drip trails ── */}
        {DRIPS.map((d, i) => (
          <Animated.View
            key={`drip-${d.id}`}
            style={[
              styles.drip,
              {
                left: d.x,
                width: d.size,
                height: d.size * 3,
                borderRadius: d.size,
                opacity: dripAnims[i].opacity,
                transform: [{ translateY: dripAnims[i].translateY }],
              },
            ]}
          />
        ))}

        {/* ================================================
            LAYER 3: Logo + Text (ロゴ表示)
            ================================================ */}
        <View style={styles.centerContent}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrap,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { rotate: rotateStr },
                ],
              },
            ]}
          >
            {/* Glow */}
            <Animated.View
              style={[
                styles.glow,
                { opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            />

            {/* Ring */}
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <MaterialCommunityIcons name="car-wash" size={56} color={Colors.white} />
              </View>
            </View>

            {/* Shine */}
            <Animated.View
              style={[
                styles.shine,
                { opacity: shineOpacity, transform: [{ translateX: shineX }] },
              ]}
            />

            {/* Sparkle decorations */}
            <Ionicons name="sparkles" size={14} color="rgba(96,165,250,0.7)" style={styles.sparkle1} />
            <Ionicons name="sparkles" size={10} color="rgba(191,219,254,0.5)" style={styles.sparkle2} />
            <Ionicons name="water" size={11} color="rgba(147,197,253,0.5)" style={styles.sparkle3} />
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}
          >
            <Text style={styles.title}>Mobile Wash</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}
          >
            <Text style={styles.tagline}>出張カーディテイリング</Text>
            <View style={styles.taglineLine} />
          </Animated.View>
        </View>

        {/* ── Bottom dots ── */}
        <Animated.View style={[styles.bottomDots, { opacity: dotsOpacity }]}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // ── Background ──
  bgCircle1: {
    position: 'absolute',
    top: -SH * 0.12,
    right: -SW * 0.15,
    width: SW * 0.6,
    height: SW * 0.6,
    borderRadius: SW * 0.3,
    backgroundColor: 'rgba(59,130,246,0.04)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -SH * 0.08,
    left: -SW * 0.2,
    width: SW * 0.5,
    height: SW * 0.5,
    borderRadius: SW * 0.25,
    backgroundColor: 'rgba(59,130,246,0.03)',
  },

  // ── Foam layer ──
  foamLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  foamBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    // subtle shadow for depth
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  foamHighlight: {
    position: 'absolute',
    top: '15%' as any,
    left: '20%' as any,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // ── Water curtain ──
  waterCurtain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SH * 0.6,
    zIndex: 20,
  },
  waterGradient: {
    flex: 1,
  },

  // ── Drip trails ──
  drip: {
    position: 'absolute',
    top: SH * 0.1,
    backgroundColor: 'rgba(147,197,253,0.35)',
    zIndex: 15,
  },

  // ── Center content (logo + text) ──
  centerContent: {
    alignItems: 'center',
    zIndex: 5,
  },
  logoWrap: {
    marginBottom: 36,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  logoRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shine: {
    position: 'absolute',
    width: 35,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 17,
    transform: [{ skewX: '-15deg' }],
  },
  sparkle1: { position: 'absolute', top: 0, right: 0 },
  sparkle2: { position: 'absolute', bottom: 6, left: -2 },
  sparkle3: { position: 'absolute', top: 20, left: -6 },

  // ── Title ──
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(59,130,246,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    ...Platform.select({ ios: { fontFamily: 'System' } }),
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(191,219,254,0.9)',
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '300',
  },
  taglineLine: {
    marginTop: 12,
    width: 50,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(96,165,250,0.35)',
    alignSelf: 'center',
  },

  // ── Bottom dots ──
  bottomDots: {
    position: 'absolute',
    bottom: 70,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(96,165,250,0.2)',
  },
  dotActive: {
    backgroundColor: 'rgba(96,165,250,0.7)',
    width: 18,
    borderRadius: 3,
  },
});
