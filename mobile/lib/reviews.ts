import { supabase } from './supabase';
import { REVIEW, LOYALTY } from '@/constants/business-rules';

// =============================================
// レビュー（Reviews）— Submit, Query, Stats
// =============================================
// One-sided reviews (customer → pro).
// Awarding loyalty points on submission.
// Notification to the target pro.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type Review = {
  id: string;
  order_id: string;
  reviewer_id: string;
  target_id: string;
  rating: number;
  comment: string | null;
  tags: string[] | null;
  created_at: string;
};

type ReviewWithReviewer = Review & {
  reviewer_name: string | null;
};

type ReviewStats = {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>; // 1-5 → count
};

// ---------------------------------------------------------------------------
// 1. submitReview — Insert review, award points, notify target
// ---------------------------------------------------------------------------

export async function submitReview(
  orderId: string,
  reviewerId: string,
  targetId: string,
  rating: number,
  comment?: string,
  tags?: string[],
): Promise<Result<Review>> {
  try {
    // Validate rating is an integer in the allowed range
    if (!Number.isInteger(rating) || rating < REVIEW.MIN_RATING || rating > REVIEW.MAX_RATING) {
      return {
        success: false,
        error: `評価は${REVIEW.MIN_RATING}〜${REVIEW.MAX_RATING}の整数で指定してください`,
      };
    }

    // Validate comment length
    if (comment && comment.length > 1000) {
      return { success: false, error: 'コメントは1000文字以内で入力してください' };
    }

    // Check eligibility
    const eligibility = await canReview(orderId, reviewerId);
    if (!eligibility.success || !eligibility.data?.canReview) {
      return {
        success: false,
        error: eligibility.data?.reason ?? 'レビューを投稿できません',
      };
    }

    // Insert review
    const { data: review, error: insertErr } = await supabase
      .from('reviews')
      .insert({
        order_id: orderId,
        reviewer_id: reviewerId,
        target_id: targetId,
        rating,
        comment: comment ?? null,
        tags: tags ?? null,
      })
      .select('*')
      .single();

    if (insertErr) {
      // Unique constraint violation = already reviewed
      if (insertErr.code === '23505') {
        return { success: false, error: 'この注文のレビューは既に投稿済みです' };
      }
      return { success: false, error: insertErr.message };
    }

    // Award loyalty points for review
    const pointsToAward = LOYALTY.REVIEW_BONUS;

    await supabase.from('loyalty_transactions').insert({
      customer_id: reviewerId,
      order_id: orderId,
      points: pointsToAward,
      type: 'earn_review',
      description: `レビュー投稿ボーナス（${pointsToAward}pt）`,
    });

    // Update loyalty account total
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('total_points, lifetime_points')
      .eq('id', reviewerId)
      .single();

    if (account) {
      const newTotal = (account.total_points ?? 0) + pointsToAward;
      const newLifetime = (account.lifetime_points ?? 0) + pointsToAward;

      // Determine tier
      const tiers = [...LOYALTY.TIERS].reverse();
      const newTier =
        tiers.find((t) => newLifetime >= t.minPoints)?.id ?? 'bronze';

      await supabase
        .from('loyalty_accounts')
        .update({
          total_points: newTotal,
          lifetime_points: newLifetime,
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewerId);
    }

    // Notify the target pro (sanitize user content — truncate, strip control chars)
    const safeComment = comment
      ? comment.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 50)
      : '';
    await supabase.from('notifications').insert({
      user_id: targetId,
      type: 'review_received',
      title: '新しいレビューが届きました',
      body: `${rating}つ星のレビューをいただきました。${safeComment ? `「${safeComment}${(comment?.length ?? 0) > 50 ? '...' : ''}」` : ''}`,
      data: { review_id: review.id, order_id: orderId, rating },
    });

    return { success: true, data: review as Review };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getProReviews — Get reviews for a pro with reviewer name
// ---------------------------------------------------------------------------

export async function getProReviews(
  proId: string,
  limit: number = 20,
): Promise<Result<ReviewWithReviewer[]>> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, order_id, reviewer_id, target_id, rating, comment, created_at,
        profiles!reviews_reviewer_id_fkey(full_name)
      `)
      .eq('target_id', proId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) return { success: false, error: error.message };

    const reviews: ReviewWithReviewer[] = (data ?? []).map((row: any) => ({
      id: row.id,
      order_id: row.order_id,
      reviewer_id: row.reviewer_id,
      target_id: row.target_id,
      rating: row.rating,
      comment: row.comment,
      tags: row.tags ?? null,
      created_at: row.created_at,
      reviewer_name: row.profiles?.full_name ?? null,
    }));

    return { success: true, data: reviews };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getMyReviews — Get reviews I've written
// ---------------------------------------------------------------------------

export async function getMyReviews(
  userId: string,
): Promise<Result<Review[]>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as Review[] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getReviewStats — Average rating, count, rating distribution
// ---------------------------------------------------------------------------

export async function getReviewStats(
  proId: string,
): Promise<Result<ReviewStats>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', proId);

    if (error) return { success: false, error: error.message };

    const reviews = data ?? [];
    const totalCount = reviews.length;

    if (totalCount === 0) {
      return {
        success: true,
        data: {
          averageRating: 0,
          totalCount: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / totalCount) * 100) / 100;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    }

    return {
      success: true,
      data: { averageRating, totalCount, distribution },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. canReview — Check if already reviewed, order completed, within window
// ---------------------------------------------------------------------------

export async function canReview(
  orderId: string,
  reviewerId: string,
): Promise<Result<{ canReview: boolean; reason?: string }>> {
  try {
    // Check if already reviewed
    const { data: existing, error: existErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('reviewer_id', reviewerId)
      .limit(1);

    if (existErr) return { success: false, error: existErr.message };

    if (existing && existing.length > 0) {
      return {
        success: true,
        data: { canReview: false, reason: 'この注文のレビューは既に投稿済みです' },
      };
    }

    // Check order status — must be completed, auto_completed, review_open, or closed
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('status, completed_at')
      .eq('id', orderId)
      .single();

    if (orderErr) return { success: false, error: orderErr.message };
    if (!order) {
      return {
        success: true,
        data: { canReview: false, reason: '注文が見つかりません' },
      };
    }

    const reviewableStatuses = [
      'completed',
      'auto_completed',
      'review_open',
      'closed',
    ];
    if (!reviewableStatuses.includes(order.status)) {
      return {
        success: true,
        data: { canReview: false, reason: '注文が完了していません' },
      };
    }

    // Check review window — allow reviews within 30 days of completion
    if (order.completed_at) {
      const completedAt = new Date(order.completed_at).getTime();
      const windowMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - completedAt > windowMs) {
        return {
          success: true,
          data: { canReview: false, reason: 'レビュー期限（30日）が過ぎています' },
        };
      }
    }

    return { success: true, data: { canReview: true } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
