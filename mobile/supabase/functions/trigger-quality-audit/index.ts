// supabase/functions/trigger-quality-audit/index.ts
// Edge Function: 注文完了時にランダムで覆面調査を依頼
// Called from order completion webhook or process-cron

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SELECTION_RATE = 0.15;
const EXPIRY_HOURS = 48;
const REWARD_COUPON_VALUE = 10;
const REWARD_COUPON_VALID_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. 注文情報を取得
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, customer_id, pro_id, status')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!['completed', 'auto_completed'].includes(order.status)) {
      return new Response(
        JSON.stringify({ triggered: false, reason: 'order_not_completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. ランダム判定
    if (Math.random() > SELECTION_RATE) {
      return new Response(
        JSON.stringify({ triggered: false, reason: 'random_skip' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. 直近7日以内に同じプロへの調査があればスキップ
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent } = await supabase
      .from('quality_audits')
      .select('id')
      .eq('pro_id', order.pro_id)
      .gte('created_at', sevenDaysAgo)
      .limit(1);

    if (recent?.length) {
      return new Response(
        JSON.stringify({ triggered: false, reason: 'recent_audit_exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 4. 調査レコード作成
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 3600000).toISOString();
    const { data: audit, error: auditErr } = await supabase
      .from('quality_audits')
      .insert({
        order_id: order.id,
        customer_id: order.customer_id,
        pro_id: order.pro_id,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (auditErr) {
      return new Response(
        JSON.stringify({ error: auditErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 5. 通知送信
    await supabase.from('notifications').insert({
      user_id: order.customer_id,
      type: 'quality_audit_request',
      title: '品質チェックのお願い',
      body: `サービスの品質向上にご協力ください。お礼に${REWARD_COUPON_VALUE}%OFFクーポンをプレゼント！`,
      data: { audit_id: audit.id, order_id: order.id },
    });

    return new Response(
      JSON.stringify({
        triggered: true,
        audit_id: audit.id,
        expires_at: expiresAt,
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
