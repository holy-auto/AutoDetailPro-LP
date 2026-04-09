import { supabase } from './supabase';
import {
  SUBSCRIPTION,
  type SubscriptionPlanId,
} from '@/constants/business-rules';

// =============================================
// Subscriptions (定期コース) — Auto-processing
// =============================================

type MutationResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPlan(planId: SubscriptionPlanId) {
  return SUBSCRIPTION.PLANS.find((p) => p.id === planId);
}

/** Add `days` to a Date and return an ISO date string (YYYY-MM-DD). */
function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** Today in YYYY-MM-DD (UTC). */
function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// 1. createSubscription
// ---------------------------------------------------------------------------

export async function createSubscription(
  customerId: string,
  planId: SubscriptionPlanId,
  menuIds: string[],
  totalAmount: number,
  location: { latitude: number; longitude: number },
): Promise<MutationResult> {
  const plan = getPlan(planId);
  if (!plan) {
    return { success: false, error: `Unknown plan: ${planId}` };
  }

  const discountedAmount = Math.round(
    totalAmount * (1 - plan.discount / 100),
  );
  const nextBookingDate = addDays(new Date(), plan.intervalDays);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: customerId,
      plan_id: planId,
      menu_ids: menuIds,
      total_amount: discountedAmount,
      discount_percent: plan.discount,
      next_booking_date: nextBookingDate,
      customer_latitude: location.latitude,
      customer_longitude: location.longitude,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// 2. pauseSubscription / resumeSubscription
// ---------------------------------------------------------------------------

export async function pauseSubscription(
  subscriptionId: string,
): Promise<MutationResult> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId)
    .eq('status', 'active')
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function resumeSubscription(
  subscriptionId: string,
): Promise<MutationResult> {
  // Fetch current subscription to recalculate the next booking date
  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('status', 'paused')
    .single();

  if (fetchError || !sub) {
    return {
      success: false,
      error: fetchError?.message ?? 'Subscription not found or not paused',
    };
  }

  const plan = getPlan(sub.plan_id as SubscriptionPlanId);
  if (!plan) {
    return { success: false, error: `Unknown plan: ${sub.plan_id}` };
  }

  // Set the next booking date relative to today
  const nextBookingDate = addDays(new Date(), plan.intervalDays);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      next_booking_date: nextBookingDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// 3. cancelSubscription
// ---------------------------------------------------------------------------

export async function cancelSubscription(
  subscriptionId: string,
): Promise<MutationResult> {
  // Fetch subscription to check cancel window
  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (fetchError || !sub) {
    return {
      success: false,
      error: fetchError?.message ?? 'Subscription not found',
    };
  }

  if (sub.status === 'cancelled') {
    return { success: false, error: 'Subscription is already cancelled' };
  }

  // Check if within the 48-hour cancel window before next booking
  const nextBooking = new Date(sub.next_booking_date);
  const now = new Date();
  const hoursUntilBooking =
    (nextBooking.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking < SUBSCRIPTION.CANCEL_BEFORE_HOURS) {
    return {
      success: false,
      error: `キャンセルは次回予約日の${SUBSCRIPTION.CANCEL_BEFORE_HOURS}時間前までです`,
    };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// 4. processSubscriptions (cron / Edge Function)
// ---------------------------------------------------------------------------

/**
 * Find all active subscriptions where next_booking_date = today,
 * auto-create an order for each, and advance next_booking_date.
 */
export async function processSubscriptions(): Promise<MutationResult> {
  const today = todayDate();

  const { data: subs, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('next_booking_date', today);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!subs || subs.length === 0) {
    return { success: true, data: { processed: 0 } };
  }

  const results: { subscriptionId: string; orderId?: string; error?: string }[] = [];

  for (const sub of subs) {
    try {
      // Auto-create an order from the subscription
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: sub.customer_id,
          pro_id: sub.pro_id ?? undefined,
          menu_id: sub.menu_ids?.[0] ?? null,
          status: 'payment_authorized',
          payment_method: 'online',
          amount: sub.total_amount,
          customer_latitude: sub.customer_latitude,
          customer_longitude: sub.customer_longitude,
        })
        .select()
        .single();

      if (orderError) {
        results.push({ subscriptionId: sub.id, error: orderError.message });
        continue;
      }

      // Advance next_booking_date by plan interval
      const plan = getPlan(sub.plan_id as SubscriptionPlanId);
      if (!plan) {
        results.push({ subscriptionId: sub.id, error: `Unknown plan: ${sub.plan_id}` });
        continue;
      }

      const nextDate = addDays(new Date(sub.next_booking_date), plan.intervalDays);

      await supabase
        .from('subscriptions')
        .update({
          next_booking_date: nextDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      results.push({ subscriptionId: sub.id, orderId: order.id });
    } catch (err: any) {
      results.push({ subscriptionId: sub.id, error: err.message });
    }
  }

  return { success: true, data: { processed: results.length, results } };
}

// ---------------------------------------------------------------------------
// 5. getMySubscriptions
// ---------------------------------------------------------------------------

export async function getMySubscriptions(customerId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false as const, error: error.message };
  }

  // Enrich with plan metadata
  const enriched = (data ?? []).map((sub) => {
    const plan = getPlan(sub.plan_id as SubscriptionPlanId);
    return {
      ...sub,
      plan_name: plan?.name ?? sub.plan_id,
      interval_days: plan?.intervalDays ?? null,
      discount_label: plan?.label ?? null,
    };
  });

  return { success: true as const, data: enriched };
}
