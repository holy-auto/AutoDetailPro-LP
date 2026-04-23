import { supabase } from './supabase';
import { logAudit } from './audit';

export type CouponSource = 'rewarded_ad' | 'audit_reward' | 'referral' | 'gift';

/**
 * Create a single-use coupon for the given customer and assign it.
 * Used by rewarded ad flow, referral rewards, etc.
 */
export async function saveCoupon(params: {
  customerId: string;
  amount: number; // JPY off when type='fixed', percent when type='percent'
  source: CouponSource;
  type?: 'fixed' | 'percent';
  validDays?: number;
}): Promise<{ couponId: string; code: string } | null> {
  const type = params.type ?? 'fixed';
  const validDays = params.validDays ?? 30;
  const code = `${params.source.toUpperCase().slice(0, 5)}-${Date.now().toString(36).toUpperCase()}`;
  const validUntil = new Date(
    Date.now() + validDays * 86400000,
  ).toISOString();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code,
      type,
      value: params.amount,
      max_uses: 1,
      valid_from: new Date().toISOString(),
      valid_until: validUntil,
      active: true,
    })
    .select('id')
    .single();

  if (error || !coupon) return null;

  const { error: assignError } = await supabase
    .from('customer_coupons')
    .insert({
      customer_id: params.customerId,
      coupon_id: coupon.id,
    });

  if (assignError) return null;

  await logAudit({
    action: 'coupon.issue',
    resourceType: 'coupon',
    resourceId: coupon.id,
    metadata: {
      code,
      source: params.source,
      type,
      value: params.amount,
    },
  });

  return { couponId: coupon.id, code };
}
