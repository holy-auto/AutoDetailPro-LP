import { forwardRef, useImperativeHandle, useRef } from 'react';
import RNMapView, {
  Marker as RNMarker,
  Circle as RNCircle,
} from 'react-native-maps';
import type {
  MapViewProps,
  MapViewHandle,
  MarkerProps,
  CircleProps,
} from '../types';

// =============================================
// Adapter — react-native-maps (Apple Maps on iOS, Google Maps on Android)
// =============================================

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  props,
  ref,
) {
  const inner = useRef<RNMapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, durationMs) => {
      inner.current?.animateToRegion(region, durationMs ?? 500);
    },
  }));

  return (
    <RNMapView
      ref={inner}
      style={props.style}
      initialRegion={props.initialRegion}
      showsUserLocation={props.showsUserLocation}
      showsMyLocationButton={props.showsMyLocationButton}
      onMapReady={props.onMapReady}
      mapPadding={props.mapPadding}
      provider={undefined}
    >
      {props.children}
    </RNMapView>
  );
});

export function Marker(props: MarkerProps) {
  return (
    <RNMarker
      coordinate={props.coordinate}
      anchor={props.anchor}
      onPress={props.onPress}
    >
      {props.children}
    </RNMarker>
  );
}

export function Circle(props: CircleProps) {
  return (
    <RNCircle
      center={props.center}
      radius={props.radius}
      strokeColor={props.strokeColor}
      fillColor={props.fillColor}
      strokeWidth={props.strokeWidth}
    />
  );
}
