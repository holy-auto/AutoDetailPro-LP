import { supabase } from './supabase';
import { PRO_BOOST, type BoostPlanId } from '@/constants/business-rules';
import { purchaseBoost } from './pro-management';

export type BoostPaymentSheetParams = {
  paymentIntentId: string;
  clientSecret: string;
  customerId: string | null;
  ephemeralKey: string | null;
};

/**
 * Create a Stripe PaymentIntent for a boost plan purchase.
 * Client is expected to confirm payment via Stripe PaymentSheet
 * and then call `activateBoost` with the returned payment_intent_id.
 */
export async function createBoostPaymentIntent(params: {
  proId: string;
  planId: BoostPlanId;
  customerEmail?: string;
}): Promise<BoostPaymentSheetParams> {
  const plan = PRO_BOOST.PLANS.find((p) => p.id === params.planId);
  if (!plan) throw new Error(`Unknown boost plan: ${params.planId}`);

  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'create_boost_payment_intent',
      pro_id: params.proId,
      plan_id: params.planId,
      amount: plan.price,
      customer_email: params.customerEmail,
    },
  });

  if (error) throw new Error(`Boost payment init failed: ${error.message}`);

  return {
    paymentIntentId: data.payment_intent_id,
    clientSecret: data.client_secret,
    customerId: data.customer_id,
    ephemeralKey: data.ephemeral_key,
  };
}

/**
 * Activate the boost after a successful Stripe payment.
 * Persists the payment_intent_id to `boost_purchases` for reconciliation.
 */
export async function activateBoost(params: {
  proId: string;
  planId: BoostPlanId;
  paymentIntentId: string;
}) {
  return purchaseBoost(params.proId, params.planId, params.paymentIntentId);
}
