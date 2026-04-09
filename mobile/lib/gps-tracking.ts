import * as Location from 'expo-location';
import { supabase } from './supabase';
import { GPS_TRACKING } from '@/constants/business-rules';

// =============================================
// Real-time GPS Tracking for Pro En Route
// =============================================

type ApiResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GpsPoint {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  eta_minutes: number | null;
}

interface ProLocationUpdate extends GpsPoint {
  eta_minutes: number;
}

// Module-level watcher reference so stopTracking() can clean up
let activeSubscription: Location.LocationSubscription | null = null;

/**
 * Start real-time location tracking for a pro en route to a customer.
 * Inserts GPS points into the `gps_tracks` table every UPDATE_INTERVAL_SEC.
 * Returns a convenience stop function.
 */
export async function startTracking(
  orderId: string,
  proId: string,
): Promise<ApiResult<{ stop: () => void }>> {
  try {
    // Request foreground location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission not granted' };
    }

    // Stop any existing watcher before starting a new one
    if (activeSubscription) {
      activeSubscription.remove();
      activeSubscription = null;
    }

    let lastInsertTime = 0;

    activeSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // metres – also emit if moved ≥10 m
        timeInterval: GPS_TRACKING.UPDATE_INTERVAL_SEC * 1000,
      },
      async (location) => {
        const now = Date.now();
        // Throttle inserts to once every UPDATE_INTERVAL_SEC
        if (now - lastInsertTime < GPS_TRACKING.UPDATE_INTERVAL_SEC * 1000) {
          return;
        }
        lastInsertTime = now;

        const { latitude, longitude, heading, speed } = location.coords;

        await supabase.from('gps_tracks').insert({
          order_id: orderId,
          pro_id: proId,
          latitude,
          longitude,
          heading: heading ?? null,
          speed: speed ?? null,
          recorded_at: new Date().toISOString(),
        });
      },
    );

    const stop = () => {
      if (activeSubscription) {
        activeSubscription.remove();
        activeSubscription = null;
      }
    };

    return { success: true, data: { stop } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Stop the active location watcher.
 */
export function stopTracking(): ApiResult {
  try {
    if (activeSubscription) {
      activeSubscription.remove();
      activeSubscription = null;
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Get the most recent GPS point recorded for an order.
 */
export async function getLatestPosition(
  orderId: string,
): Promise<ApiResult<GpsPoint>> {
  try {
    const { data, error } = await supabase
      .from('gps_tracks')
      .select('latitude, longitude, heading, speed, eta_minutes')
      .eq('order_id', orderId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as GpsPoint };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Subscribe to real-time GPS updates for a pro en route.
 * Uses Supabase Realtime filtered on order_id.
 * Returns an `unsubscribe` handle.
 */
export function subscribeToProLocation(
  orderId: string,
  callback: (position: ProLocationUpdate) => void,
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`gps_tracks:order_id=eq.${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gps_tracks',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        callback({
          latitude: row.latitude as number,
          longitude: row.longitude as number,
          eta_minutes: (row.eta_minutes as number) ?? 0,
          heading: (row.heading as number) ?? null,
          speed: (row.speed as number) ?? null,
        });
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Calculate a simple straight-line ETA (in minutes) between the pro and the
 * customer using the haversine distance and an assumed average driving speed.
 */
export function calculateETA(
  proLat: number,
  proLng: number,
  customerLat: number,
  customerLng: number,
): ApiResult<{ eta_minutes: number; distance_km: number }> {
  try {
    const AVERAGE_SPEED_KMH = 30; // urban average

    const distanceKm = haversineDistance(proLat, proLng, customerLat, customerLng);
    const etaMinutes = Math.max(1, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));

    return {
      success: true,
      data: { eta_minutes: etaMinutes, distance_km: Math.round(distanceKm * 100) / 100 },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Check whether the pro has arrived at the customer location.
 * Returns true if within ARRIVAL_THRESHOLD_METERS (100 m).
 */
export function checkArrival(
  proLat: number,
  proLng: number,
  customerLat: number,
  customerLng: number,
): ApiResult<{ arrived: boolean; distance_meters: number }> {
  try {
    const distanceKm = haversineDistance(proLat, proLng, customerLat, customerLng);
    const distanceMeters = distanceKm * 1000;
    const arrived = distanceMeters <= GPS_TRACKING.ARRIVAL_THRESHOLD_METERS;

    return {
      success: true,
      data: { arrived, distance_meters: Math.round(distanceMeters) },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// Helpers
// =============================================

/**
 * Haversine formula – returns distance in kilometres between two coordinates.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
