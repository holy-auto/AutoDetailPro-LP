import * as Location from 'expo-location';
import { supabase } from './supabase';

export type Coords = {
  latitude: number;
  longitude: number;
};

// Default: Tokyo Station
export const DEFAULT_LOCATION: Coords = {
  latitude: 35.6812,
  longitude: 139.7671,
};

/**
 * Request location permissions and get current position
 */
export async function getCurrentLocation(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return DEFAULT_LOCATION;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

/**
 * Watch position changes (for pro tracking)
 */
export function watchPosition(
  callback: (coords: Coords) => void,
  intervalMs = 5000
): { remove: () => void } {
  let sub: Location.LocationSubscription | null = null;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: intervalMs,
        distanceInterval: 10, // meters
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  })();

  return {
    remove: () => sub?.remove(),
  };
}

/**
 * Update pro's GPS location in Supabase
 */
export async function updateProLocation(proId: string, coords: Coords) {
  await supabase.from('pro_profiles').update({
    latitude: coords.latitude,
    longitude: coords.longitude,
    location_updated_at: new Date().toISOString(),
  }).eq('id', proId);
}

/**
 * Set pro online/offline status
 */
export async function setProOnlineStatus(proId: string, isOnline: boolean, coords?: Coords) {
  await supabase.from('pro_profiles').update({
    is_online: isOnline,
    ...(coords && {
      latitude: coords.latitude,
      longitude: coords.longitude,
      location_updated_at: new Date().toISOString(),
    }),
  }).eq('id', proId);
}

/**
 * Fetch nearby online pros within radius (km)
 * Uses PostGIS-style distance calc via Supabase RPC
 */
export async function fetchNearbyPros(coords: Coords, radiusKm: number) {
  // Use haversine in SQL via RPC, or fetch all online and filter client-side
  const { data, error } = await supabase
    .from('pro_profiles')
    .select(`
      id,
      latitude,
      longitude,
      is_online,
      profiles!inner(full_name, avatar_url),
      menus(id, name, price, category_id)
    `)
    .eq('is_online', true)
    .eq('suspended', false);

  if (error || !data) return [];

  // Client-side distance filter
  return data
    .filter((pro) => {
      if (!pro.latitude || !pro.longitude) return false;
      const dist = haversineKm(
        coords.latitude,
        coords.longitude,
        pro.latitude,
        pro.longitude
      );
      return dist <= radiusKm;
    })
    .map((pro) => ({
      id: pro.id,
      latitude: pro.latitude!,
      longitude: pro.longitude!,
      name: (pro.profiles as any)?.full_name ?? 'プロ',
      avatarUrl: (pro.profiles as any)?.avatar_url,
      distance: haversineKm(
        coords.latitude,
        coords.longitude,
        pro.latitude!,
        pro.longitude!
      ),
      menus: pro.menus ?? [],
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Haversine distance in km
 */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ========================================
// Route / Directions
// ========================================

export type RouteInfo = {
  /** Polyline coordinates for MapView */
  coordinates: Coords[];
  /** Estimated duration in seconds */
  durationSec: number;
  /** Distance in meters */
  distanceM: number;
  /** Human-readable duration (e.g. "5分") */
  durationText: string;
  /** Human-readable distance (e.g. "2.3 km") */
  distanceText: string;
};

/**
 * Fetch driving route between two points via Supabase Edge Function
 * (proxies to Google Directions API with server-side API key)
 *
 * Falls back to a straight-line interpolated route if the Edge Function
 * is unavailable.
 */
export async function fetchRoute(
  origin: Coords,
  destination: Coords
): Promise<RouteInfo> {
  try {
    const { data, error } = await supabase.functions.invoke('get-directions', {
      body: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: 'driving',
        language: 'ja',
      },
    });

    if (!error && data?.routes?.length) {
      const route = data.routes[0];
      const leg = route.legs[0];
      const coordinates = decodePolyline(route.overview_polyline.points);
      return {
        coordinates,
        durationSec: leg.duration.value,
        distanceM: leg.distance.value,
        durationText: formatDuration(leg.duration.value),
        distanceText: leg.distance.text,
      };
    }
  } catch {
    // Edge Function unavailable — use fallback
  }

  return buildFallbackRoute(origin, destination);
}

/**
 * Decode Google's encoded polyline string into coordinates.
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): Coords[] {
  const coords: Coords[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coords;
}

/**
 * Build a fallback route by interpolating waypoints between origin and
 * destination. Adds slight random offsets to simulate road curvature so
 * the line doesn't look like a straight arrow.
 */
function buildFallbackRoute(origin: Coords, destination: Coords): RouteInfo {
  const STEPS = 20;
  const coords: Coords[] = [origin];

  for (let i = 1; i < STEPS; i++) {
    const t = i / STEPS;
    // Slight perpendicular jitter to simulate road turns
    const jitter = (Math.random() - 0.5) * 0.001;
    coords.push({
      latitude:
        origin.latitude + (destination.latitude - origin.latitude) * t + jitter,
      longitude:
        origin.longitude +
        (destination.longitude - origin.longitude) * t -
        jitter,
    });
  }
  coords.push(destination);

  const distM =
    haversineKm(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    ) * 1000;

  // Rough estimate: avg city driving 30 km/h
  const durationSec = Math.round((distM / 1000 / 30) * 3600);

  return {
    coordinates: coords,
    durationSec,
    distanceM: Math.round(distM),
    durationText: formatDuration(durationSec),
    distanceText:
      distM >= 1000
        ? `${(distM / 1000).toFixed(1)} km`
        : `${Math.round(distM)} m`,
  };
}

/** Format seconds → human-readable Japanese duration */
function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}秒`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

/**
 * Subscribe to a pro's location updates in realtime
 */
export function subscribeToProLocation(
  proId: string,
  callback: (coords: Coords) => void
) {
  const channel = supabase
    .channel(`pro_location_${proId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pro_profiles',
        filter: `id=eq.${proId}`,
      },
      (payload) => {
        const { latitude, longitude } = payload.new as any;
        if (latitude && longitude) {
          callback({ latitude, longitude });
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
  };
}
