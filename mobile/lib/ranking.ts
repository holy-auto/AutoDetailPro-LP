import { PRO_RANKING, PRO_BOOST, IMPROVEMENT_STATUS } from '@/constants/business-rules';
import { supabase } from './supabase';

// =============================================
// Pro Ranking & Scoring Engine
// =============================================

export type ProRankData = {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  distance: number;        // km
  responseRate: number;    // 0-1
  completionRate: number;  // 0-1
  createdAt: string;       // ISO date
  // Boost
  boostActive: boolean;
  boostExpiresAt?: string;
  // Improvement plan
  improvementStatus?: string | null;
  // Location (optional — populated by fetchRankedPros)
  latitude?: number;
  longitude?: number;
  // Top speciality (optional — populated by fetchRankedPros from menus)
  speciality?: string;
  // Computed
  score?: number;
  isNewcomer?: boolean;
  badges?: string[];
};

const W = PRO_RANKING.SCORE_WEIGHTS;

/**
 * Calculate ranking score for a single pro.
 * Higher score = shown first.
 */
export function calculateScore(pro: ProRankData): number {
  let score = 0;

  // 1. Rating score (0–RATING weight)
  // 5.0 → full points, 1.0 → 0
  const ratingNorm = Math.max(0, (pro.rating - 1) / 4); // 0–1
  score += ratingNorm * W.RATING;

  // 2. Distance score (0–DISTANCE weight)
  // 0 km → full, 15 km → 0
  const distNorm = Math.max(0, 1 - pro.distance / 15);
  score += distNorm * W.DISTANCE;

  // 3. Response rate score (0–RESPONSE_RATE weight)
  score += pro.responseRate * W.RESPONSE_RATE;

  // 4. Completion rate score (0–COMPLETION_RATE weight)
  score += pro.completionRate * W.COMPLETION_RATE;

  // 5. Newcomer bonus
  const daysSinceCreation = daysSince(pro.createdAt);
  const isNewcomer = daysSinceCreation <= PRO_RANKING.NEWCOMER_BOOST_DAYS;
  if (isNewcomer) {
    // Linearly decay: full bonus on day 1, 0 at day 30
    const decay = 1 - daysSinceCreation / PRO_RANKING.NEWCOMER_BOOST_DAYS;
    score += PRO_RANKING.NEWCOMER_BOOST_WEIGHT * decay;
  }

  // 6. Paid boost bonus
  if (pro.boostActive) {
    const plan = PRO_BOOST.PLANS.find((p) => true); // any active boost
    score += plan?.boost_weight ?? PRO_BOOST.PLANS[0].boost_weight;
  }

  // 7. Improvement plan penalty — push to bottom but still show
  if (pro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE) {
    score -= 20;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Sort and annotate a list of pros by ranking score.
 */
export function rankPros(pros: ProRankData[]): ProRankData[] {
  return pros
    .map((pro) => {
      const daysSinceCreation = daysSince(pro.createdAt);
      const isNewcomer = daysSinceCreation <= PRO_RANKING.NEWCOMER_BOOST_DAYS;
      const badges: string[] = [];

      if (isNewcomer) badges.push('新人');
      if (pro.boostActive) badges.push(PRO_BOOST.BADGE_TEXT);
      if (pro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE) badges.push('改善中');
      if (pro.rating >= PRO_RANKING.RATING_GOOD_THRESHOLD && pro.reviewCount >= 10) {
        badges.push('高評価');
      }

      return {
        ...pro,
        score: calculateScore(pro),
        isNewcomer,
        badges,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Evaluate a pro's rating and return the appropriate action.
 */
export type RatingEvaluation =
  | { action: 'ok' }
  | { action: 'improvement_plan'; reason: string }
  | { action: 'forced_removal'; reason: string };

export function evaluateRating(
  rating: number,
  reviewCount: number,
  currentImprovementStatus?: string | null,
): RatingEvaluation {
  // Not enough reviews to evaluate
  if (reviewCount < PRO_RANKING.MIN_REVIEWS_FOR_EVALUATION) {
    return { action: 'ok' };
  }

  // Immediate removal for extremely low ratings
  if (rating < PRO_RANKING.FORCED_REMOVAL.RATING_FLOOR) {
    return {
      action: 'forced_removal',
      reason: `評価 ${rating} が最低基準 ${PRO_RANKING.FORCED_REMOVAL.RATING_FLOOR} を下回っています`,
    };
  }

  // Already on a failed improvement plan → forced removal
  if (currentImprovementStatus === IMPROVEMENT_STATUS.FAILED) {
    return {
      action: 'forced_removal',
      reason: '改善プランの目標を達成できませんでした',
    };
  }

  // Below warning threshold → trigger improvement plan
  if (rating < PRO_RANKING.RATING_WARNING_THRESHOLD) {
    return {
      action: 'improvement_plan',
      reason: `評価 ${rating} が基準 ${PRO_RANKING.RATING_WARNING_THRESHOLD} を下回っています`,
    };
  }

  return { action: 'ok' };
}

/**
 * Check if a pro's improvement plan has succeeded or failed.
 */
export type ImprovementResult =
  | { result: 'passed'; newRating: number }
  | { result: 'failed'; newRating: number; canExtend: boolean }
  | { result: 'in_progress' };

export function checkImprovementPlan(
  currentRating: number,
  ordersCompleted: number,
  planStartDate: string,
  extensionCount: number,
): ImprovementResult {
  const daysElapsed = daysSince(planStartDate);
  const plan = PRO_RANKING.IMPROVEMENT_PLAN;

  // Still within evaluation period
  if (daysElapsed < plan.EVALUATION_PERIOD_DAYS) {
    return { result: 'in_progress' };
  }

  // Check if target met
  if (
    currentRating >= plan.TARGET_RATING &&
    ordersCompleted >= plan.MIN_ORDERS_DURING_PLAN
  ) {
    return { result: 'passed', newRating: currentRating };
  }

  // Failed — check if extension possible
  const canExtend = extensionCount < plan.MAX_EXTENSIONS;
  return { result: 'failed', newRating: currentRating, canExtend };
}

/**
 * Fetch pro ranking data from Supabase and return sorted list.
 */
export async function fetchRankedPros(
  customerLat: number,
  customerLng: number,
  radiusKm: number,
): Promise<ProRankData[]> {
  const { data, error } = await supabase
    .from('pro_profiles')
    .select(`
      id,
      latitude,
      longitude,
      is_online,
      created_at,
      response_rate,
      completion_rate,
      boost_plan_id,
      boost_expires_at,
      improvement_status,
      profiles!inner(full_name, avatar_url),
      menus(id, name, price, category_id)
    `)
    .eq('is_online', true)
    .eq('suspended', false);

  if (error || !data) return [];

  const now = new Date();
  const pros: ProRankData[] = data
    .map((row) => {
      if (!row.latitude || !row.longitude) return null;

      const dist = haversineKm(
        customerLat,
        customerLng,
        row.latitude,
        row.longitude,
      );
      if (dist > radiusKm) return null;

      const boostActive =
        !!row.boost_plan_id &&
        !!row.boost_expires_at &&
        new Date(row.boost_expires_at) > now;

      const menus = (row.menus as any) ?? [];
      const firstMenuName = Array.isArray(menus) && menus.length > 0
        ? menus[0]?.name
        : undefined;

      return {
        id: row.id,
        name: (row.profiles as any)?.full_name ?? 'プロ',
        avatarUrl: (row.profiles as any)?.avatar_url,
        rating: 0, // will be filled from reviews aggregate
        reviewCount: 0,
        distance: dist,
        responseRate: row.response_rate ?? 0.9,
        completionRate: row.completion_rate ?? 0.95,
        createdAt: row.created_at,
        boostActive,
        boostExpiresAt: row.boost_expires_at,
        improvementStatus: row.improvement_status,
        latitude: row.latitude,
        longitude: row.longitude,
        speciality: firstMenuName,
      };
    })
    .filter(Boolean) as ProRankData[];

  // Fetch aggregated ratings
  if (pros.length > 0) {
    const proIds = pros.map((p) => p.id);
    const { data: reviews } = await supabase
      .from('reviews')
      .select('target_id, rating')
      .in('target_id', proIds);

    if (reviews) {
      const ratingMap = new Map<string, { sum: number; count: number }>();
      for (const r of reviews) {
        const entry = ratingMap.get(r.target_id) ?? { sum: 0, count: 0 };
        entry.sum += r.rating;
        entry.count += 1;
        ratingMap.set(r.target_id, entry);
      }
      for (const pro of pros) {
        const entry = ratingMap.get(pro.id);
        if (entry) {
          pro.rating = Math.round((entry.sum / entry.count) * 10) / 10;
          pro.reviewCount = entry.count;
        }
      }
    }
  }

  return rankPros(pros);
}

// --- Helpers ---

function daysSince(isoDate: string): number {
  return Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
