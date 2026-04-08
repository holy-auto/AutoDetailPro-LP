import { supabase } from './supabase';
import {
  CANCELLATION,
  PAYMENT_METHOD,
  type PaymentMethod,
} from '@/constants/business-rules';

// =============================================
// Stripe Payment Integration via Supabase Edge Functions
// =============================================
// All Stripe API calls happen server-side (Edge Functions).
// The client calls supabase.functions.invoke() to trigger them.

/**
 * Create a Payment Intent (pre-authorization) when customer places an order.
 * - Online: Stripe Payment Intent with capture_method: 'manual'
 * - Cash: No Stripe PI, just record the order
 */
export async function createPaymentIntent(params: {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerEmail: string;
}) {
  if (params.paymentMethod === PAYMENT_METHOD.CASH) {
    // Cash: no Stripe PI needed — just track in DB
    return { paymentIntentId: null, clientSecret: null, method: 'cash' as const };
  }

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      order_id: params.orderId,
      amount: params.amount,
      currency: 'jpy',
      customer_email: params.customerEmail,
      capture_method: 'manual', // 事前決済（手動キャプチャ）
    },
  });

  if (error) throw new Error(`Payment creation failed: ${error.message}`);

  return {
    paymentIntentId: data.payment_intent_id as string,
    clientSecret: data.client_secret as string,
    method: 'online' as const,
  };
}

/**
 * Capture (confirm) payment after work is completed.
 * Called when both customer confirms or auto-complete after 30 min.
 */
export async function capturePayment(params: {
  orderId: string;
  paymentIntentId: string;
  amount?: number; // Optional: partial capture for cancellation fees
}) {
  const { data, error } = await supabase.functions.invoke('capture-payment', {
    body: {
      order_id: params.orderId,
      payment_intent_id: params.paymentIntentId,
      amount: params.amount, // undefined = full capture
    },
  });

  if (error) throw new Error(`Payment capture failed: ${error.message}`);
  return data;
}

/**
 * Cancel a payment authorization (full refund before capture).
 * Used when order is cancelled before pro acceptance.
 */
export async function cancelPaymentAuthorization(params: {
  orderId: string;
  paymentIntentId: string;
}) {
  const { data, error } = await supabase.functions.invoke('cancel-payment', {
    body: {
      order_id: params.orderId,
      payment_intent_id: params.paymentIntentId,
    },
  });

  if (error) throw new Error(`Payment cancel failed: ${error.message}`);
  return data;
}

/**
 * Process cancellation with fee.
 * - Before acceptance: free → cancel authorization
 * - After acceptance, before arrival: 30-50% capture + cancel rest
 * - After arrival: 100% capture
 */
export async function processCancellation(params: {
  orderId: string;
  paymentIntentId: string | null;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  orderStatus: string;
}) {
  const { orderId, paymentIntentId, paymentMethod, totalAmount, orderStatus } = params;

  // Determine cancellation fee
  let feePercent = 0;
  const beforeAcceptance = ['draft', 'payment_authorized', 'requested', 'requested_expanded'];
  const afterAcceptanceBeforeArrival = ['accepted', 'on_the_way'];
  const afterArrival = ['arrived', 'in_progress'];

  if (beforeAcceptance.includes(orderStatus)) {
    feePercent = CANCELLATION.BEFORE_ACCEPTANCE.fee_percent;
  } else if (afterAcceptanceBeforeArrival.includes(orderStatus)) {
    feePercent = CANCELLATION.AFTER_ACCEPTANCE_BEFORE_ARRIVAL.default_percent;
  } else if (afterArrival.includes(orderStatus)) {
    feePercent = CANCELLATION.AFTER_ARRIVAL.fee_percent;
  }

  const feeAmount = Math.round(totalAmount * (feePercent / 100));

  if (paymentMethod === PAYMENT_METHOD.ONLINE && paymentIntentId) {
    if (feePercent === 0) {
      // Free cancel — release the hold
      await cancelPaymentAuthorization({ orderId, paymentIntentId });
    } else if (feePercent < 100) {
      // Partial capture — capture only the fee
      await capturePayment({ orderId, paymentIntentId, amount: feeAmount });
    } else {
      // Full capture — charge the full amount
      await capturePayment({ orderId, paymentIntentId });
    }
  }

  // Update order in DB
  const newStatus =
    feePercent === 0
      ? 'cancelled'
      : feePercent === 100
        ? 'cancelled_with_fee_100'
        : 'cancelled_with_fee_30_50';

  await supabase.from('orders').update({
    status: newStatus,
    cancellation_fee: feeAmount,
    cancelled_at: new Date().toISOString(),
  }).eq('id', orderId);

  return { feePercent, feeAmount, status: newStatus };
}

/**
 * Process refund for disputes.
 * @param refundPercent 10-100%
 */
export async function processRefund(params: {
  orderId: string;
  paymentIntentId: string;
  totalAmount: number;
  refundPercent: number;
  reason: string;
}) {
  const refundAmount = Math.round(params.totalAmount * (params.refundPercent / 100));

  const { data, error } = await supabase.functions.invoke('refund-payment', {
    body: {
      order_id: params.orderId,
      payment_intent_id: params.paymentIntentId,
      amount: refundAmount,
      reason: params.reason,
    },
  });

  if (error) throw new Error(`Refund failed: ${error.message}`);

  // Update order
  const newStatus =
    params.refundPercent === 100 ? 'fully_refunded' : 'partially_refunded';

  await supabase.from('orders').update({
    status: newStatus,
    refund_amount: refundAmount,
    refund_reason: params.reason,
  }).eq('id', params.orderId);

  return { refundAmount, status: newStatus, ...data };
}

/**
 * Cash settlement: offset from card earnings or generate invoice
 */
export async function processCashSettlement(params: {
  proId: string;
  orderId: string;
  amount: number;
}) {
  const { data, error } = await supabase.functions.invoke('process-cash-settlement', {
    body: {
      pro_id: params.proId,
      order_id: params.orderId,
      amount: params.amount,
    },
  });

  if (error) throw new Error(`Cash settlement failed: ${error.message}`);
  return data;
}
