// supabase/functions/stripe-connect/index.ts
// Edge Function: Stripe Connect operations for pro payouts & payment management
// Handles account creation, onboarding, payment intents, captures, and transfers.

import Stripe from 'https://esm.sh/stripe@14';
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return errorResponse('STRIPE_SECRET_KEY is not configured', 500);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const { action } = body;

    // -----------------------------------------------------------------------
    // create_account — Create Stripe Express account for a pro
    // -----------------------------------------------------------------------
    if (action === 'create_account') {
      const { pro_id, email } = body;

      if (!pro_id || !email) {
        return errorResponse('pro_id and email are required');
      }

      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          pro_id,
          platform: 'mobile_wash',
        },
      });

      // Persist the Stripe account ID to the database
      await supabase
        .from('kyc_verifications')
        .update({
          stripe_account_id: account.id,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', pro_id);

      return jsonResponse({
        account_id: account.id,
        pro_id,
      });
    }

    // -----------------------------------------------------------------------
    // onboarding_link — Generate Stripe account onboarding URL
    // -----------------------------------------------------------------------
    if (action === 'onboarding_link') {
      const { stripe_account_id } = body;

      if (!stripe_account_id) {
        return errorResponse('stripe_account_id is required');
      }

      const appUrl = Deno.env.get('APP_URL') ?? 'https://mobilewash.jp';

      const accountLink = await stripe.accountLinks.create({
        account: stripe_account_id,
        refresh_url: `${appUrl}/stripe/refresh`,
        return_url: `${appUrl}/stripe/return`,
        type: 'account_onboarding',
      });

      return jsonResponse({
        url: accountLink.url,
        expires_at: accountLink.expires_at,
      });
    }

    // -----------------------------------------------------------------------
    // check_status — Check if Stripe account is fully onboarded
    // -----------------------------------------------------------------------
    if (action === 'check_status') {
      const { stripe_account_id } = body;

      if (!stripe_account_id) {
        return errorResponse('stripe_account_id is required');
      }

      const account = await stripe.accounts.retrieve(stripe_account_id);

      return jsonResponse({
        account_id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      });
    }

    // -----------------------------------------------------------------------
    // create_payment_intent — Create PI with manual capture (pre-auth)
    // amount = お客様支払い総額 (基本料金 + 5%手数料)
    // base_amount = 基本料金, customer_fee = お客様手数料
    // -----------------------------------------------------------------------
    if (action === 'create_payment_intent') {
      const {
        order_id, amount, base_amount, customer_fee,
        currency = 'jpy', customer_id, capture_method = 'manual',
        idempotency_key,
      } = body;

      if (!order_id || !amount) {
        return errorResponse('order_id and amount are required');
      }

      // Validate amount is a positive integer within reasonable bounds (JPY, no decimals)
      if (!Number.isInteger(amount) || amount <= 0 || amount > 10_000_000) {
        return errorResponse('amount must be a positive integer (1–10,000,000)');
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency,
          capture_method,
          metadata: {
            order_id,
            customer_id: customer_id ?? '',
            platform: 'mobile_wash',
            base_amount: String(base_amount ?? amount),
            customer_fee: String(customer_fee ?? 0),
          },
        },
        idempotency_key ? { idempotencyKey: idempotency_key } : undefined,
      );

      // Save PI ID and fee breakdown to the order
      await supabase
        .from('orders')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          customer_fee: customer_fee ?? 0,
          customer_total: amount,
        })
        .eq('id', order_id);

      return jsonResponse({
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      });
    }

    // -----------------------------------------------------------------------
    // capture — Capture a pre-authorized Payment Intent (full or partial)
    // -----------------------------------------------------------------------
    if (action === 'capture') {
      const { payment_intent_id, amount } = body;

      if (!payment_intent_id) {
        return errorResponse('payment_intent_id is required');
      }

      const captureParams: Stripe.PaymentIntentCaptureParams = {};
      if (amount !== undefined && amount !== null) {
        captureParams.amount_to_capture = amount;
      }

      const paymentIntent = await stripe.paymentIntents.capture(
        payment_intent_id,
        captureParams,
      );

      return jsonResponse({
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        amount_captured: paymentIntent.amount_received,
      });
    }

    // -----------------------------------------------------------------------
    // cancel_intent — Cancel a pre-authorized Payment Intent
    // -----------------------------------------------------------------------
    if (action === 'cancel_intent') {
      const { payment_intent_id } = body;

      if (!payment_intent_id) {
        return errorResponse('payment_intent_id is required');
      }

      const paymentIntent = await stripe.paymentIntents.cancel(payment_intent_id);

      return jsonResponse({
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
      });
    }

    // -----------------------------------------------------------------------
    // transfer — Transfer funds to a connected account (手数料差引後)
    // base_amount = 基本料金, payout_schedule = instant/weekly/monthly
    // プロ受取額 = base_amount - 5%プロ手数料 - 振込手数料(即時:3%)
    // -----------------------------------------------------------------------
    if (action === 'transfer') {
      const {
        order_id, destination, base_amount,
        payout_schedule = 'weekly', currency = 'jpy',
      } = body;

      if (!destination || !base_amount) {
        return errorResponse('destination and base_amount are required');
      }

      if (!Number.isInteger(base_amount) || base_amount <= 0) {
        return errorResponse('base_amount must be a positive integer');
      }

      // --- Fee calculation (server-side, authoritative) ---
      const PRO_FEE_PERCENT = 5;
      const PAYOUT_FEE_RATES: Record<string, number> = {
        instant: 3,
        weekly: 0,
        monthly: 0,
      };

      const proFee = Math.round(base_amount * PRO_FEE_PERCENT / 100);
      const afterPlatformFee = base_amount - proFee;
      const payoutFeePercent = PAYOUT_FEE_RATES[payout_schedule] ?? 0;
      const payoutFee = Math.round(afterPlatformFee * payoutFeePercent / 100);
      const proPayoutAmount = afterPlatformFee - payoutFee;
      const totalFee = proFee + payoutFee;

      const transfer = await stripe.transfers.create({
        amount: proPayoutAmount,
        currency,
        destination,
        metadata: {
          order_id: order_id ?? '',
          platform: 'mobile_wash',
          base_amount: String(base_amount),
          pro_fee: String(proFee),
          payout_fee: String(payoutFee),
          payout_schedule,
        },
      });

      // Record the transfer in the payouts table
      if (order_id) {
        const { data: kyc } = await supabase
          .from('kyc_verifications')
          .select('user_id')
          .eq('stripe_account_id', destination)
          .single();

        if (kyc?.user_id) {
          await supabase.from('payouts').insert({
            pro_id: kyc.user_id,
            order_id,
            amount: proPayoutAmount,
            base_amount,
            pro_fee: proFee,
            payout_fee: payoutFee,
            fee: totalFee,
            schedule: payout_schedule,
            status: 'paid',
            stripe_transfer_id: transfer.id,
            paid_at: new Date().toISOString(),
          });
        }
      }

      // Update order with pro fee breakdown
      if (order_id) {
        await supabase
          .from('orders')
          .update({
            pro_fee: proFee,
            payout_fee: payoutFee,
            pro_payout: proPayoutAmount,
          })
          .eq('id', order_id);
      }

      return jsonResponse({
        transfer_id: transfer.id,
        amount: proPayoutAmount,
        base_amount,
        pro_fee: proFee,
        payout_fee: payoutFee,
        destination: transfer.destination,
        status: 'paid',
      });
    }

    // -----------------------------------------------------------------------
    // refund — Refund a captured Payment Intent (full or partial)
    // -----------------------------------------------------------------------
    if (action === 'refund') {
      const { payment_intent_id, amount, reason } = body;

      if (!payment_intent_id) {
        return errorResponse('payment_intent_id is required');
      }

      const refundParams: Record<string, unknown> = {
        payment_intent: payment_intent_id,
      };
      if (amount !== undefined && amount !== null) {
        refundParams.amount = amount;
      }
      if (reason) {
        refundParams.metadata = { reason };
      }

      const refund = await stripe.refunds.create(refundParams);

      return jsonResponse({
        refund_id: refund.id,
        status: refund.status,
        amount: refund.amount,
      });
    }

    // -----------------------------------------------------------------------
    // create_boost_payment_intent — PI for pro ranking boost purchase
    // amount = plan price (confirmed by client via PaymentSheet)
    // -----------------------------------------------------------------------
    if (action === 'create_boost_payment_intent') {
      const { pro_id, plan_id, amount, customer_email, idempotency_key } = body;

      if (!pro_id || !plan_id || !amount) {
        return errorResponse('pro_id, plan_id and amount are required');
      }

      if (!Number.isInteger(amount) || amount <= 0 || amount > 1_000_000) {
        return errorResponse('amount must be a positive integer (1–1,000,000)');
      }

      // Verify the pro does not already have an active boost
      const { data: existing } = await supabase
        .from('boost_purchases')
        .select('id')
        .eq('pro_id', pro_id)
        .eq('status', 'active');

      if (existing && existing.length > 0) {
        return errorResponse('Pro already has an active boost', 409);
      }

      // Create or reuse a Stripe Customer for receipts
      let stripeCustomerId: string | undefined;
      if (customer_email) {
        const { data: existingCustomers } = await stripe.customers.list({
          email: customer_email,
          limit: 1,
        });
        stripeCustomerId = existingCustomers[0]?.id;
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: customer_email,
            metadata: { pro_id, platform: 'mobile_wash' },
          });
          stripeCustomerId = customer.id;
        }
      }

      const ephemeralKey = stripeCustomerId
        ? await stripe.ephemeralKeys.create(
            { customer: stripeCustomerId },
            { apiVersion: '2024-04-10' },
          )
        : null;

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: 'jpy',
          capture_method: 'automatic',
          customer: stripeCustomerId,
          metadata: {
            purpose: 'boost_purchase',
            pro_id,
            plan_id,
            platform: 'mobile_wash',
          },
        },
        idempotency_key ? { idempotencyKey: idempotency_key } : undefined,
      );

      return jsonResponse({
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        customer_id: stripeCustomerId ?? null,
        ephemeral_key: ephemeralKey?.secret ?? null,
      });
    }

    // -----------------------------------------------------------------------
    // cash_settlement — Process cash settlement for pro
    // -----------------------------------------------------------------------
    if (action === 'cash_settlement') {
      const { pro_id, order_id, amount } = body;

      if (!pro_id || !order_id || !amount) {
        return errorResponse('pro_id, order_id, and amount are required');
      }

      // For cash orders, platform fee is deducted from future card earnings
      const PRO_FEE_PERCENT = 5;
      const proFee = Math.round(amount * PRO_FEE_PERCENT / 100);

      // Record cash settlement with fee info
      await supabase.from('cash_settlements').insert({
        pro_id,
        order_id,
        amount,
        pro_fee: proFee,
        net_amount: amount - proFee,
        status: 'pending_offset',
        created_at: new Date().toISOString(),
      });

      // Update order with fee breakdown
      await supabase
        .from('orders')
        .update({
          pro_fee: proFee,
          pro_payout: amount - proFee,
        })
        .eq('id', order_id);

      return jsonResponse({
        order_id,
        amount,
        pro_fee: proFee,
        net_amount: amount - proFee,
        status: 'pending_offset',
      });
    }

    // -----------------------------------------------------------------------
    // Unknown action
    // -----------------------------------------------------------------------
    return errorResponse(`Unknown action: ${action}`, 400);
  } catch (err) {
    // Log the full error server-side for debugging
    console.error('[stripe-connect] Error:', err);

    // Return generic error messages to the client — never expose Stripe internals
    if ((err as any)?.type?.startsWith('Stripe')) {
      const stripeCode = (err as any)?.code;
      // Map known Stripe error codes to safe user-facing messages
      const safeMessages: Record<string, string> = {
        card_declined: 'カードが拒否されました',
        insufficient_funds: '残高が不足しています',
        invalid_amount: '金額が不正です',
        expired_card: 'カードの有効期限が切れています',
        processing_error: '決済処理中にエラーが発生しました',
      };
      const safeMessage = safeMessages[stripeCode] ?? '決済処理中にエラーが発生しました';
      return errorResponse(safeMessage, 402);
    }

    return errorResponse('サーバーエラーが発生しました', 500);
  }
});
