import { supabase } from './supabase';
import { REFERRAL } from '@/constants/business-rules';

// =============================================
// 紹介プログラム（Referral Program）
// =============================================
// Referral code generation, usage, and stats.
// Awarding loyalty points to both referrer and referee.
// Auto-issuing a first-order coupon to the referee.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// 1. getOrCreateReferralCode — Get existing or generate a new referral code
// ---------------------------------------------------------------------------

export async function getOrCreateReferralCode(
  userId: string,
): Promise<Result<{ code: string }>> {
  try {
    // Check if user already has a referral code
    const { data: existing, error: fetchErr } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .single();

    if (!fetchErr && existing) {
      return { success: true, data: { code: existing.code } };
    }

    // Generate a random alphanumeric code
    const code = generateCode(REFERRAL.CODE_LENGTH);

    const { data: created, error: insertErr } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code,
        uses: 0,
        max_uses: REFERRAL.MAX_REFERRALS_PER_USER,
      })
      .select('code')
      .single();

    if (insertErr) {
      // Unique constraint on code — retry once with a fresh code
      if (insertErr.code === '23505') {
        const retryCode = generateCode(REFERRAL.CODE_LENGTH);
        const { data: retry, error: retryErr } = await supabase
          .from('referral_codes')
          .insert({
            user_id: userId,
            code: retryCode,
            uses: 0,
            max_uses: REFERRAL.MAX_REFERRALS_PER_USER,
          })
          .select('code')
          .single();

        if (retryErr) return { success: false, error: retryErr.message };
        return { success: true, data: { code: retry.code } };
      }
      return { success: false, error: insertErr.message };
    }

    return { success: true, data: { code: created.code } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. useReferralCode — Referee applies a code, both sides get rewards
// ---------------------------------------------------------------------------

export async function useReferralCode(
  refereeId: string,
  code: string,
): Promise<Result<{ referrerId: string; couponCode: string }>> {
  try {
    // 1. Validate the referral code
    const { data: referralCode, error: codeErr } = await supabase
      .from('referral_codes')
      .select('id, user_id, uses, max_uses')
      .eq('code', code)
      .single();

    if (codeErr || !referralCode) {
      return { success: false, error: '紹介コードが見つかりません' };
    }

    const referrerId = referralCode.user_id;

    // Cannot use own code
    if (referrerId === refereeId) {
      return { success: false, error: '自分の紹介コードは使用できません' };
    }

    // Check max uses
    if ((referralCode.uses ?? 0) >= (referralCode.max_uses ?? REFERRAL.MAX_REFERRALS_PER_USER)) {
      return { success: false, error: 'この紹介コードは使用上限に達しています' };
    }

    // 2. Check if referee has already used any code (UNIQUE referee_id)
    const { data: existingUse } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referee_id', refereeId)
      .limit(1);

    if (existingUse && existingUse.length > 0) {
      return { success: false, error: '紹介コードは1人1回のみ利用可能です' };
    }

    // 3. Award points to referrer
    await supabase.from('loyalty_transactions').insert({
      customer_id: referrerId,
      points: REFERRAL.REFERRER_REWARD,
      type: 'earn_referral',
      description: `紹介ボーナス（${REFERRAL.REFERRER_REWARD}pt）`,
    });

    await updateLoyaltyAccount(referrerId, REFERRAL.REFERRER_REWARD);

    // 4. Award points to referee
    await supabase.from('loyalty_transactions').insert({
      customer_id: refereeId,
      points: REFERRAL.REFEREE_REWARD,
      type: 'earn_referral',
      description: `被紹介ボーナス（${REFERRAL.REFEREE_REWARD}pt）`,
    });

    await updateLoyaltyAccount(refereeId, REFERRAL.REFEREE_REWARD);

    // 5. Create referee coupon
    const couponCode = `REF-${Date.now().toString(36).toUpperCase()}`;
    const validUntil = new Date(
      Date.now() + REFERRAL.REFEREE_COUPON.VALID_DAYS * 86400000,
    ).toISOString();

    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        type: REFERRAL.REFEREE_COUPON.TYPE,
        value: REFERRAL.REFEREE_COUPON.VALUE,
        max_uses: 1,
        valid_from: new Date().toISOString(),
        valid_until: validUntil,
        active: true,
      })
      .select('id')
      .single();

    let couponId: string | null = null;
    if (!couponErr && coupon) {
      couponId = coupon.id;
      // Assign coupon to referee
      await supabase.from('customer_coupons').insert({
        customer_id: refereeId,
        coupon_id: coupon.id,
      });
    }

    // 6. Insert referral_uses record
    const { error: useErr } = await supabase.from('referral_uses').insert({
      referral_code_id: referralCode.id,
      referrer_id: referrerId,
      referee_id: refereeId,
      referrer_reward_points: REFERRAL.REFERRER_REWARD,
      referee_reward_points: REFERRAL.REFEREE_REWARD,
      referee_coupon_id: couponId,
    });

    if (useErr) {
      // Unique constraint on referee_id = already used a code
      if (useErr.code === '23505') {
        return { success: false, error: '紹介コードは1人1回のみ利用可能です' };
      }
      return { success: false, error: useErr.message };
    }

    // 7. Increment uses count on referral_codes
    await supabase
      .from('referral_codes')
      .update({ uses: (referralCode.uses ?? 0) + 1 })
      .eq('id', referralCode.id);

    // 8. Notify both parties
    await supabase.from('notifications').insert({
      user_id: referrerId,
      type: 'coupon_issued',
      title: '紹介ボーナスを獲得しました',
      body: `あなたの紹介コードが使われました！${REFERRAL.REFERRER_REWARD}ptを付与しました。`,
      data: { referee_id: refereeId },
    });

    await supabase.from('notifications').insert({
      user_id: refereeId,
      type: 'coupon_issued',
      title: '紹介特典を獲得しました',
      body: `${REFERRAL.REFEREE_REWARD}ptと￥${REFERRAL.REFEREE_COUPON.VALUE.toLocaleString()}OFFクーポンをプレゼントしました。`,
      data: { coupon_code: couponCode },
    });

    return { success: true, data: { referrerId, couponCode } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getMyReferralStats — Code, total referrals, total points from referrals
// ---------------------------------------------------------------------------

type ReferralStats = {
  code: string | null;
  totalReferrals: number;
  totalPointsEarned: number;
};

export async function getMyReferralStats(
  userId: string,
): Promise<Result<ReferralStats>> {
  try {
    // Fetch referral code
    const { data: codeRow } = await supabase
      .from('referral_codes')
      .select('code, uses')
      .eq('user_id', userId)
      .single();

    // Fetch total points earned from referrals
    const { data: transactions } = await supabase
      .from('loyalty_transactions')
      .select('points')
      .eq('customer_id', userId)
      .eq('type', 'earn_referral');

    const totalPointsEarned = (transactions ?? []).reduce(
      (sum, t) => sum + (t.points ?? 0),
      0,
    );

    return {
      success: true,
      data: {
        code: codeRow?.code ?? null,
        totalReferrals: codeRow?.uses ?? 0,
        totalPointsEarned,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getMyReferrals — List of people I've referred (with names)
// ---------------------------------------------------------------------------

type ReferralEntry = {
  refereeId: string;
  refereeName: string | null;
  pointsAwarded: number;
  createdAt: string;
};

export async function getMyReferrals(
  userId: string,
): Promise<Result<ReferralEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('referral_uses')
      .select(`
        referee_id,
        referrer_reward_points,
        created_at,
        profiles!referral_uses_referee_id_fkey(full_name)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const referrals: ReferralEntry[] = (data ?? []).map((row: any) => ({
      refereeId: row.referee_id,
      refereeName: row.profiles?.full_name ?? null,
      pointsAwarded: row.referrer_reward_points,
      createdAt: row.created_at,
    }));

    return { success: true, data: referrals };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a random alphanumeric code of the given length.
 */
function generateCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit confusing chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Add points to a loyalty account and re-evaluate the tier.
 */
async function updateLoyaltyAccount(
  userId: string,
  points: number,
): Promise<void> {
  const { data: account } = await supabase
    .from('loyalty_accounts')
    .select('total_points, lifetime_points')
    .eq('id', userId)
    .single();

  if (!account) return;

  const newTotal = (account.total_points ?? 0) + points;
  const newLifetime = (account.lifetime_points ?? 0) + points;

  // Determine tier from LOYALTY constant (imported indirectly via the same pattern as reviews.ts)
  // We inline the tier lookup here to avoid a circular import on LOYALTY
  const TIERS = [
    { id: 'platinum', minPoints: 30000 },
    { id: 'gold', minPoints: 10000 },
    { id: 'silver', minPoints: 3000 },
    { id: 'bronze', minPoints: 0 },
  ];
  const newTier = TIERS.find((t) => newLifetime >= t.minPoints)?.id ?? 'bronze';

  await supabase
    .from('loyalty_accounts')
    .update({
      total_points: newTotal,
      lifetime_points: newLifetime,
      tier: newTier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}
