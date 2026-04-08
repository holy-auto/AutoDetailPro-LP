// supabase/functions/match-pro/index.ts
// Edge Function: Find and assign the best available pro for an order
// Called when customer requests a pro (status: payment_authorized → requested)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  order_id: string;
  customer_lat: number;
  customer_lng: number;
  radius_km?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { order_id, customer_lat, customer_lng, radius_km = 15 }: MatchRequest =
      await req.json();

    // 1. Verify order exists and is in correct state
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (order.status !== 'payment_authorized') {
      return new Response(
        JSON.stringify({ error: `Invalid order status: ${order.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Find online, non-suspended pros
    const { data: pros, error: prosErr } = await supabase
      .from('pro_profiles')
      .select(`
        id, latitude, longitude, created_at,
        response_rate, completion_rate,
        boost_plan_id, boost_expires_at,
        improvement_status,
        profiles!inner(full_name)
      `)
      .eq('is_online', true)
      .eq('suspended', false);

    if (prosErr || !pros?.length) {
      // No pros available — auto cancel
      await supabase.from('orders').update({
        status: 'auto_cancelled_no_pro',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'system',
      }).eq('id', order_id);

      return new Response(
        JSON.stringify({ matched: false, reason: 'no_pros_available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Filter by distance and calculate scores
    const now = new Date();
    const rankedPros = pros
      .map((pro) => {
        if (!pro.latitude || !pro.longitude) return null;
        const dist = haversineKm(customer_lat, customer_lng, pro.latitude, pro.longitude);
        if (dist > radius_km) return null;

        const daysSinceCreation = Math.floor(
          (now.getTime() - new Date(pro.created_at).getTime()) / 86400000,
        );
        const isNewcomer = daysSinceCreation <= 30;
        const boostActive =
          !!pro.boost_plan_id &&
          !!pro.boost_expires_at &&
          new Date(pro.boost_expires_at) > now;

        // Score calculation (mirrors client-side ranking.ts)
        let score = 0;
        // Rating placeholder (will be filled below)
        score += Math.max(0, 1 - dist / 15) * 25; // distance
        score += (pro.response_rate ?? 0.9) * 15;
        score += (pro.completion_rate ?? 0.95) * 10;
        if (isNewcomer) score += 50 * (1 - daysSinceCreation / 30);
        if (boostActive) score += 30;
        if (pro.improvement_status === 'active') score -= 20;

        return { ...pro, distance: dist, score };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    // 4. Try expanded radius if no match
    if (rankedPros.length === 0 && radius_km < 30) {
      // Update status to expanded search
      await supabase.from('orders').update({
        status: 'requested_expanded',
        matching_radius_km: 30,
      }).eq('id', order_id);

      // Recursive call with expanded radius
      const expandedPros = pros
        .map((pro) => {
          if (!pro.latitude || !pro.longitude) return null;
          const dist = haversineKm(customer_lat, customer_lng, pro.latitude, pro.longitude);
          if (dist > 30) return null;
          return { ...pro, distance: dist, score: 0 };
        })
        .filter(Boolean);

      if (expandedPros.length === 0) {
        await supabase.from('orders').update({
          status: 'auto_cancelled_no_pro',
          cancelled_at: new Date().toISOString(),
          cancelled_by: 'system',
        }).eq('id', order_id);

        return new Response(
          JSON.stringify({ matched: false, reason: 'no_pros_in_expanded_radius' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // 5. Assign best pro
    const bestPro = rankedPros[0] as any;
    if (!bestPro) {
      await supabase.from('orders').update({
        status: 'auto_cancelled_no_pro',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'system',
      }).eq('id', order_id);

      return new Response(
        JSON.stringify({ matched: false, reason: 'no_pros_matched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 6. Update order with matched pro
    const { error: updateErr } = await supabase.from('orders').update({
      pro_id: bestPro.id,
      status: 'requested',
      requested_at: new Date().toISOString(),
      matching_radius_km: radius_km,
    }).eq('id', order_id);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to update order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 7. Return match result
    return new Response(
      JSON.stringify({
        matched: true,
        pro_id: bestPro.id,
        pro_name: (bestPro.profiles as any)?.full_name,
        distance_km: Math.round(bestPro.distance * 10) / 10,
        score: bestPro.score,
        // List of backup pros for fallback if this pro rejects
        backup_pro_ids: rankedPros.slice(1, 4).map((p: any) => p.id),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
