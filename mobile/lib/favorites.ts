import { supabase } from './supabase';
import { FAVORITE_PRO } from '@/constants/business-rules';

// =============================================
// お気に入りプロ（Favorite Pros）+ 指名料
// =============================================
// Customers can favorite up to MAX_FAVORITES pros.
// Nominating a favorite pro on an order adds a NOMINATION_FEE
// and bypasses the matching engine.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// 1. addFavorite — Add a pro to favorites (max MAX_FAVORITES)
// ---------------------------------------------------------------------------

export async function addFavorite(
  customerId: string,
  proId: string,
): Promise<Result<{ id: string }>> {
  try {
    // Check current count
    const { count, error: countErr } = await supabase
      .from('favorite_pros')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    if (countErr) return { success: false, error: countErr.message };

    if ((count ?? 0) >= FAVORITE_PRO.MAX_FAVORITES) {
      return {
        success: false,
        error: `お気に入りは最大${FAVORITE_PRO.MAX_FAVORITES}人までです`,
      };
    }

    const { data, error } = await supabase
      .from('favorite_pros')
      .insert({
        customer_id: customerId,
        pro_id: proId,
      })
      .select('id')
      .single();

    if (error) {
      // Unique constraint (customer_id, pro_id)
      if (error.code === '23505') {
        return { success: false, error: 'このプロは既にお気に入りに登録されています' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: { id: data.id } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. removeFavorite — Remove a pro from favorites
// ---------------------------------------------------------------------------

export async function removeFavorite(
  customerId: string,
  proId: string,
): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('favorite_pros')
      .delete()
      .eq('customer_id', customerId)
      .eq('pro_id', proId);

    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getMyFavorites — List favorite pros with profile info
// ---------------------------------------------------------------------------

type FavoritePro = {
  id: string;
  proId: string;
  name: string | null;
  rating: number;
  avatarUrl: string | null;
  createdAt: string;
};

export async function getMyFavorites(
  customerId: string,
): Promise<Result<FavoritePro[]>> {
  try {
    const { data, error } = await supabase
      .from('favorite_pros')
      .select(`
        id,
        pro_id,
        created_at,
        profiles!favorite_pros_pro_id_fkey(full_name, avatar_url)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Collect pro IDs to fetch aggregate ratings
    const proIds = (data ?? []).map((row: any) => row.pro_id as string);
    const ratingMap = new Map<string, number>();

    if (proIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('target_id, rating')
        .in('target_id', proIds);

      if (reviews) {
        const aggMap = new Map<string, { sum: number; count: number }>();
        for (const r of reviews) {
          const entry = aggMap.get(r.target_id) ?? { sum: 0, count: 0 };
          entry.sum += r.rating;
          entry.count += 1;
          aggMap.set(r.target_id, entry);
        }
        for (const [id, entry] of aggMap) {
          ratingMap.set(id, Math.round((entry.sum / entry.count) * 10) / 10);
        }
      }
    }

    const favorites: FavoritePro[] = (data ?? []).map((row: any) => ({
      id: row.id,
      proId: row.pro_id,
      name: row.profiles?.full_name ?? null,
      rating: ratingMap.get(row.pro_id) ?? 0,
      avatarUrl: row.profiles?.avatar_url ?? null,
      createdAt: row.created_at,
    }));

    return { success: true, data: favorites };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. isFavorite — Check if a pro is in the customer's favorites
// ---------------------------------------------------------------------------

export async function isFavorite(
  customerId: string,
  proId: string,
): Promise<Result<{ favorited: boolean }>> {
  try {
    const { data, error } = await supabase
      .from('favorite_pros')
      .select('id')
      .eq('customer_id', customerId)
      .eq('pro_id', proId)
      .limit(1);

    if (error) return { success: false, error: error.message };

    return { success: true, data: { favorited: (data?.length ?? 0) > 0 } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. nominatePro — Assign a specific pro to an order with nomination fee
// ---------------------------------------------------------------------------

export async function nominatePro(
  orderId: string,
  proId: string,
  customerId: string,
): Promise<Result<{ orderId: string; nominationFee: number }>> {
  try {
    // Verify the order belongs to the customer and is in a nominatable state
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, customer_id, status, amount')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return { success: false, error: '注文が見つかりません' };
    }

    if (order.customer_id !== customerId) {
      return { success: false, error: 'この注文を操作する権限がありません' };
    }

    // Allow nomination only for draft or payment_authorized orders
    const nominatableStatuses = ['draft', 'payment_authorized'];
    if (!nominatableStatuses.includes(order.status)) {
      return {
        success: false,
        error: 'この注文ステータスではプロの指名はできません',
      };
    }

    // Add nomination fee to the order amount and assign the pro
    const newAmount = (order.amount ?? 0) + FAVORITE_PRO.NOMINATION_FEE;

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        pro_id: proId,
        amount: newAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) return { success: false, error: updateErr.message };

    return {
      success: true,
      data: { orderId, nominationFee: FAVORITE_PRO.NOMINATION_FEE },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getNominationFee — Return the current nomination fee amount
// ---------------------------------------------------------------------------

export async function getNominationFee(): Promise<Result<{ fee: number }>> {
  return { success: true, data: { fee: FAVORITE_PRO.NOMINATION_FEE } };
}
