// =============================================
// Map abstraction — single import point for the whole app.
// =============================================
// To switch providers (e.g. to MapLibre/Mapbox), change the re-export
// below to `./adapters/maplibre` (or another adapter). The app code
// stays untouched as long as the adapter implements the same types.
//
// Never import `react-native-maps` directly outside of an adapter.

export { MapView, Marker, Circle } from './adapters/native';
export type {
  Coords,
  MapRegion,
  MapViewProps,
  MapViewHandle,
  MarkerProps,
  CircleProps,
} from './types';
