import { supabase } from './supabase';
import { logAudit } from './audit';
import {
  BUSINESS_HOURS,
  PRO_RANKING,
  PRO_BOOST,
  IMPROVEMENT_STATUS,
  type BoostPlanId,
} from '@/constants/business-rules';

// =============================================
// Pro Management — Accounts, Improvement Plans, Business Hours
// =============================================

type MutationResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Current Date object in Asia/Tokyo. */
function tokyoNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: BUSINESS_HOURS.TIMEZONE }),
  );
}

function getBoostPlan(planId: string) {
  return PRO_BOOST.PLANS.find((p) => p.id === planId);
}

// ---------------------------------------------------------------------------
// 1. isWithinBusinessHours
// ---------------------------------------------------------------------------

/** Check whether the current JST time is between 08:00 and 20:00. */
export function isWithinBusinessHours(): boolean {
  const now = tokyoNow();
  const hour = now.getHours();
  return hour >= BUSINESS_HOURS.OPEN_HOUR && hour < BUSINESS_HOURS.CLOSE_HOUR;
}

// ---------------------------------------------------------------------------
// 2. getTimeUntilClose
// ---------------------------------------------------------------------------

/** Returns milliseconds until 20:00 JST. Returns 0 if already past close. */
export function getTimeUntilClose(): number {
  const now = tokyoNow();
  const close = new Date(now);
  close.setHours(BUSINESS_HOURS.CLOSE_HOUR, 0, 0, 0);

  const diff = close.getTime() - now.getTime();
  return diff > 0 ? diff : 0;
}

// ---------------------------------------------------------------------------
// 3. toggleProOnline
// ---------------------------------------------------------------------------

