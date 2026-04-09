import { supabase } from './supabase';
import { ESTIMATE, VEHICLE, FAVORITE_PRO } from '@/constants/business-rules';

// =============================================
// 見積もり（Estimates / Quotes）
// =============================================
// Create price estimates with vehicle-size and dirt-level multipliers,
// optional pro nomination fee, 24-hour validity, and order conversion.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type Estimate = {
  id: string;
  customer_id: string;
  vehicle_id: string | null;
  menu_ids: string[] | null;
  vehicle_size: string;
  dirt_level: string;
  base_price: number;
  size_multiplier: number;
  dirt_multiplier: number;
  final_price: number;
  nominated_pro_id: string | null;
  nomination_fee: number;
  status: string;
  order_id: string | null;
  expires_at: string;
  created_at: string;
};

type EstimateOptions = {
  vehicleId?: string;
  vehicleSize: string;
  dirtLevel: string;
  menuIds: string[];
  basePrice: number;
  nominatedProId?: string;
};

// ---------------------------------------------------------------------------
// 1. createEstimate — Calculate final price and insert estimate row
// ---------------------------------------------------------------------------

export async function createEstimate(
  customerId: string,
  options: EstimateOptions,
): Promise<Result<Estimate>> {
  try {
    // Validate base price
    if (!Number.isInteger(options.basePrice) || options.basePrice <= 0 || options.basePrice > 10_000_000) {
      return { success: false, error: '基本価格が不正です（1〜10,000,000の整数）' };
    }

    // Resolve vehicle-size multiplier
    const sizeEntry = VEHICLE.SIZES.find((s) => s.id === options.vehicleSize);
    if (!sizeEntry) {
      return {
        success: false,
        error: `無効な車両サイズです: "${options.vehicleSize}"`,
      };
    }
    const sizeMultiplier = sizeEntry.priceMultiplier;

    // Resolve dirt-level multiplier
    const dirtEntry = ESTIMATE.DIRT_LEVELS.find((d) => d.id === options.dirtLevel);
    if (!dirtEntry) {
      return {
        success: false,
        error: `無効な汚れレベルです: "${options.dirtLevel}"`,
      };
    }
    const dirtMultiplier = dirtEntry.priceMultiplier;

    // Nomination fee
    const nominationFee = options.nominatedProId
      ? FAVORITE_PRO.NOMINATION_FEE
      : 0;

    // Calculate final price
    const finalPrice =
      Math.round(options.basePrice * sizeMultiplier * dirtMultiplier) +
      nominationFee;

    // Expiry = now + VALIDITY_HOURS
    const expiresAt = new Date(
      Date.now() + ESTIMATE.VALIDITY_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from('estimates')
      .insert({
        customer_id: customerId,
        vehicle_id: options.vehicleId ?? null,
        menu_ids: options.menuIds,
        vehicle_size: options.vehicleSize,
        dirt_level: options.dirtLevel,
        base_price: options.basePrice,
        size_multiplier: sizeMultiplier,
        dirt_multiplier: dirtMultiplier,
        final_price: finalPrice,
        nominated_pro_id: options.nominatedProId ?? null,
        nomination_fee: nominationFee,
        status: 'draft',
        expires_at: expiresAt,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Estimate };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getEstimate — Fetch a single estimate with vehicle and menu data
// ---------------------------------------------------------------------------

export async function getEstimate(
  estimateId: string,
): Promise<Result<Estimate & { vehicle?: Record<string, unknown> }>> {
  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*, vehicle:vehicles(*)')
      .eq('id', estimateId)
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Estimate & { vehicle?: Record<string, unknown> } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. confirmEstimate — Change status to 'confirmed', create order from it
// ---------------------------------------------------------------------------

export async function confirmEstimate(
  estimateId: string,
  customerId: string,
): Promise<Result<{ estimateId: string; orderId: string }>> {
  try {
    // Fetch the estimate with ownership check
    const { data: estimate, error: fetchErr } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .eq('customer_id', customerId)
      .single();

    if (fetchErr) return { success: false, error: '見積もりが見つからないか、操作権限がありません' };

    if (estimate.status !== 'draft') {
      return {
        success: false,
        error: `見積もりのステータスが "${estimate.status}" のため確定できません`,
      };
    }

    // Check expiry
    if (new Date(estimate.expires_at) < new Date()) {
      // Mark as expired while we're here
      await supabase
        .from('estimates')
        .update({ status: 'expired' })
        .eq('id', estimateId);

      return { success: false, error: '見積もりの有効期限が切れています' };
    }

    // Create an order from the estimate
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: estimate.customer_id,
        menu_ids: estimate.menu_ids,
        amount: estimate.final_price,
        vehicle_id: estimate.vehicle_id,
        nominated_pro_id: estimate.nominated_pro_id,
        nomination_fee: estimate.nomination_fee,
        status: 'draft',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (orderErr) return { success: false, error: orderErr.message };

    // Update estimate status and link the order
    const { error: updateErr } = await supabase
      .from('estimates')
      .update({
        status: 'confirmed',
        order_id: order.id,
      })
      .eq('id', estimateId);

    if (updateErr) return { success: false, error: updateErr.message };

    return {
      success: true,
      data: { estimateId, orderId: order.id },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getMyEstimates — List estimates for a customer
// ---------------------------------------------------------------------------

export async function getMyEstimates(
  customerId: string,
  limit: number = 50,
): Promise<Result<Estimate[]>> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as Estimate[] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. expireOldEstimates — Cron: expire draft estimates past their validity
// ---------------------------------------------------------------------------

export async function expireOldEstimates(): Promise<
  Result<{ expiredCount: number }>
> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('estimates')
      .update({ status: 'expired' })
      .eq('status', 'draft')
      .lt('expires_at', now)
      .select('id');

    if (error) return { success: false, error: error.message };

    return { success: true, data: { expiredCount: data?.length ?? 0 } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
