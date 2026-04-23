import { supabase } from './supabase';

// =============================================
// ETA — self-hosted travel-time estimation
// =============================================
// Looks up `trip_stats` aggregates collected from real pro trips.
// Falls back to a haversine-based estimate when no historical data
// covers the requested cell pair. This lets us de-risk dependence
// on Google Directions / Mapbox Directions APIs from day 1.

export type Coords = { latitude: number; longitude: number };

export type EtaEstimate = {
  seconds: number;          // best estimate
  source: 'historical' | 'fallback';
  sampleCount?: number;     // when historical
  confidence: 'low' | 'medium' | 'high';
};

const FALLBACK_SPEED_MPS = {
  // Conservative urban average (~25 km/h) — closer to reality than straight-line
  urban: 25 * 1000 / 3600,
  // Highway / suburban
  rural: 50 * 1000 / 3600,
};

/** Quantise to ~1km grid (lat: ~111km/deg → 0.01 ≈ 1.1km). */
function quantise(coord: number): number {
  return Math.round(coord * 100) / 100;
}

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function fallbackEstimate(origin: Coords, dest: Coords): EtaEstimate {
  const meters = haversineMeters(origin, dest);
  // Add 30% routing inefficiency — straight line is always shorter than roads
  const estimatedRoadMeters = meters * 1.3;
  const speed = meters > 5000 ? FALLBACK_SPEED_MPS.rural : FALLBACK_SPEED_MPS.urban;
  return {
    seconds: Math.round(estimatedRoadMeters / speed),
    source: 'fallback',
    confidence: 'low',
  };
}

/**
 * Estimate travel time from `origin` to `dest` at the given hour
 * (defaults to current hour). Prefers historical aggregates; falls
 * back to haversine + assumed urban speed.
 */
export async function estimateEta(
  origin: Coords,
  dest: Coords,
  hourOfDay: number = new Date().getHours(),
): Promise<EtaEstimate> {
  const { data } = await supabase
    .from('trip_stats')
    .select('avg_seconds, p50_seconds, p90_seconds, sample_count')
    .eq('origin_lat_cell', quantise(origin.latitude))
    .eq('origin_lng_cell', quantise(origin.longitude))
    .eq('dest_lat_cell', quantise(dest.latitude))
    .eq('dest_lng_cell', quantise(dest.longitude))
    .eq('hour_of_day', hourOfDay)
    .maybeSingle();

  if (!data || data.sample_count < 3) {
    return fallbackEstimate(origin, dest);
  }

  // Prefer p50 (median) over mean — less skewed by outliers
  const seconds = data.p50_seconds ?? data.avg_seconds;
  const confidence: EtaEstimate['confidence'] =
    data.sample_count >= 30 ? 'high' : data.sample_count >= 10 ? 'medium' : 'low';

  return {
    seconds,
    source: 'historical',
    sampleCount: data.sample_count,
    confidence,
  };
}

/** UI helper — convert seconds to a Japanese display string ("12分"). */
export function formatEta(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}
