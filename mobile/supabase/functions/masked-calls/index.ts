// supabase/functions/masked-calls/index.ts
// Edge Function: Provision and manage masked phone call sessions.
//
// Providers:
// - twilio: Real Twilio Proxy sessions when TWILIO_* env vars are set.
// - stub:   Fake proxy numbers for dev / staging — returns a deterministic
//           +81 number so the UI can be tested end-to-end without
//           incurring Twilio charges.
//
// Client contract (lib/masked-calls.ts):
//   POST { action: 'create_session', order_id, callee_id }
//   → { id, proxy_number, expires_at }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Session valid for 24h after the order expected completion.
const SESSION_TTL_HOURS = 24;

type Provider = 'twilio' | 'stub';

function getProvider(): Provider {
  const hasTwilio =
    !!Deno.env.get('TWILIO_ACCOUNT_SID') &&
    !!Deno.env.get('TWILIO_AUTH_TOKEN') &&
    !!Deno.env.get('TWILIO_PROXY_SERVICE_SID');
  return hasTwilio ? 'twilio' : 'stub';
}

async function createTwilioSession(params: {
  callerPhone: string;
  calleePhone: string;
  ttlHours: number;
}): Promise<{ proxyNumber: string; providerSessionId: string } | null> {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
  const token = Deno.env.get('TWILIO_AUTH_TOKEN')!;
  const serviceSid = Deno.env.get('TWILIO_PROXY_SERVICE_SID')!;

  const basicAuth = btoa(`${sid}:${token}`);
  const ttlSeconds = params.ttlHours * 3600;

  // 1. Create Proxy Session
  const sessionRes = await fetch(
    `https://proxy.twilio.com/v1/Services/${serviceSid}/Sessions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        Mode: 'voice-only',
        Ttl: String(ttlSeconds),
      }),
    },
  );

  if (!sessionRes.ok) {
    console.error('[masked-calls] Twilio session create failed', await sessionRes.text());
    return null;
  }

  const session = await sessionRes.json();

  // 2. Add both participants
  for (const phone of [params.callerPhone, params.calleePhone]) {
    const pRes = await fetch(
      `https://proxy.twilio.com/v1/Services/${serviceSid}/Sessions/${session.sid}/Participants`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ Identifier: phone }),
      },
    );
    if (!pRes.ok) {
      console.error('[masked-calls] participant add failed', await pRes.text());
      return null;
    }
  }

  // Twilio returns the shared proxy number via the first participant's proxy_identifier
  const firstParticipantRes = await fetch(
    `https://proxy.twilio.com/v1/Services/${serviceSid}/Sessions/${session.sid}/Participants`,
    { headers: { Authorization: `Basic ${basicAuth}` } },
  );
  const { participants } = await firstParticipantRes.json();
  const proxyNumber = participants?.[0]?.proxy_identifier ?? '';

  return { proxyNumber, providerSessionId: session.sid };
}

function createStubSession(params: { orderId: string }): {
  proxyNumber: string;
  providerSessionId: string;
} {
  // Deterministic pseudo-number derived from order id so repeated
  // requests within TTL return the "same" proxy — matches Twilio behaviour.
  let hash = 0;
  for (let i = 0; i < params.orderId.length; i++) {
    hash = (hash * 31 + params.orderId.charCodeAt(i)) & 0x7fffffff;
  }
  const suffix = String(hash % 10000000000).padStart(10, '0');
  return {
    proxyNumber: `+81${suffix.slice(0, 10)}`,
    providerSessionId: `stub_${params.orderId}`,
  };
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

    const body = await req.json();
    const { action } = body;

    // -----------------------------------------------------------------------
    // create_session — provision a new masked-call session
    // -----------------------------------------------------------------------
    if (action === 'create_session') {
      const { order_id, callee_id } = body;
      if (!order_id || !callee_id) {
        return errorResponse('order_id and callee_id are required');
      }

      // Verify the caller is a participant of the order
      const authHeader = req.headers.get('Authorization') ?? '';
      const jwt = authHeader.replace(/^Bearer\s+/i, '');
      const { data: { user }, error: userErr } = await supabase.auth.getUser(jwt);
      if (userErr || !user) {
        return errorResponse('Unauthenticated', 401);
      }

      const { data: order } = await supabase
        .from('orders')
        .select('id, customer_id, pro_id, status')
        .eq('id', order_id)
        .single();
      if (!order) return errorResponse('Order not found', 404);

      const isParticipant =
        order.customer_id === user.id || order.pro_id === user.id;
      if (!isParticipant) return errorResponse('Not an order participant', 403);

      // Re-use active session if one exists
      const { data: existing } = await supabase
        .from('masked_calls')
        .select('id, proxy_number, expires_at')
        .eq('order_id', order_id)
        .eq('callee_id', callee_id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (existing) {
        return jsonResponse({
          id: existing.id,
          proxy_number: existing.proxy_number,
          expires_at: existing.expires_at,
          reused: true,
        });
      }

      // Resolve phone numbers of both parties (not returned to client)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, phone')
        .in('id', [order.customer_id, order.pro_id]);

      const callerPhone = profiles?.find((p) => p.id === user.id)?.phone;
      const calleePhone = profiles?.find((p) => p.id === callee_id)?.phone;

      if (!callerPhone || !calleePhone) {
        return errorResponse('Both parties must have a phone number registered', 412);
      }

      // Provision via configured provider
      const provider = getProvider();
      const session =
        provider === 'twilio'
          ? await createTwilioSession({
              callerPhone,
              calleePhone,
              ttlHours: SESSION_TTL_HOURS,
            })
          : createStubSession({ orderId: order_id });

      if (!session || !session.proxyNumber) {
        return errorResponse('Failed to provision proxy number', 502);
      }

      const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);

      const { data: row, error: insertErr } = await supabase
        .from('masked_calls')
        .insert({
          order_id,
          caller_id: user.id,
          callee_id,
          proxy_number: session.proxyNumber,
          provider,
          provider_session_id: session.providerSessionId,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select('id, proxy_number, expires_at')
        .single();

      if (insertErr || !row) {
        return errorResponse('Failed to persist session', 500);
      }

      return jsonResponse({
        id: row.id,
        proxy_number: row.proxy_number,
        expires_at: row.expires_at,
        provider,
      });
    }

    return errorResponse(`Unknown action: ${action}`);
  } catch (err) {
    console.error('[masked-calls] Error:', err);
    return errorResponse('サーバーエラーが発生しました', 500);
  }
});
