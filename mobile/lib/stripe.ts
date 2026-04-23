import { supabase } from './supabase';
import { logAudit } from './audit';
import {
  CANCELLATION,
  PAYMENT_METHOD,
  PLATFORM_FEE,
  PAYOUT_SCHEDULES,
  type PaymentMethod,
  type PayoutSchedule,
} from '@/constants/business-rules';

// =============================================
// Stripe Payment Integration via Supabase Edge Functions
// =============================================
// All Stripe API calls happen server-side (Edge Functions).
// The client calls supabase.functions.invoke() to trigger them.

// --- Fee Calculation Helpers ---

/** お客様が支払う合計金額（基本料金 + 5%手数料） */
export function calculateCustomerTotal(baseAmount: number): number {
  return baseAmount + Math.round(baseAmount * PLATFORM_FEE.CUSTOMER_PERCENT / 100);
}

/** プロへの支払い金額（基本料金 - 5%手数料 - 振込手数料） */
export function calculateProPayout(baseAmount: number, payoutSchedule: PayoutSchedule = 'weekly'): number {
  const afterPlatformFee = baseAmount - Math.round(baseAmount * PLATFORM_FEE.PRO_PERCENT / 100);
  const schedule = PAYOUT_SCHEDULES.find(s => s.id === payoutSchedule);
  const payoutFeePercent = schedule?.fee_percent ?? 0;
  if (payoutFeePercent === 0) return afterPlatformFee;
  return afterPlatformFee - Math.round(afterPlatformFee * payoutFeePercent / 100);
}

/** 手数料の内訳を計算 */
export function calculateFeeBreakdown(baseAmount: number, payoutSchedule: PayoutSchedule = 'weekly') {
  const customerFee = Math.round(baseAmount * PLATFORM_FEE.CUSTOMER_PERCENT / 100);
  const proFee = Math.round(baseAmount * PLATFORM_FEE.PRO_PERCENT / 100);
  const proBaseAfterFee = baseAmount - proFee;
  const schedule = PAYOUT_SCHEDULES.find(s => s.id === payoutSchedule);
  const payoutFeePercent = schedule?.fee_percent ?? 0;
  const payoutFee = Math.round(proBaseAfterFee * payoutFeePercent / 100);

  return {
    baseAmount,
    customerFee,                              // お客様手数料 (5%)
    customerTotal: baseAmount + customerFee,   // お客様支払い総額
    proFee,                                    // プロ手数料 (5%)
    payoutFee,                                 // 振込手数料 (即時: 3%, その他: 0%)
    proPayout: proBaseAfterFee - payoutFee,    // プロ受取額
    platformRevenue: customerFee + proFee + payoutFee, // プラットフォーム収益
  };
}

/**
 * Create a Payment Intent (pre-authorization) when customer places an order.
 * - Online: Stripe Payment Intent with capture_method: 'manual'
 * - Cash: No Stripe PI, just record the order
 */
export async function createPaymentIntent(params: {
  orderId: string;
  amount: number; // 基本料金（メニュー合計）
  paymentMethod: PaymentMethod;
  customerEmail: string;
}) {
  if (params.paymentMethod === PAYMENT_METHOD.CASH) {
    // Cash: no Stripe PI needed — just track in DB
    return { paymentIntentId: null, clientSecret: null, method: 'cash' as const };
  }

  const customerFee = Math.round(params.amount * PLATFORM_FEE.CUSTOMER_PERCENT / 100);
  const customerTotal = params.amount + customerFee;

  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'create_payment_intent',
      order_id: params.orderId,
      amount: customerTotal,          // お客様支払い総額（基本料金 + 5%）
      base_amount: params.amount,     // 基本料金
      customer_fee: customerFee,      // お客様手数料
      currency: 'jpy',
      customer_email: params.customerEmail,
      capture_method: 'manual',
      // Stable idempotency — retrying the same order must not double-charge
      idempotency_key: `pi:order:${params.orderId}`,
    },
  });

  if (error) throw new Error(`Payment creation failed: ${error.message}`);

  await logAudit({
    action: 'payment.create_intent',
    resourceType: 'order',
    resourceId: params.orderId,
    metadata: {
      payment_intent_id: data.payment_intent_id,
      amount: customerTotal,
      base_amount: params.amount,
    },
  });

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
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'capture',
      order_id: params.orderId,
      payment_intent_id: params.paymentIntentId,
      amount: params.amount, // undefined = full capture
    },
  });

  if (error) throw new Error(`Payment capture failed: ${error.message}`);

  await logAudit({
    action: 'payment.capture',
    resourceType: 'order',
    resourceId: params.orderId,
    metadata: {
      payment_intent_id: params.paymentIntentId,
      amount: params.amount ?? null,
    },
  });
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
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'cancel_intent',
      order_id: params.orderId,
      payment_intent_id: params.paymentIntentId,
    },
  });

  if (error) throw new Error(`Payment cancel failed: ${error.message}`);

  await logAudit({
    action: 'payment.cancel_intent',
    resourceType: 'order',
    resourceId: params.orderId,
    metadata: { payment_intent_id: params.paymentIntentId },
  });
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

  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'refund',
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

  await logAudit({
    action: 'payment.refund',
    resourceType: 'order',
    resourceId: params.orderId,
    metadata: {
      payment_intent_id: params.paymentIntentId,
      refund_amount: refundAmount,
      refund_percent: params.refundPercent,
      reason: params.reason,
    },
  });

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
  const { data, error } = await supabase.functions.invoke('stripe-connect', {
    body: {
      action: 'cash_settlement',
      pro_id: params.proId,
      order_id: params.orderId,
      amount: params.amount,
    },
  });

  if (error) throw new Error(`Cash settlement failed: ${error.message}`);
  return data;
}
