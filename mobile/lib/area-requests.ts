import { supabase } from './supabase';
import { AREA_REQUEST } from '@/constants/business-rules';

// =============================================
// Area Expansion Requests — Submit, Vote & Query
// =============================================
// Users can request service expansion to new areas.
// Votes aggregate demand; admins are notified at threshold.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type AreaRequestInput = {
  latitude: number;
  longitude: number;
  address: string;
  prefecture: string;
  city: string;
};

type AreaRequest = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string;
  prefecture: string | null;
  city: string | null;
  votes: number;
  status: string;
  created_at: string;
};

type AreaRequestFilters = {
  prefecture?: string;
  status?: string;
};

// ---------------------------------------------------------------------------
// 1. submitAreaRequest — Submit a new area expansion request
// ---------------------------------------------------------------------------

/**
 * Submit an area expansion request.
 * Enforces a cooldown of AREA_REQUEST.REQUEST_COOLDOWN_DAYS per user per city.
 * Notifies admin when the city's total requests reach AREA_REQUEST.THRESHOLD_TO_NOTIFY_ADMIN.
 */
export async function submitAreaRequest(
  userId: string,
  data: AreaRequestInput,
): Promise<Result<AreaRequest>> {
  try {
    // Check cooldown — same user, same city within N days
    const cooldownDate = new Date();
    cooldownDate.setDate(
      cooldownDate.getDate() - AREA_REQUEST.REQUEST_COOLDOWN_DAYS,
    );

    const { data: recentRequests, error: cooldownErr } = await supabase
      .from('area_requests')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('city', data.city)
      .gte('created_at', cooldownDate.toISOString())
      .limit(1);

    if (cooldownErr) return { success: false, error: cooldownErr.message };

    if (recentRequests && recentRequests.length > 0) {
      return {
        success: false,
        error: `同じ市区町村へのリクエストは${AREA_REQUEST.REQUEST_COOLDOWN_DAYS}日間に1回までです`,
      };
    }

    // Insert the request
    const { data: request, error: insertErr } = await supabase
      .from('area_requests')
      .insert({
        user_id: userId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        prefecture: data.prefecture,
        city: data.city,
        votes: 1,
        status: 'open',
      })
      .select('*')
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    // Check if total requests for this city have reached admin notification threshold
    const { data: cityRequests, error: countErr } = await supabase
      .from('area_requests')
      .select('id', { count: 'exact', head: true })
      .eq('city', data.city);

    if (
      !countErr &&
      cityRequests &&
      (cityRequests as any).length >= AREA_REQUEST.THRESHOLD_TO_NOTIFY_ADMIN
    ) {
      // Notify admin(s)
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin: any) => ({
          user_id: admin.id,
          type: 'area_request_threshold',
          title: 'エリア拡大リクエストが閾値に到達',
          body: `${data.prefecture}${data.city}のリクエストが${AREA_REQUEST.THRESHOLD_TO_NOTIFY_ADMIN}件に達しました`,
          data: { city: data.city, prefecture: data.prefecture },
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    return { success: true, data: request as AreaRequest };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. voteForArea — Increment votes for an existing request
// ---------------------------------------------------------------------------

/**
 * Increment the vote count for an area request.
 */
export async function voteForArea(
  requestId: string,
  userId: string,
): Promise<Result<AreaRequest>> {
  try {
    // Fetch current request
    const { data: existing, error: fetchErr } = await supabase
      .from('area_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (!existing) return { success: false, error: 'リクエストが見つかりません' };

    // Prevent voting on own request
    if (existing.user_id === userId) {
      return { success: false, error: '自分のリクエストには投票できません' };
    }

    // Increment votes
    const newVotes = (existing.votes ?? 1) + 1;

    const { data: updated, error: updateErr } = await supabase
      .from('area_requests')
      .update({ votes: newVotes })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true, data: updated as AreaRequest };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getAreaRequests — List requests with optional filters
// ---------------------------------------------------------------------------

/**
 * Retrieve area requests, optionally filtered by prefecture and/or status.
 */
export async function getAreaRequests(
  filters?: AreaRequestFilters,
): Promise<Result<AreaRequest[]>> {
  try {
    let query = supabase
      .from('area_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.prefecture) {
      query = query.eq('prefecture', filters.prefecture);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as AreaRequest[] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getPopularRequests — Top requested areas by vote count
// ---------------------------------------------------------------------------

/**
 * Return the most popular area requests sorted by votes descending.
 */
export async function getPopularRequests(
  limit: number = 10,
): Promise<Result<AreaRequest[]>> {
  try {
    const { data, error } = await supabase
      .from('area_requests')
      .select('*')
      .eq('status', 'open')
      .order('votes', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as AreaRequest[] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. updateAreaStatus — Admin updates request status
// ---------------------------------------------------------------------------

/**
 * Update the status of an area request (admin action).
 * Valid statuses: 'open', 'planned', 'launched', 'rejected'.
 */
export async function updateAreaStatus(
  requestId: string,
  status: 'open' | 'planned' | 'launched' | 'rejected',
  adminId: string,
): Promise<Result<AreaRequest>> {
  try {
    // Verify the caller is an admin
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (profileErr) return { success: false, error: profileErr.message };
    if (!profile || profile.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    // Update status
    const { data: updated, error: updateErr } = await supabase
      .from('area_requests')
      .update({ status })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateErr) return { success: false, error: updateErr.message };
    if (!updated) return { success: false, error: 'リクエストが見つかりません' };

    // Notify the original requester about status change
    const statusLabels: Record<string, string> = {
      planned: 'サービス開始予定',
      launched: 'サービス開始',
      rejected: '対応見送り',
      open: '受付中',
    };

    await supabase.from('notifications').insert({
      user_id: updated.user_id,
      type: 'area_request_update',
      title: 'エリアリクエストのステータスが更新されました',
      body: `${updated.prefecture ?? ''}${updated.city ?? ''}のリクエストが「${statusLabels[status] ?? status}」に変更されました`,
      data: { request_id: requestId, status },
    });

    return { success: true, data: updated as AreaRequest };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
