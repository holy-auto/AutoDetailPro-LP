import { supabase } from './supabase';
import { fetchRankedPros, type ProRankData } from './ranking';
import {
  MATCHING,
  ORDER_STATUS,
  BUSINESS_HOURS,
  type OrderStatus,
} from '@/constants/business-rules';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================
// Pro-Customer Matching Engine
// =============================================

export type MatchResult = {
  status: 'matched' | 'expanded' | 'no_match';
  orderId: string;
  proId?: string;
  rankedPros: ProRankData[];
  expandedSearch: boolean;
};

export type OrderUpdate = {
  id: string;
  status: OrderStatus;
  pro_id?: string | null;
  requested_at?: string | null;
  accepted_at?: string | null;
};

// Active timeout handles keyed by orderId, so they can be cleared on response.
const activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// =============================================
// 1. Business Hours Check
// =============================================

/**
 * Check whether the current time falls within business hours (08:00-20:00 JST).
 */
export function isWithinBusinessHours(now?: Date): boolean {
  const date = now ?? new Date();

  // Format the current hour in Asia/Tokyo timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: BUSINESS_HOURS.TIMEZONE,
  });
  const hour = parseInt(formatter.format(date), 10);

  return hour >= BUSINESS_HOURS.OPEN_HOUR && hour < BUSINESS_HOURS.CLOSE_HOUR;
}

// =============================================
// 2. Request Match (Main Flow)
// =============================================

/**
 * Run the full matching flow for an order:
 *  1. Search for pros within BASE_RADIUS_KM
 *  2. If none found and expansion enabled, widen to EXPANDED_RADIUS_KM
 *  3. Assign the top-ranked pro or auto-cancel
 */
export async function requestMatch(
  orderId: string,
  customerLat: number,
  customerLng: number,
): Promise<MatchResult> {
  // --- Step 1: Search within base radius ---
  let rankedPros = await fetchRankedPros(
    customerLat,
    customerLng,
    MATCHING.BASE_RADIUS_KM,
  );

  let expandedSearch = false;

  // --- Step 2: Expand radius if no pros found ---
  if (rankedPros.length === 0 && MATCHING.ASK_EXPAND_ON_NO_MATCH) {
    expandedSearch = true;

    await updateOrderStatus(orderId, ORDER_STATUS.REQUESTED_EXPANDED);

    rankedPros = await fetchRankedPros(
      customerLat,
      customerLng,
      MATCHING.EXPANDED_RADIUS_KM,
    );
  }

  // --- Step 3: No pros at all ---
  if (rankedPros.length === 0) {
    await updateOrderStatus(orderId, ORDER_STATUS.AUTO_CANCELLED_NO_PRO);

    return {
      status: 'no_match',
      orderId,
      rankedPros: [],
      expandedSearch,
    };
  }

  // --- Step 4: Match with top-ranked pro ---
  const topPro = rankedPros[0];

  await assignProToOrder(orderId, topPro.id);
  await sendProRequest(orderId, topPro.id);
  startAcceptanceTimeout(orderId);

  return {
    status: expandedSearch ? 'expanded' : 'matched',
    orderId,
    proId: topPro.id,
    rankedPros,
    expandedSearch,
  };
}

// =============================================
// 3. Send Pro Request
// =============================================

/**
 * Notify the matched pro about the incoming order request.
 * Inserts a row into `notifications` and updates the order status.
 */
export async function sendProRequest(
  orderId: string,
  proId: string,
): Promise<void> {
  // Insert a notification for the pro
  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: proId,
    type: 'match_request',
    title: '新しい依頼が届きました',
    body: 'お客様からの洗車依頼があります。詳細を確認してください。',
    data: { order_id: orderId },
    read: false,
  });

  if (notifError) {
    console.error('[matching] Failed to send notification:', notifError.message);
  }
}

// =============================================
// 4. Handle Pro Response
// =============================================

/**
 * Process a pro's accept/reject response for an order.
 *
 * - Accept: update status to 'accepted', record accepted_at, clear timeout.
 * - Reject: attempt to assign the next ranked pro. If none remain, auto-cancel.
 */
export async function handleProResponse(
  orderId: string,
  proId: string,
  accepted: boolean,
): Promise<void> {
  // Clear any running acceptance timeout for this order
  clearAcceptanceTimeout(orderId);

  if (accepted) {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.ACCEPTED,
        accepted_at: now,
      })
      .eq('id', orderId)
      .eq('pro_id', proId);

    if (error) {
      console.error('[matching] Failed to accept order:', error.message);
    }
    return;
  }

  // --- Pro rejected: try next available pro ---
  await tryNextPro(orderId, proId);
}

