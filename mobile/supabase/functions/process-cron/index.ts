// supabase/functions/process-cron/index.ts
// Edge Function: Scheduled tasks runner (called by pg_cron or Supabase Cron)
// Handles: auto-cancel, auto-complete, subscription processing,
//          scheduled booking conversion, improvement plan evaluation, boost expiry,
//          quality audit expiry

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const results: Record<string, any> = {};

  // ========================================
  // 1. Auto-cancel orders with no pro response (5 min)
  // ========================================
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'auto_cancelled_no_response',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'system',
      })
      .in('status', ['requested', 'requested_expanded'])
      .lt('requested_at', fiveMinAgo)
      .select('id');

    results.auto_cancel = { cancelled: data?.length ?? 0, error: error?.message };
  } catch (e) {
    results.auto_cancel = { error: (e as Error).message };
  }

  // ========================================
  // 2. Auto-complete unconfirmed orders (30 min after pro done)
  // ========================================
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'auto_completed',
        auto_completed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('status', 'pro_marked_done')
      .lt('pro_completed_at', thirtyMinAgo)
      .select('id');

    results.auto_complete = { completed: data?.length ?? 0, error: error?.message };
  } catch (e) {
    results.auto_complete = { error: (e as Error).message };
  }

  // ========================================
  // 3. Process subscriptions (create orders for today's bookings)
  // ========================================
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: subs, error: subErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('next_booking_date', today);

    if (!subErr && subs?.length) {
      let processed = 0;
      for (const sub of subs) {
        // Create order from subscription
        const { error: orderErr } = await supabase.from('orders').insert({
          customer_id: sub.customer_id,
          menu_id: sub.menu_ids?.[0] ?? null,
          payment_method: 'online',
          amount: Math.round(sub.total_amount * (1 - sub.discount_percent / 100)),
          customer_latitude: sub.customer_latitude,
          customer_longitude: sub.customer_longitude,
          status: 'draft',
        });

        if (!orderErr) {
          // Advance next booking date
          const plan = getSubscriptionPlan(sub.plan_id);
          if (plan) {
            const nextDate = new Date(sub.next_booking_date);
            nextDate.setDate(nextDate.getDate() + plan.intervalDays);
            await supabase
              .from('subscriptions')
              .update({
                next_booking_date: nextDate.toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
              })
              .eq('id', sub.id);
          }
          processed++;
        }
      }
      results.subscriptions = { found: subs.length, processed };
    } else {
      results.subscriptions = { found: 0 };
    }
  } catch (e) {
    results.subscriptions = { error: (e as Error).message };
  }

  // ========================================
  // 4. Convert scheduled bookings to orders
  // ========================================
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowHour = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      hour12: false,
    });

    const { data: bookings, error: bookErr } = await supabase
      .from('scheduled_bookings')
      .select('*')
      .eq('status', 'confirmed')
      .eq('scheduled_date', today)
      .lte('scheduled_time', `${nowHour}:59`);

    if (!bookErr && bookings?.length) {
      let converted = 0;
      for (const booking of bookings) {
        const { data: newOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            customer_id: booking.customer_id,
            pro_id: booking.pro_id,
            payment_method: 'online',
            amount: booking.amount,
            customer_latitude: booking.customer_latitude,
            customer_longitude: booking.customer_longitude,
            customer_address: booking.customer_address,
            status: 'payment_authorized',
          })
          .select('id')
          .single();

        if (!orderErr && newOrder) {
          await supabase
            .from('scheduled_bookings')
            .update({ status: 'converted', order_id: newOrder.id })
            .eq('id', booking.id);
          converted++;
        }
      }
      results.scheduled_bookings = { found: bookings.length, converted };
    } else {
      results.scheduled_bookings = { found: 0 };
    }
  } catch (e) {
    results.scheduled_bookings = { error: (e as Error).message };
  }

  // ========================================
  // 5. Evaluate improvement plans
  // ========================================
  try {
    const { data: plans, error: planErr } = await supabase
      .from('improvement_plans')
      .select('*, pro_profiles!inner(id)')
      .in('status', ['active', 'extended'])
      .lte('evaluation_at', new Date().toISOString());

    if (!planErr && plans?.length) {
      let passed = 0, failed = 0, extended = 0;
      for (const plan of plans) {
        // Get current rating
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('target_id', plan.pro_id)
          .gte('created_at', plan.started_at);

        const avgRating = reviews?.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        const orderCount = reviews?.length ?? 0;

        if (avgRating >= plan.target_rating && orderCount >= 5) {
          // Passed
          await supabase.from('improvement_plans').update({
            status: 'passed', rating_at_end: avgRating,
            orders_completed: orderCount, resolved_at: new Date().toISOString(),
          }).eq('id', plan.id);
          await supabase.from('pro_profiles').update({
            improvement_status: 'passed', improvement_started_at: null,
          }).eq('id', plan.pro_id);
          passed++;
        } else if (plan.extension_count < 1) {
          // Extend
          const newEval = new Date();
          newEval.setDate(newEval.getDate() + 30);
          await supabase.from('improvement_plans').update({
            status: 'extended', extension_count: plan.extension_count + 1,
            evaluation_at: newEval.toISOString(),
          }).eq('id', plan.id);
          await supabase.from('pro_profiles').update({
            improvement_status: 'extended',
            improvement_extension_count: plan.extension_count + 1,
          }).eq('id', plan.pro_id);
          extended++;
        } else {
          // Failed → force removal
          const cooldownUntil = new Date();
          cooldownUntil.setDate(cooldownUntil.getDate() + 90);
          await supabase.from('improvement_plans').update({
            status: 'failed', rating_at_end: avgRating,
            orders_completed: orderCount, resolved_at: new Date().toISOString(),
          }).eq('id', plan.id);
          await supabase.from('pro_profiles').update({
            improvement_status: 'failed', suspended: true,
            removed_at: new Date().toISOString(),
            removal_reason: '改善プラン未達成',
            removal_cooldown_until: cooldownUntil.toISOString(),
          }).eq('id', plan.pro_id);
          failed++;
        }
      }
      results.improvement_plans = { evaluated: plans.length, passed, extended, failed };
    } else {
      results.improvement_plans = { evaluated: 0 };
    }
  } catch (e) {
    results.improvement_plans = { error: (e as Error).message };
  }

  // ========================================
  // 6. Expire boosts
  // ========================================
  try {
    const now = new Date().toISOString();
    const { data: expired } = await supabase
      .from('boost_purchases')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', now)
      .select('pro_id');

    if (expired?.length) {
      for (const b of expired) {
        await supabase.from('pro_profiles').update({
          boost_plan_id: null, boost_started_at: null, boost_expires_at: null,
        }).eq('id', b.pro_id);
      }
    }
    results.boost_expiry = { expired: expired?.length ?? 0 };
  } catch (e) {
    results.boost_expiry = { error: (e as Error).message };
  }

  // ========================================
  // 7. Expire quality audits (48h timeout)
  // ========================================
  try {
    const now = new Date().toISOString();
    const { data: expiredAudits } = await supabase
      .from('quality_audits')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', now)
      .select('id');

    results.quality_audit_expiry = { expired: expiredAudits?.length ?? 0 };
  } catch (e) {
    results.quality_audit_expiry = { error: (e as Error).message };
  }

  // ========================================
  // 8. Expire ads past their end date
  // ========================================
  try {
    const now = new Date().toISOString();
    const { data: expiredAds } = await supabase
      .from('ads')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', now)
      .select('id');

    results.ad_expiry = { expired: expiredAds?.length ?? 0 };
  } catch (e) {
    results.ad_expiry = { error: (e as Error).message };
  }

  return new Response(
    JSON.stringify({ ok: true, timestamp: new Date().toISOString(), results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});

// Helper: get subscription plan config
function getSubscriptionPlan(planId: string) {
  const plans: Record<string, { intervalDays: number }> = {
    weekly: { intervalDays: 7 },
    bi_weekly: { intervalDays: 14 },
    monthly: { intervalDays: 30 },
    bi_monthly: { intervalDays: 60 },
  };
  return plans[planId] ?? null;
}
