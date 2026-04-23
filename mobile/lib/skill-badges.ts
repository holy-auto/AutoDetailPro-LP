import { supabase } from './supabase';
import { SKILL_BADGES, type SkillBadgeId } from '@/constants/business-rules';

// =============================================
// Pro Skill Badges — Evaluate, Award & Query
// =============================================
// Automatically checks badge requirements for a pro,
// inserts newly earned badges, and provides query helpers.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type BadgeDefinition = (typeof SKILL_BADGES.BADGES)[number];

type EarnedBadge = {
  id: string;
  badge_id: SkillBadgeId;
  earned_at: string;
} & BadgeDefinition;

// ---------------------------------------------------------------------------
// Badge requirement checkers
// ---------------------------------------------------------------------------

type BadgeChecker = (proId: string) => Promise<boolean>;

const badgeCheckers: Record<SkillBadgeId, BadgeChecker> = {
  /**
   * coating_master: Completed orders with category 'coating' >= 50
   */
  coating_master: async (proId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('pro_id', proId)
      .eq('category_id', 'coating')
      .in('status', ['completed', 'auto_completed', 'closed']);

    if (error) return false;
    return (data as any)?.length >= 50 || ((data as any) ?? 0) >= 50;
  },

  /**
   * speed_pro: Average work time in top 10% (simplified: < 60 min avg)
   */
  speed_pro: async (proId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('started_at, completed_at')
      .eq('pro_id', proId)
      .in('status', ['completed', 'auto_completed', 'closed'])
      .not('started_at', 'is', null)
      .not('completed_at', 'is', null);

    if (error || !data || data.length === 0) return false;

    let totalMinutes = 0;
    let validCount = 0;
    for (const order of data) {
      if (order.started_at && order.completed_at) {
        const start = new Date(order.started_at).getTime();
        const end = new Date(order.completed_at).getTime();
        const minutes = (end - start) / (1000 * 60);
        if (minutes > 0) {
          totalMinutes += minutes;
          validCount++;
        }
      }
    }

    if (validCount === 0) return false;
    const avgMinutes = totalMinutes / validCount;
    return avgMinutes < 60;
  },

  /**
   * five_star: Average rating of last 50 reviews >= 4.8
   */
  five_star: async (proId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', proId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length < 50) return false;

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / data.length;
    return avg >= 4.8;
  },

  /**
   * repeat_magnet: Repeat customer rate >= 60%
   */
  repeat_magnet: async (proId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('pro_id', proId)
      .in('status', ['completed', 'auto_completed', 'closed']);

    if (error || !data || data.length === 0) return false;

    const customerCounts = new Map<string, number>();
    for (const order of data) {
      const cid = order.customer_id;
      customerCounts.set(cid, (customerCounts.get(cid) ?? 0) + 1);
    }

    const totalCustomers = customerCounts.size;
    if (totalCustomers === 0) return false;

    const repeatCustomers = Array.from(customerCounts.values()).filter(
      (count) => count >= 2,
    ).length;

    return repeatCustomers / totalCustomers >= 0.6;
  },

  /**
   * early_bird: Early morning (before 10am) completed orders >= 100
   */
  early_bird: async (proId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('started_at')
      .eq('pro_id', proId)
      .in('status', ['completed', 'auto_completed', 'closed'])
      .not('started_at', 'is', null);

    if (error || !data) return false;

    const earlyCount = data.filter((order) => {
      if (!order.started_at) return false;
      const hour = new Date(order.started_at).getHours();
      return hour < 10;
    }).length;

    return earlyCount >= 100;
  },

  /**
   * veteran: Total completed orders >= 500
   */
  veteran: async (proId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('pro_id', proId)
      .in('status', ['completed', 'auto_completed', 'closed']);

    if (error) return false;
    return (data as any)?.length >= 500 || ((data as any) ?? 0) >= 500;
  },
};

// ---------------------------------------------------------------------------
// 1. evaluateBadges — Check all requirements, award new badges
// ---------------------------------------------------------------------------

/**
 * Evaluate all badge requirements for a pro.
 * Auto-awards newly earned badges by inserting into `pro_badges`.
 * Returns only the badges that were newly earned in this evaluation.
 */
export async function evaluateBadges(
  proId: string,
): Promise<Result<BadgeDefinition[]>> {
  try {
    // Fetch already-earned badges
    const { data: existingBadges, error: fetchErr } = await supabase
      .from('pro_badges')
      .select('badge_id')
      .eq('pro_id', proId);

    if (fetchErr) return { success: false, error: fetchErr.message };

    const earnedSet = new Set(
      (existingBadges ?? []).map((b: any) => b.badge_id),
    );

    const newlyEarned: BadgeDefinition[] = [];

    // Check each badge
    for (const badge of SKILL_BADGES.BADGES) {
      // Skip already-earned badges
      if (earnedSet.has(badge.id)) continue;

      const checker = badgeCheckers[badge.id as SkillBadgeId];
      if (!checker) continue;

      const qualified = await checker(proId);
      if (!qualified) continue;

      // Award badge
      const { error: insertErr } = await supabase
        .from('pro_badges')
        .insert({ pro_id: proId, badge_id: badge.id });

      // Ignore unique constraint violations (race condition safety)
      if (insertErr && insertErr.code !== '23505') {
        continue;
      }

      newlyEarned.push(badge);
    }

    return { success: true, data: newlyEarned };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getProBadges — Get earned badges with full metadata
// ---------------------------------------------------------------------------

/**
 * Returns all badges a pro has earned, enriched with badge metadata.
 */
export async function getProBadges(
  proId: string,
): Promise<Result<EarnedBadge[]>> {
  try {
    const { data, error } = await supabase
      .from('pro_badges')
      .select('id, badge_id, earned_at')
      .eq('pro_id', proId)
      .order('earned_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    const badgeMap = new Map(
      SKILL_BADGES.BADGES.map((b) => [b.id, b]),
    );

    const enriched: EarnedBadge[] = (data ?? [])
      .map((row: any) => {
        const meta = badgeMap.get(row.badge_id);
        if (!meta) return null;
        return {
          ...meta,
          id: row.id,
          badge_id: row.badge_id as SkillBadgeId,
          earned_at: row.earned_at,
        };
      })
      .filter(Boolean) as EarnedBadge[];

    return { success: true, data: enriched };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getAllBadgeDefinitions — Return all badge definitions
// ---------------------------------------------------------------------------

/**
 * Returns the full list of badge definitions with descriptions.
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return [...SKILL_BADGES.BADGES];
}
