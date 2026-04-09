import { supabase } from './supabase';

// =============================================
// Stripe Connect — Pro Payouts & Payment Management
// =============================================
// All Stripe API calls happen server-side (Edge Functions).
// The client calls supabase.functions.invoke('stripe-connect', { body }) to trigger them.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// 1. createConnectAccount
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Express account for a pro.
 * Calls the stripe-connect Edge Function, then saves stripe_account_id
 * to the kyc_verifications table.
 */
export async function createConnectAccount(
  proId: string,
  email: string,
): Promise<Result<{ stripeAccountId: string }>> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'create_account',
        pro_id: proId,
        email,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.account_id) {
      return { success: false, error: 'No account_id returned from Stripe' };
    }

    // Save stripe_account_id to kyc_verifications
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        stripe_account_id: data.account_id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', proId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: { stripeAccountId: data.account_id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getOnboardingLink
// ---------------------------------------------------------------------------

/**
 * Generate a Stripe Account onboarding link for a pro.
 * The pro opens this URL in a browser to complete identity verification
 * and bank account setup.
 */
export async function getOnboardingLink(
  proId: string,
): Promise<Result<{ url: string }>> {
  try {
    // Fetch the pro's stripe_account_id from kyc_verifications
    const { data: kyc, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('stripe_account_id')
      .eq('user_id', proId)
      .single();

    if (kycError || !kyc?.stripe_account_id) {
      return {
        success: false,
        error: 'Stripe Connect account not found. Complete KYC first.',
      };
    }

    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'onboarding_link',
        stripe_account_id: kyc.stripe_account_id,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { url: data.url } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. checkOnboardingStatus
// ---------------------------------------------------------------------------

/**
 * Check whether a pro's Stripe Connect account is fully onboarded
 * (charges_enabled + payouts_enabled).
 */
export async function checkOnboardingStatus(
  proId: string,
): Promise<Result<{ onboarded: boolean; chargesEnabled: boolean; payoutsEnabled: boolean }>> {
  try {
    const { data: kyc, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('user_id', proId)
      .single();

    if (kycError || !kyc?.stripe_account_id) {
      return {
        success: false,
        error: 'Stripe Connect account not found.',
      };
    }

    // If already marked complete locally, skip the API call
    if (kyc.stripe_onboarding_complete) {
      return {
        success: true,
        data: { onboarded: true, chargesEnabled: true, payoutsEnabled: true },
      };
    }

    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'check_status',
        stripe_account_id: kyc.stripe_account_id,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const onboarded = data.charges_enabled && data.payouts_enabled;

    // Persist onboarding status if now complete
    if (onboarded && !kyc.stripe_onboarding_complete) {
      await supabase
        .from('kyc_verifications')
        .update({
          stripe_onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', proId);
    }

    return {
      success: true,
      data: {
        onboarded,
        chargesEnabled: data.charges_enabled,
        payoutsEnabled: data.payouts_enabled,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. createPaymentIntent
// ---------------------------------------------------------------------------

/**
 * Create a Payment Intent with manual capture (pre-authorization).
 * Used when a customer places an order with online payment.
 */
export async function createPaymentIntent(
  orderId: string,
  amount: number,
  customerId: string,
): Promise<Result<{ paymentIntentId: string; clientSecret: string }>> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'create_payment_intent',
        order_id: orderId,
        amount,
        currency: 'jpy',
        customer_id: customerId,
        capture_method: 'manual',
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        paymentIntentId: data.payment_intent_id,
        clientSecret: data.client_secret,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. capturePayment
// ---------------------------------------------------------------------------

/**
 * Capture a pre-authorized Payment Intent (full or partial).
 * Called after work is confirmed complete.
 *
 * @param paymentIntentId - Stripe PI ID
 * @param amount - Optional: partial capture amount. Omit for full capture.
 */
export async function capturePayment(
  paymentIntentId: string,
  amount?: number,
): Promise<Result<{ captured: boolean; amountCaptured: number }>> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'capture',
        payment_intent_id: paymentIntentId,
        amount, // undefined = full capture
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        captured: true,
        amountCaptured: data.amount_captured,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. cancelPaymentIntent
// ---------------------------------------------------------------------------

/**
 * Cancel a pre-authorized Payment Intent (release hold).
 * Used when an order is cancelled before capture.
 */
export async function cancelPaymentIntent(
  paymentIntentId: string,
): Promise<Result<{ cancelled: boolean }>> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'cancel_intent',
        payment_intent_id: paymentIntentId,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { cancelled: true } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7. createTransfer
// ---------------------------------------------------------------------------

/**
 * Transfer funds from the platform to a pro's Stripe Connect account.
 * Called after payment capture to pay out the pro.
 */
export async function createTransfer(
  orderId: string,
  proStripeAccountId: string,
  amount: number,
): Promise<Result<{ transferId: string }>> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'transfer',
        order_id: orderId,
        destination: proStripeAccountId,
        amount,
        currency: 'jpy',
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { transferId: data.transfer_id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 8. getProPayoutHistory
// ---------------------------------------------------------------------------

/**
 * Fetch payout records for a pro from the payouts table.
 */
export async function getProPayoutHistory(
  proId: string,
): Promise<Result<{
  payouts: Array<{
    id: string;
    orderId: string;
    amount: number;
    fee: number;
    schedule: string;
    status: string;
    stripeTransferId: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  totalPaid: number;
  totalPending: number;
}>> {
  try {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('pro_id', proId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const records = (payouts ?? []).map((p: any) => ({
      id: p.id,
      orderId: p.order_id,
      amount: p.amount,
      fee: p.fee ?? 0,
      schedule: p.schedule,
      status: p.status,
      stripeTransferId: p.stripe_transfer_id ?? null,
      paidAt: p.paid_at ?? null,
      createdAt: p.created_at,
    }));

    const totalPaid = records
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = records
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      success: true,
      data: { payouts: records, totalPaid, totalPending },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