// =============================================
// 5. Acceptance Timeout
// =============================================

/**
 * Start a countdown (ACCEPTANCE_TIMEOUT_SEC) for the pro to respond.
 * If no response within the window, auto-cancel the order.
 */
export function startAcceptanceTimeout(orderId: string): void {
  // Clear any existing timeout for this order
  clearAcceptanceTimeout(orderId);

  const handle = setTimeout(async () => {
    activeTimeouts.delete(orderId);

    // Fetch current order state to verify it is still pending
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, pro_id')
      .eq('id', orderId)
      .single();

    if (error || !order) return;

    // Only auto-cancel if the order is still in a 'requested' state
    if (
      order.status === ORDER_STATUS.REQUESTED ||
      order.status === ORDER_STATUS.REQUESTED_EXPANDED
    ) {
      await updateOrderStatus(
        orderId,
        ORDER_STATUS.AUTO_CANCELLED_NO_RESPONSE,
      );
    }
  }, MATCHING.ACCEPTANCE_TIMEOUT_SEC * 1000);

  activeTimeouts.set(orderId, handle);
}

/**
 * Cancel a pending acceptance timeout.
 */
export function clearAcceptanceTimeout(orderId: string): void {
  const handle = activeTimeouts.get(orderId);
  if (handle) {
    clearTimeout(handle);
    activeTimeouts.delete(orderId);
  }
}

// =============================================
// 6. Realtime Subscription
// =============================================

/**
 * Subscribe to realtime status changes on a specific order.
 * Returns an unsubscribe function that cleans up the channel.
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (update: OrderUpdate) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`order-updates-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        callback({
          id: row.id as string,
          status: row.status as OrderStatus,
          pro_id: (row.pro_id as string) ?? null,
          requested_at: (row.requested_at as string) ?? null,
          accepted_at: (row.accepted_at as string) ?? null,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =============================================
// Internal Helpers
// =============================================

/**
 * Update the status column on an order.
 */
async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error(
      `[matching] Failed to update order ${orderId} to ${status}:`,
      error.message,
    );
  }
}

/**
 * Assign a pro to an order, set status to 'requested', and record requested_at.
 */
async function assignProToOrder(
  orderId: string,
  proId: string,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('orders')
    .update({
      pro_id: proId,
      status: ORDER_STATUS.REQUESTED,
      requested_at: now,
    })
    .eq('id', orderId);

  if (error) {
    console.error('[matching] Failed to assign pro to order:', error.message);
  }
}

/**
 * After a pro rejects, fetch the order's location, re-rank, and assign the
 * next best pro. If no pros remain, auto-cancel the order.
 */
async function tryNextPro(
  orderId: string,
  rejectedProId: string,
): Promise<void> {
  // Fetch order to get customer location and current search radius
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, customer_lat, customer_lng')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('[matching] Failed to fetch order for re-match:', orderError?.message);
    return;
  }

  // Determine radius based on whether we already expanded
  const radius =
    order.status === ORDER_STATUS.REQUESTED_EXPANDED
      ? MATCHING.EXPANDED_RADIUS_KM
      : MATCHING.BASE_RADIUS_KM;

  // Fetch all currently-rejected pro IDs for this order
  const { data: rejections } = await supabase
    .from('order_rejections')
    .select('pro_id')
    .eq('order_id', orderId);

  const rejectedIds = new Set<string>(
    (rejections ?? []).map((r) => r.pro_id as string),
  );
  rejectedIds.add(rejectedProId);

  // Record this rejection
  await supabase.from('order_rejections').insert({
    order_id: orderId,
    pro_id: rejectedProId,
  });

  // Re-rank and filter out all rejected pros
  const rankedPros = await fetchRankedPros(
    order.customer_lat,
    order.customer_lng,
    radius,
  );

  const available = rankedPros.filter((p) => !rejectedIds.has(p.id));

  if (available.length === 0) {
    await updateOrderStatus(orderId, ORDER_STATUS.AUTO_CANCELLED_NO_PRO);
    return;
  }

  // Assign next best pro
  const nextPro = available[0];
  await assignProToOrder(orderId, nextPro.id);
  await sendProRequest(orderId, nextPro.id);
  startAcceptanceTimeout(orderId);
}
