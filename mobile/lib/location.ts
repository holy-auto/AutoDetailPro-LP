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
