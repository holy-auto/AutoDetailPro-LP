import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  Text,
} from 'react-native';
import { Colors } from '@/constants/colors';

// =============================================
// BeforeAfterSlider — Before/After Photo Comparison
// =============================================
// Draggable vertical divider reveals before/after images.
// Pure RN component using PanResponder for gesture handling.

type Props = {
  beforeUrl: string;
  afterUrl: string;
  height?: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const HANDLE_SIZE = 30;

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  height = 300,
}: Props) {
  const containerWidth = useRef(SCREEN_WIDTH);
  const [sliderX, setSliderX] = useState(0.5); // 0–1 ratio
  const positionAtGrant = useRef(0.5);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2,
      onPanResponderGrant: () => {
        // Capture the current position ratio when the gesture starts.
        // We read from a ref that is kept in sync with state to avoid
        // stale-closure issues (PanResponder is created once).
        positionAtGrant.current = positionAtGrant.current; // noop, value already current
      },
      onPanResponderMove: (_evt, gestureState) => {
        const width = containerWidth.current;
        const startPixel = positionAtGrant.current * width;
        const newPixel = Math.max(0, Math.min(width, startPixel + gestureState.dx));
        const ratio = newPixel / width;
        positionAtGrant.current = positionAtGrant.current; // keep grant value stable during drag
        setSliderX(ratio);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        // Commit the final position to the ref so the next grant picks it up.
        const width = containerWidth.current;
        const startPixel = positionAtGrant.current * width;
        const newPixel = Math.max(0, Math.min(width, startPixel + gestureState.dx));
        const ratio = newPixel / width;
        positionAtGrant.current = ratio;
      },
    }),
  ).current;

  const clipWidth = sliderX * containerWidth.current;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
        // Re-render to recalculate pixel positions with real width
        setSliderX((prev) => prev);
      }}
    >
      {/* After image (background, full width) */}
      <Image
        source={{ uri: afterUrl }}
        style={[styles.image, { height }]}
        resizeMode="cover"
      />

      {/* Before image (clipped to left of divider) */}
      <View
        style={[styles.beforeClip, { width: clipWidth, height }]}
        pointerEvents="none"
      >
        <Image
          source={{ uri: beforeUrl }}
          style={[styles.image, { width: containerWidth.current, height }]}
          resizeMode="cover"
        />
      </View>

      {/* Labels */}
      <View style={styles.labelBefore} pointerEvents="none">
        <Text style={styles.labelText}>BEFORE</Text>
      </View>
      <View style={styles.labelAfter} pointerEvents="none">
        <Text style={styles.labelText}>AFTER</Text>
      </View>

      {/* Slider divider line */}
      <View
        style={[styles.divider, { left: clipWidth - 1 }]}
        pointerEvents="none"
      >
        <View style={styles.dividerLine} />
      </View>

      {/* Draggable handle */}
      <View
        style={[
          styles.handle,
          {
            left: clipWidth - HANDLE_SIZE / 2,
            top: height / 2 - HANDLE_SIZE / 2,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.handleArrows}>{'\u25C0  \u25B6'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: Colors.border,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  beforeClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },

  // Labels
  labelBefore: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  labelAfter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  labelText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Divider line
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  dividerLine: {
    flex: 1,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  // Handle
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  handleArrows: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
});
