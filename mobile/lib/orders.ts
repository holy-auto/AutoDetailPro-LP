import { supabase } from './supabase';
import { processCancellation } from './stripe';
import {
  ORDER_STATUS,
  CANCELLATION,
  COMPLETION,
  type OrderStatus,
  type PaymentMethod,
} from '@/constants/business-rules';

// =============================================
// Order Lifecycle Management
// =============================================
// Full state machine: draft → payment_authorized → requested → accepted
//   → on_the_way → arrived → in_progress → pro_marked_done
//   → completed / auto_completed
// Also handles: cancellation, disputes, realtime subscriptions.

// --- Result type ---

type Result<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// --- Valid state transitions ---

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.PAYMENT_AUTHORIZED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_AUTHORIZED]: [
    ORDER_STATUS.REQUESTED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.REQUESTED]: [
    ORDER_STATUS.REQUESTED_EXPANDED,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.AUTO_CANCELLED_NO_PRO,
  ],
  [ORDER_STATUS.REQUESTED_EXPANDED]: [
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.AUTO_CANCELLED_NO_PRO,
  ],
  [ORDER_STATUS.ACCEPTED]: [
    ORDER_STATUS.ON_THE_WAY,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.CANCELLED_WITH_FEE_30_50,
  ],
  [ORDER_STATUS.ON_THE_WAY]: [
    ORDER_STATUS.ARRIVED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.CANCELLED_WITH_FEE_30_50,
  ],
  [ORDER_STATUS.ARRIVED]: [
    ORDER_STATUS.IN_PROGRESS,
    ORDER_STATUS.CANCELLED_WITH_FEE_100,
  ],
  [ORDER_STATUS.IN_PROGRESS]: [
    ORDER_STATUS.PRO_MARKED_DONE,
    ORDER_STATUS.CANCELLED_WITH_FEE_100,
  ],
  [ORDER_STATUS.PRO_MARKED_DONE]: [
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.AUTO_COMPLETED,
    ORDER_STATUS.DISPUTE_OPEN,
  ],
  [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.REVIEW_OPEN, ORDER_STATUS.DISPUTE_OPEN, ORDER_STATUS.CLOSED],
  [ORDER_STATUS.AUTO_COMPLETED]: [ORDER_STATUS.REVIEW_OPEN, ORDER_STATUS.DISPUTE_OPEN, ORDER_STATUS.CLOSED],
  [ORDER_STATUS.REVIEW_OPEN]: [ORDER_STATUS.DISPUTE_OPEN, ORDER_STATUS.CLOSED],
  [ORDER_STATUS.DISPUTE_OPEN]: [
    ORDER_STATUS.PARTIALLY_REFUNDED,
    ORDER_STATUS.FULLY_REFUNDED,
    ORDER_STATUS.DISPUTE_REJECTED,
  ],
  [ORDER_STATUS.PARTIALLY_REFUNDED]: [ORDER_STATUS.CLOSED],
  [ORDER_STATUS.FULLY_REFUNDED]: [ORDER_STATUS.CLOSED],
  [ORDER_STATUS.DISPUTE_REJECTED]: [ORDER_STATUS.CLOSED],
};

