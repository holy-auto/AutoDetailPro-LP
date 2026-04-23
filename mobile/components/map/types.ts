import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

// =============================================
// Map abstraction — provider-neutral types
// =============================================
// These types describe the minimal surface we rely on across the app.
// Adapters (native / maplibre / mapbox) implement them. If a screen
// needs a provider-specific feature, add it to this type first and
// implement it in every adapter — that keeps swap-out cheap.

export type Coords = {
  latitude: number;
  longitude: number;
};

export type MapRegion = Coords & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion?: MapRegion;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  onMapReady?: () => void;
  mapPadding?: { top: number; right: number; bottom: number; left: number };
  children?: ReactNode;
};

export type MapViewHandle = {
  animateToRegion: (region: MapRegion, durationMs?: number) => void;
};

export type MarkerProps = {
  coordinate: Coords;
  anchor?: { x: number; y: number };
  onPress?: () => void;
  children?: ReactNode;
};

export type CircleProps = {
  center: Coords;
  radius: number; // meters
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
};
