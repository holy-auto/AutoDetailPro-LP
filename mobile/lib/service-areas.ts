import { supabase } from './supabase';

// =============================================
// Service Areas — geographic launch control
// =============================================
// Resolves whether a coordinate / city is within an active
// service area. Used to gate booking & pro signup so we can
// roll out city-by-city without code changes.

export type ServiceAreaStatus = 'inactive' | 'soft_launch' | 'active' | 'suspended';

export type ServiceArea = {
  id: string;
  prefecture: string;
  city: string | null;
  status: ServiceAreaStatus;
  allowlistEmails: string[];
};

type Coords = { latitude: number; longitude: number };

let cache: ServiceArea[] | null = null;
let cachePromise: Promise<ServiceArea[]> | null = null;

async function loadAreas(): Promise<ServiceArea[]> {
  const { data } = await supabase
    .from('service_areas')
    .select('id, prefecture, city, status, allowlist_emails, min_lat, max_lat, min_lng, max_lng')
    .in('status', ['active', 'soft_launch']);

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    prefecture: row.prefecture,
    city: row.city,
    status: row.status as ServiceAreaStatus,
    allowlistEmails: row.allowlist_emails ?? [],
    minLat: row.min_lat,
    maxLat: row.max_lat,
    minLng: row.min_lng,
    maxLng: row.max_lng,
  })) as Array<ServiceArea & { minLat: number; maxLat: number; minLng: number; maxLng: number }>;
}

async function ensureCache(): Promise<ServiceArea[]> {
  if (cache) return cache;
  if (!cachePromise) cachePromise = loadAreas();
  cache = await cachePromise;
  return cache;
}

export function invalidateServiceAreaCache(): void {
  cache = null;
  cachePromise = null;
}

/**
 * Find the most specific active area containing the given coordinates.
 * Returns null when the location is outside all active areas.
 */
export async function resolveArea(
  coords: Coords,
  userEmail?: string,
): Promise<ServiceArea | null> {
  const areas = (await ensureCache()) as Array<
    ServiceArea & { minLat: number; maxLat: number; minLng: number; maxLng: number }
  >;

  for (const area of areas) {
    const inBox =
      coords.latitude >= area.minLat &&
      coords.latitude <= area.maxLat &&
      coords.longitude >= area.minLng &&
      coords.longitude <= area.maxLng;
    if (!inBox) continue;

    if (area.status === 'active') return area;
    if (area.status === 'soft_launch') {
      // Only allowlisted users can use soft-launch areas
      if (userEmail && area.allowlistEmails.includes(userEmail)) return area;
    }
  }
  return null;
}

/**
 * Boolean check — `true` if the customer can book in this location.
 */
export async function isBookingAllowed(
  coords: Coords,
  userEmail?: string,
): Promise<boolean> {
  return (await resolveArea(coords, userEmail)) !== null;
}
