import { supabase } from './supabase';

// =============================================
// Fraud Signals — append-only suspicious-event log
// =============================================
// Each helper here records a single observation. Don't make a verdict
// at insertion time — let the back-end scoring job aggregate signals
// per user / device and decide who to review or auto-block. This
// separation keeps detection rules tunable without re-collecting data.

export type FraudSignalType =
  // GPS coordinate jumps faster than physically possible (teleporting)
  | 'gps_jump'
  // User cancels orders in rapid succession (drives matching engine churn)
  | 'rapid_cancel'
  // Payment method declined multiple times in a short window
  | 'payment_decline_burst'
  // Same device fingerprint observed across multiple accounts
  | 'multi_account_device'
  // Pro marks "arrived" while still far from the customer
  | 'arrival_distance_mismatch'
  // Order amount manipulated client-side
  | 'amount_tampering'
  // KYC document looks reused across accounts
  | 'kyc_document_reuse';

export type FraudSignalParams = {
  signalType: FraudSignalType;
  severity?: number;        // 1 (low) — 10 (critical), default 3
  deviceId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

/** Best-effort signal recording. Never throws — must not break business flow. */
export async function recordFraudSignal(params: FraudSignalParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('fraud_signals').insert({
      user_id: user.id,
      device_id: params.deviceId ?? null,
      signal_type: params.signalType,
      severity: Math.max(1, Math.min(10, params.severity ?? 3)),
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Silently swallow — fraud logging must not surface to users
  }
}

// ---------------------------------------------------------------------------
// Detection helpers — call these where the relevant event happens.
// ---------------------------------------------------------------------------

const MAX_REASONABLE_SPEED_MPS = 60; // 60 m/s ≈ 216 km/h. Above this is likely GPS spoofing.

/**
 * Compares two consecutive GPS samples. If the implied speed exceeds
 * what a vehicle could physically achieve, log a `gps_jump` signal.
 */
export async function checkGpsJump(params: {
  prev: { latitude: number; longitude: number; timestamp: number };
  curr: { latitude: number; longitude: number; timestamp: number };
  resourceId?: string;
}): Promise<boolean> {
  const dt = (params.curr.timestamp - params.prev.timestamp) / 1000;
  if (dt <= 0 || dt > 600) return false; // skip stale or unsynced timestamps

  const R = 6371000;
  const dLat = ((params.curr.latitude - params.prev.latitude) * Math.PI) / 180;
  const dLng = ((params.curr.longitude - params.prev.longitude) * Math.PI) / 180;
  const lat1 = (params.prev.latitude * Math.PI) / 180;
  const lat2 = (params.curr.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const meters = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const speed = meters / dt;

  if (speed > MAX_REASONABLE_SPEED_MPS) {
    await recordFraudSignal({
      signalType: 'gps_jump',
      severity: 7,
      resourceType: 'order',
      resourceId: params.resourceId,
      metadata: {
        meters: Math.round(meters),
        seconds: Math.round(dt),
        speed_mps: Math.round(speed),
      },
    });
    return true;
  }
  return false;
}

/** Pro tapped "arrived" but is still far from the customer location. */
export async function checkArrivalDistance(params: {
  proCoords: { latitude: number; longitude: number };
  customerCoords: { latitude: number; longitude: number };
  thresholdMeters?: number;
  orderId: string;
}): Promise<boolean> {
  const threshold = params.thresholdMeters ?? 200;
  const R = 6371000;
  const dLat =
    ((params.proCoords.latitude - params.customerCoords.latitude) * Math.PI) / 180;
  const dLng =
    ((params.proCoords.longitude - params.customerCoords.longitude) * Math.PI) / 180;
  const lat1 = (params.customerCoords.latitude * Math.PI) / 180;
  const lat2 = (params.proCoords.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const meters = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  if (meters > threshold) {
    await recordFraudSignal({
      signalType: 'arrival_distance_mismatch',
      severity: 5,
      resourceType: 'order',
      resourceId: params.orderId,
      metadata: { distance_m: Math.round(meters), threshold_m: threshold },
    });
    return true;
  }
  return false;
}
