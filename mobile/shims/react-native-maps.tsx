import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Web shim for react-native-maps.
 * Renders a placeholder on web since MapView is native-only.
 */

const MapView = React.forwardRef<any, any>(({ style, children, ...props }, ref) => {
  React.useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    fitToCoordinates: () => {},
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.label}>MapView</Text>
        <Text style={styles.sublabel}>ネイティブアプリで表示されます</Text>
      </View>
      {children}
    </View>
  );
});

MapView.displayName = 'MapView';

export default MapView;

// Named exports matching react-native-maps API
export const Marker = ({ children }: any) => children ?? null;
export const Polyline = (_props: any) => null;
export const Circle = (_props: any) => null;
export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  sublabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