function isTransitionAllowed(from: string, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// --- 1. Create a draft order ---

export async function createOrder(
  customerId: string,
  menuIds: string[],
  paymentMethod: PaymentMethod,
  amount: number,
  location: { lat: number; lng: number; address?: string }
): Promise<Result<{ orderId: string }>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        menu_ids: menuIds,
        payment_method: paymentMethod,
        amount,
        location_lat: location.lat,
        location_lng: location.lng,
        location_address: location.address ?? null,
        status: ORDER_STATUS.DRAFT,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { orderId: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 2. Authorize payment ---

export async function authorizePayment(
  orderId: string,
  stripePaymentIntentId?: string
): Promise<Result<{ orderId: string }>> {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (order.status !== ORDER_STATUS.DRAFT) {
      return { success: false, error: `Cannot authorize payment: order is "${order.status}", expected "draft"` };
    }

    const updatePayload: Record<string, unknown> = {
      status: ORDER_STATUS.PAYMENT_AUTHORIZED,
      payment_authorized_at: new Date().toISOString(),
    };
    if (stripePaymentIntentId) {
      updatePayload.stripe_payment_intent_id = stripePaymentIntentId;
    }

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: { orderId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 3. Generic status transition ---

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  extra?: Record<string, unknown>
): Promise<Result<{ orderId: string; status: OrderStatus }>> {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    if (!isTransitionAllowed(order.status, newStatus)) {
      return {
        success: false,
        error: `Invalid transition: "${order.status}" → "${newStatus}"`,
      };
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...extra,
      })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: { orderId, status: newStatus } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 4. Pro departure ---

export async function handleProDeparture(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  const result = await updateOrderStatus(orderId, ORDER_STATUS.ON_THE_WAY, {
    pro_departed_at: new Date().toISOString(),
  });
  if (!result.success) return result;
  return { success: true, data: { orderId } };
}

// --- 5. Pro arrival ---

export async function handleProArrival(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  const result = await updateOrderStatus(orderId, ORDER_STATUS.ARRIVED, {
    arrived_at: new Date().toISOString(),
  });
  if (!result.success) return result;
  return { success: true, data: { orderId } };
}

// --- 6. Start work ---

export async function startWork(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  const result = await updateOrderStatus(orderId, ORDER_STATUS.IN_PROGRESS, {
    started_at: new Date().toISOString(),
  });
  if (!result.success) return result;
  return { success: true, data: { orderId } };
}

// --- 7. Pro marks done ---

export async function proMarkDone(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  const result = await updateOrderStatus(orderId, ORDER_STATUS.PRO_MARKED_DONE, {
    pro_completed_at: new Date().toISOString(),
  });
  if (!result.success) return result;
  return { success: true, data: { orderId } };
}

// --- 8. Customer confirms completion ---

export async function customerConfirm(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  const now = new Date().toISOString();
  const result = await updateOrderStatus(orderId, ORDER_STATUS.COMPLETED, {
    customer_confirmed_at: now,
    completed_at: now,
  });
  if (!result.success) return result;
  return { success: true, data: { orderId } };
}

// --- 9. Cancel order ---

type CancelledBy = 'customer' | 'pro' | 'system';

export async function cancelOrder(
  orderId: string,
  cancelledBy: CancelledBy
): Promise<Result<{ feePercent: number; feeAmount: number; status: string }>> {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status, amount, payment_method, stripe_payment_intent_id')
      .eq('id', orderId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    // Determine fee tier based on current status
    const beforeAcceptance: string[] = [
      ORDER_STATUS.DRAFT,
      ORDER_STATUS.PAYMENT_AUTHORIZED,
      ORDER_STATUS.REQUESTED,
      ORDER_STATUS.REQUESTED_EXPANDED,
    ];
    const afterAcceptanceBeforeArrival: string[] = [
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.ON_THE_WAY,
    ];
    const afterArrival: string[] = [
      ORDER_STATUS.ARRIVED,
      ORDER_STATUS.IN_PROGRESS,
    ];

    const allCancellable = [
      ...beforeAcceptance,
      ...afterAcceptanceBeforeArrival,
      ...afterArrival,
    ];
    if (!allCancellable.includes(order.status)) {
      return {
        success: false,
        error: `Order cannot be cancelled in status "${order.status}"`,
      };
    }

    // Calculate fee
    let feePercent = 0;
    if (beforeAcceptance.includes(order.status)) {
      feePercent = CANCELLATION.BEFORE_ACCEPTANCE.fee_percent;
    } else if (afterAcceptanceBeforeArrival.includes(order.status)) {
      feePercent = CANCELLATION.AFTER_ACCEPTANCE_BEFORE_ARRIVAL.default_percent;
    } else if (afterArrival.includes(order.status)) {
      feePercent = CANCELLATION.AFTER_ARRIVAL.fee_percent;
    }

    const feeAmount = Math.round(order.amount * (feePercent / 100));

    // Determine new status
    const newStatus =
      feePercent === 0
        ? ORDER_STATUS.CANCELLED
        : feePercent === 100
          ? ORDER_STATUS.CANCELLED_WITH_FEE_100
          : ORDER_STATUS.CANCELLED_WITH_FEE_30_50;

    // Process payment side-effects via Stripe module
    try {
      await processCancellation({
        orderId,
        paymentIntentId: order.stripe_payment_intent_id ?? null,
        paymentMethod: order.payment_method,
        totalAmount: order.amount,
        orderStatus: order.status,
      });
    } catch (paymentErr) {
      // processCancellation already updates the order row; if it threw,
      // we still record the cancellation in DB below as a safety net.
    }

    // Ensure order row reflects the cancellation
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        cancelled_by: cancelledBy,
        cancellation_fee: feeAmount,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true, data: { feePercent, feeAmount, status: newStatus } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 10. Schedule auto-complete ---

export async function scheduleAutoComplete(
  orderId: string
): Promise<Result<{ scheduledAt: string }>> {
  try {
    const timeoutMs = COMPLETION.CONFIRMATION_TIMEOUT_MIN * 60 * 1000;
    const scheduledAt = new Date(Date.now() + timeoutMs).toISOString();

    // Invoke a Supabase Edge Function that will run after the timeout.
    // The edge function is responsible for checking that the order is still
    // in "pro_marked_done" status before transitioning to "auto_completed".
    const { error } = await supabase.functions.invoke('schedule-auto-complete', {
      body: {
        order_id: orderId,
        execute_at: scheduledAt,
        timeout_min: COMPLETION.CONFIRMATION_TIMEOUT_MIN,
      },
    });

    if (error) return { success: false, error: error.message };

    // Persist the scheduled time so the client can show a countdown
    await supabase
      .from('orders')
      .update({ auto_complete_scheduled_at: scheduledAt })
      .eq('id', orderId);

    return { success: true, data: { scheduledAt } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Called by the Edge Function (or a local timer in dev) when the auto-complete
 * timeout fires. Transitions the order only if it is still in pro_marked_done.
 */
export async function executeAutoComplete(
  orderId: string
): Promise<Result<{ orderId: string }>> {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    // Only auto-complete if the customer has not already confirmed or disputed
    if (order.status !== ORDER_STATUS.PRO_MARKED_DONE) {
      return {
        success: false,
        error: `Order is "${order.status}", skipping auto-complete`,
      };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.AUTO_COMPLETED,
        completed_at: now,
        updated_at: now,
      })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: { orderId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 11. Open dispute ---

export async function openDispute(
  orderId: string,
  customerId: string,
  reason: string,
  evidenceUrls: string[]
): Promise<Result<{ disputeId: string }>> {
  try {
    // Fetch order to validate dispute eligibility
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status, completed_at')
      .eq('id', orderId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    // Only completed / auto_completed orders can be disputed
    const disputeEligible: string[] = [
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.AUTO_COMPLETED,
      ORDER_STATUS.REVIEW_OPEN,
    ];
    if (!disputeEligible.includes(order.status)) {
      return {
        success: false,
        error: `Cannot open dispute: order is "${order.status}"`,
      };
    }

    // Enforce the 24-hour dispute window
    if (order.completed_at) {
      const completedMs = new Date(order.completed_at).getTime();
      const windowMs = COMPLETION.DISPUTE_WINDOW_HOURS * 60 * 60 * 1000;
      if (Date.now() - completedMs > windowMs) {
        return {
          success: false,
          error: `Dispute window has expired (${COMPLETION.DISPUTE_WINDOW_HOURS}h after completion)`,
        };
      }
    }

    // Create dispute record
    const { data: dispute, error: insertErr } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        reason,
        evidence_urls: evidenceUrls,
        status: 'open',
        opened_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.DISPUTE_OPEN,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return { success: true, data: { disputeId: dispute.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// --- 12. Realtime subscription ---

export type OrderChangePayload = {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
  raw: Record<string, unknown>;
};

/**
 * Subscribe to realtime changes on a specific order.
 * Returns an object with an `unsubscribe` method.
 */
export function subscribeToOrder(
  orderId: string,
  callback: (payload: OrderChangePayload) => void
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes' as any,
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload: any) => {
        const row = payload.new as Record<string, unknown>;
        callback({
          orderId: row.id as string,
          status: row.status as OrderStatus,
          updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
          raw: row,
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