export async function toggleProOnline(
  proId: string,
  online: boolean,
  coords?: { latitude: number; longitude: number },
): Promise<MutationResult> {
  // Block going online outside business hours
  if (online && BUSINESS_HOURS.BLOCK_OUTSIDE_HOURS && !isWithinBusinessHours()) {
    return {
      success: false,
      error: `営業時間外です（${BUSINESS_HOURS.OPEN_HOUR}:00〜${BUSINESS_HOURS.CLOSE_HOUR}:00）`,
    };
  }

  const update: Record<string, unknown> = {
    is_online: online,
  };

  if (online && coords) {
    update.latitude = coords.latitude;
    update.longitude = coords.longitude;
    update.location_updated_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('pro_profiles')
    .update(update)
    .eq('id', proId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    action: online ? 'pro.online' : 'pro.offline',
    resourceType: 'pro_profile',
    resourceId: proId,
    metadata: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined,
  });

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// 4. purchaseBoost
// ---------------------------------------------------------------------------

export async function purchaseBoost(
  proId: string,
  planId: BoostPlanId,
  stripePaymentIntentId?: string,
): Promise<MutationResult> {
  const plan = getBoostPlan(planId);
  if (!plan) {
    return { success: false, error: `Unknown boost plan: ${planId}` };
  }

  // Check concurrent boost limit
  const { data: existing, error: checkError } = await supabase
    .from('boost_purchases')
    .select('id')
    .eq('pro_id', proId)
    .eq('status', 'active');

  if (checkError) {
    return { success: false, error: checkError.message };
  }

  if (existing && existing.length >= PRO_BOOST.MAX_CONCURRENT_BOOSTS) {
    return { success: false, error: '既にブーストが有効です' };
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

  // Create boost purchase record
  const { data: purchase, error: insertError } = await supabase
    .from('boost_purchases')
    .insert({
      pro_id: proId,
      plan_id: planId,
      price: plan.price,
      duration_days: plan.duration_days,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      stripe_payment_intent_id: stripePaymentIntentId ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update pro_profiles with active boost
  const { error: updateError } = await supabase
    .from('pro_profiles')
    .update({
      boost_plan_id: planId,
      boost_started_at: now.toISOString(),
      boost_expires_at: expiresAt.toISOString(),
    })
    .eq('id', proId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, data: purchase };
}

// ---------------------------------------------------------------------------
// 5. startImprovementPlan
// ---------------------------------------------------------------------------

export async function startImprovementPlan(
  proId: string,
  reason: string,
  currentRating: number,
): Promise<MutationResult> {
  const { IMPROVEMENT_PLAN } = PRO_RANKING;

  const now = new Date();
  const evaluationAt = new Date(now);
  evaluationAt.setDate(evaluationAt.getDate() + IMPROVEMENT_PLAN.EVALUATION_PERIOD_DAYS);

  // Create the improvement plan record
  const { data: plan, error: insertError } = await supabase
    .from('improvement_plans')
    .insert({
      pro_id: proId,
      reason,
      rating_at_start: currentRating,
      target_rating: IMPROVEMENT_PLAN.TARGET_RATING,
      started_at: now.toISOString(),
      evaluation_at: evaluationAt.toISOString(),
      status: IMPROVEMENT_STATUS.ACTIVE,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update pro_profiles to reflect improvement status
  const { error: updateError } = await supabase
    .from('pro_profiles')
    .update({
      improvement_status: IMPROVEMENT_STATUS.ACTIVE,
      improvement_started_at: now.toISOString(),
      improvement_extension_count: 0,
    })
    .eq('id', proId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, data: plan };
}

// ---------------------------------------------------------------------------
// 6. evaluateAllImprovementPlans (batch — called by cron)
// ---------------------------------------------------------------------------

export async function evaluateAllImprovementPlans(): Promise<MutationResult> {
  const { IMPROVEMENT_PLAN, FORCED_REMOVAL } = PRO_RANKING;
  const now = new Date().toISOString();

  // Fetch all plans due for evaluation
  const { data: plans, error: fetchError } = await supabase
    .from('improvement_plans')
    .select('*')
    .in('status', [IMPROVEMENT_STATUS.ACTIVE, IMPROVEMENT_STATUS.EXTENDED])
    .lte('evaluation_at', now);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!plans || plans.length === 0) {
    return { success: true, data: { evaluated: 0 } };
  }

  const results: { planId: string; proId: string; outcome: string }[] = [];

  for (const plan of plans) {
    // Get the pro's average rating during the improvement period
    const { data: reviewStats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', plan.pro_id)
      .gte('created_at', plan.started_at);

    const ratings = reviewStats ?? [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;
    const orderCount = ratings.length;

    if (
      avgRating >= IMPROVEMENT_PLAN.TARGET_RATING &&
      orderCount >= IMPROVEMENT_PLAN.MIN_ORDERS_DURING_PLAN
    ) {
      // --- PASSED ---
      await supabase
        .from('improvement_plans')
        .update({
          status: IMPROVEMENT_STATUS.PASSED,
          rating_at_end: avgRating,
          orders_completed: orderCount,
          resolved_at: now,
        })
        .eq('id', plan.id);

      await supabase
        .from('pro_profiles')
        .update({
          improvement_status: IMPROVEMENT_STATUS.PASSED,
          improvement_started_at: null,
        })
        .eq('id', plan.pro_id);

      results.push({ planId: plan.id, proId: plan.pro_id, outcome: 'passed' });
    } else if (plan.extension_count < IMPROVEMENT_PLAN.MAX_EXTENSIONS) {
      // --- EXTEND ---
      const newEvaluation = new Date();
      newEvaluation.setDate(
        newEvaluation.getDate() + IMPROVEMENT_PLAN.EVALUATION_PERIOD_DAYS,
      );

      await supabase
        .from('improvement_plans')
        .update({
          status: IMPROVEMENT_STATUS.EXTENDED,
          extension_count: plan.extension_count + 1,
          evaluation_at: newEvaluation.toISOString(),
        })
        .eq('id', plan.id);

      await supabase
        .from('pro_profiles')
        .update({
          improvement_status: IMPROVEMENT_STATUS.EXTENDED,
          improvement_extension_count: plan.extension_count + 1,
        })
        .eq('id', plan.pro_id);

      results.push({ planId: plan.id, proId: plan.pro_id, outcome: 'extended' });
    } else {
      // --- FAILED → forced removal ---
      await supabase
        .from('improvement_plans')
        .update({
          status: IMPROVEMENT_STATUS.FAILED,
          rating_at_end: avgRating,
          orders_completed: orderCount,
          resolved_at: now,
        })
        .eq('id', plan.id);

      const cooldownUntil = new Date();
      cooldownUntil.setDate(cooldownUntil.getDate() + FORCED_REMOVAL.COOLDOWN_DAYS);

      await supabase
        .from('pro_profiles')
        .update({
          improvement_status: IMPROVEMENT_STATUS.FAILED,
          suspended: true,
          is_online: false,
          removed_at: now,
          removal_reason: '改善プラン未達成による強制退会',
          removal_cooldown_until: cooldownUntil.toISOString(),
        })
        .eq('id', plan.pro_id);

      results.push({ planId: plan.id, proId: plan.pro_id, outcome: 'failed' });
    }
  }

  return { success: true, data: { evaluated: results.length, results } };
}

// ---------------------------------------------------------------------------
// 7. processForceRemoval
// ---------------------------------------------------------------------------

export async function processForceRemoval(
  proId: string,
  reason: string,
): Promise<MutationResult> {
  const now = new Date();
  const cooldownUntil = new Date(now);
  cooldownUntil.setDate(cooldownUntil.getDate() + PRO_RANKING.FORCED_REMOVAL.COOLDOWN_DAYS);

  const { data, error } = await supabase
    .from('pro_profiles')
    .update({
      suspended: true,
      is_online: false,
      removed_at: now.toISOString(),
      removal_reason: reason,
      removal_cooldown_until: cooldownUntil.toISOString(),
    })
    .eq('id', proId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// 8. getProDashboard
// ---------------------------------------------------------------------------

export async function getProDashboard(proId: string) {
  // Fetch all data in parallel
  const [
    profileResult,
    ordersResult,
    reviewsResult,
    boostResult,
    improvementResult,
  ] = await Promise.all([
    // Pro profile
    supabase
      .from('pro_profiles')
      .select('*')
      .eq('id', proId)
      .single(),
    // Completed orders
    supabase
      .from('orders')
      .select('id, amount, completed_at')
      .eq('pro_id', proId)
      .in('status', ['completed', 'auto_completed']),
    // Reviews
    supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', proId),
    // Active boost
    supabase
      .from('boost_purchases')
      .select('*')
      .eq('pro_id', proId)
      .eq('status', 'active')
      .limit(1),
    // Active improvement plan
    supabase
      .from('improvement_plans')
      .select('*')
      .eq('pro_id', proId)
      .in('status', [IMPROVEMENT_STATUS.ACTIVE, IMPROVEMENT_STATUS.EXTENDED])
      .limit(1),
  ]);

  if (profileResult.error) {
    return { success: false as const, error: profileResult.error.message };
  }

  const orders = ordersResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : null;
  const totalEarnings = orders.reduce(
    (sum: number, o: any) => sum + (o.amount ?? 0),
    0,
  );

  const activeBoost = boostResult.data?.[0] ?? null;
  const activePlan = improvementResult.data?.[0] ?? null;

  return {
    success: true as const,
    data: {
      profile: profileResult.data,
      stats: {
        totalOrders: orders.length,
        totalEarnings,
        averageRating: avgRating ? Math.round(avgRating * 100) / 100 : null,
        totalReviews: reviews.length,
      },
      boost: activeBoost
        ? {
            planId: activeBoost.plan_id,
            expiresAt: activeBoost.expires_at,
          }
        : null,
      improvement: activePlan
        ? {
            status: activePlan.status,
            targetRating: activePlan.target_rating,
            evaluationAt: activePlan.evaluation_at,
            extensionCount: activePlan.extension_count,
          }
        : null,
      isOnline: profileResult.data?.is_online ?? false,
      isWithinBusinessHours: isWithinBusinessHours(),
      timeUntilClose: getTimeUntilClose(),
    },
  };
}
