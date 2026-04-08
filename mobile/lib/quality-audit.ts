import { supabase } from './supabase';
import { QUALITY_AUDIT } from '@/constants/business-rules';

// =============================================
// 覆面調査（ミステリーショッパー）— Quality Audit System
// =============================================
// お客様に抜き打ちで品質チェックを依頼。
// 協力いただいたらクーポンを自動発行。
// 結果はプロの改善プランにも連動。

type MutationResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// 1. shouldTriggerAudit — 注文完了時に調査対象か判定
// ---------------------------------------------------------------------------

/**
 * 完了した注文に対して覆面調査を依頼するかどうかをランダム判定。
 * SELECTION_RATE (15%) の確率で true を返す。
 * ただし、同じプロに対して直近7日以内に調査があった場合はスキップ。
 */
export async function shouldTriggerAudit(
  proId: string,
): Promise<boolean> {
  // ランダム判定
  if (Math.random() > QUALITY_AUDIT.SELECTION_RATE) return false;

  // 直近7日以内に同じプロへの調査があればスキップ
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: recent } = await supabase
    .from('quality_audits')
    .select('id')
    .eq('pro_id', proId)
    .gte('created_at', sevenDaysAgo)
    .limit(1);

  return !recent?.length;
}

// ---------------------------------------------------------------------------
// 2. createAuditRequest — 調査依頼を作成
// ---------------------------------------------------------------------------

export async function createAuditRequest(
  orderId: string,
  customerId: string,
  proId: string,
): Promise<MutationResult<{ auditId: string }>> {
  try {
    const expiresAt = new Date(
      Date.now() + QUALITY_AUDIT.EXPIRY_HOURS * 3600000,
    ).toISOString();

    const { data, error } = await supabase
      .from('quality_audits')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        pro_id: proId,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };

    // 通知を送信
    await supabase.from('notifications').insert({
      user_id: customerId,
      type: 'quality_audit_request',
      title: '品質チェックのお願い',
      body: 'サービスの品質向上のため、簡単なアンケートにご協力ください。お礼にクーポンをプレゼントします！',
      data: { audit_id: data.id, order_id: orderId },
    });

    return { success: true, data: { auditId: data.id } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. submitAuditResponse — お客様がチェックリスト回答を送信
// ---------------------------------------------------------------------------

export type AuditResponse = {
  auditId: string;
  scores: Record<string, number>; // checklistId → 1-5
  comment?: string;
};

export async function submitAuditResponse(
  response: AuditResponse,
): Promise<MutationResult<{ couponCode: string; overallScore: number }>> {
  try {
    // 1. 調査レコード取得
    const { data: audit, error: auditErr } = await supabase
      .from('quality_audits')
      .select('*')
      .eq('id', response.auditId)
      .single();

    if (auditErr || !audit) {
      return { success: false, error: '調査が見つかりません' };
    }
    if (audit.status !== 'pending') {
      return { success: false, error: 'この調査は既に回答済みです' };
    }
    if (new Date(audit.expires_at) < new Date()) {
      return { success: false, error: '回答期限が過ぎています' };
    }

    // 2. 加重平均スコアを計算
    let totalWeight = 0;
    let weightedSum = 0;
    for (const item of QUALITY_AUDIT.CHECKLIST) {
      const score = response.scores[item.id];
      if (score !== undefined) {
        weightedSum += score * item.weight;
        totalWeight += item.weight;
      }
    }
    const overallScore = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : 0;

    // 3. 調査レコードを更新
    const { error: updateErr } = await supabase
      .from('quality_audits')
      .update({
        status: 'completed',
        scores: response.scores,
        overall_score: overallScore,
        comment: response.comment ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', response.auditId);

    if (updateErr) return { success: false, error: updateErr.message };

    // 4. 報酬クーポンを発行
    const couponCode = `AUDIT-${Date.now().toString(36).toUpperCase()}`;
    const validUntil = new Date(
      Date.now() + QUALITY_AUDIT.REWARD_COUPON.VALID_DAYS * 86400000,
    ).toISOString();

    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        type: QUALITY_AUDIT.REWARD_COUPON.TYPE,
        value: QUALITY_AUDIT.REWARD_COUPON.VALUE,
        max_uses: 1,
        valid_from: new Date().toISOString(),
        valid_until: validUntil,
        active: true,
      })
      .select('id')
      .single();

    if (!couponErr && coupon) {
      // クーポンをお客様に割当
      await supabase.from('customer_coupons').insert({
        customer_id: audit.customer_id,
        coupon_id: coupon.id,
      });
    }

    // 5. お客様にクーポン発行を通知
    await supabase.from('notifications').insert({
      user_id: audit.customer_id,
      type: 'audit_reward',
      title: 'ご協力ありがとうございます！',
      body: `品質チェックのお礼に${QUALITY_AUDIT.REWARD_COUPON.VALUE}%OFFクーポンをプレゼントしました。`,
      data: { coupon_code: couponCode },
    });

    // 6. 低スコアの場合はプロへの処理をチェック
    if (overallScore < QUALITY_AUDIT.TRIGGER_IMPROVEMENT_BELOW) {
      await handleLowAuditScore(audit.pro_id, overallScore);
    }

    return { success: true, data: { couponCode, overallScore } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. handleLowAuditScore — 低スコア時のプロへのアクション
// ---------------------------------------------------------------------------

async function handleLowAuditScore(proId: string, score: number) {
  // 直近の調査スコアを取得して連続低スコアをチェック
  const { data: recentAudits } = await supabase
    .from('quality_audits')
    .select('overall_score')
    .eq('pro_id', proId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(QUALITY_AUDIT.CONSECUTIVE_LOW_THRESHOLD);

  const consecutiveLow = recentAudits?.every(
    (a) => (a.overall_score ?? 5) < QUALITY_AUDIT.TRIGGER_IMPROVEMENT_BELOW,
  );

  if (consecutiveLow && (recentAudits?.length ?? 0) >= QUALITY_AUDIT.CONSECUTIVE_LOW_THRESHOLD) {
    // 連続低スコア → 改善プランが未発動なら自動発動
    const { data: existingPlan } = await supabase
      .from('improvement_plans')
      .select('id')
      .eq('pro_id', proId)
      .in('status', ['active', 'extended'])
      .limit(1);

    if (!existingPlan?.length) {
      const evaluationAt = new Date();
      evaluationAt.setDate(evaluationAt.getDate() + 30);

      await supabase.from('improvement_plans').insert({
        pro_id: proId,
        reason: `覆面調査で${QUALITY_AUDIT.CONSECUTIVE_LOW_THRESHOLD}回連続低スコア（直近: ${score.toFixed(1)}）`,
        rating_at_start: score,
        target_rating: QUALITY_AUDIT.PASSING_SCORE,
        evaluation_at: evaluationAt.toISOString(),
      });

      await supabase.from('pro_profiles').update({
        improvement_status: 'active',
        improvement_started_at: new Date().toISOString(),
      }).eq('id', proId);

      // プロに通知
      await supabase.from('notifications').insert({
        user_id: proId,
        type: 'improvement_plan_started',
        title: '改善プランが開始されました',
        body: '品質チェックの結果を踏まえ、30日間の改善プランが適用されました。詳細をご確認ください。',
        data: { reason: 'quality_audit' },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. getMyPendingAudits — お客様の未回答調査を取得
// ---------------------------------------------------------------------------

export async function getMyPendingAudits(
  customerId: string,
): Promise<MutationResult<any[]>> {
  try {
    const { data, error } = await supabase
      .from('quality_audits')
      .select(`
        id, order_id, status, expires_at, created_at,
        orders!inner(
          id, amount, completed_at,
          menus(name, category_id)
        )
      `)
      .eq('customer_id', customerId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getProAuditSummary — プロの調査結果サマリー（管理者・プロ本人用）
// ---------------------------------------------------------------------------

export async function getProAuditSummary(
  proId: string,
): Promise<MutationResult<{
  totalAudits: number;
  averageScore: number;
  categoryScores: Record<string, number>;
  recentAudits: any[];
}>> {
  try {
    const { data: audits, error } = await supabase
      .from('quality_audits')
      .select('*')
      .eq('pro_id', proId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const completed = audits ?? [];
    const totalAudits = completed.length;

    // 全体平均
    const averageScore = totalAudits > 0
      ? completed.reduce((sum, a) => sum + (a.overall_score ?? 0), 0) / totalAudits
      : 0;

    // カテゴリ別平均
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    for (const audit of completed) {
      if (!audit.scores) continue;
      for (const item of QUALITY_AUDIT.CHECKLIST) {
        const score = audit.scores[item.id];
        if (score !== undefined) {
          if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = { sum: 0, count: 0 };
          }
          categoryTotals[item.category].sum += score;
          categoryTotals[item.category].count++;
        }
      }
    }
    const categoryScores: Record<string, number> = {};
    for (const [cat, { sum, count }] of Object.entries(categoryTotals)) {
      categoryScores[cat] = Math.round((sum / count) * 100) / 100;
    }

    return {
      success: true,
      data: {
        totalAudits,
        averageScore: Math.round(averageScore * 100) / 100,
        categoryScores,
        recentAudits: completed.slice(0, 10),
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7. expireOldAudits — 期限切れ調査を自動失効（cron用）
// ---------------------------------------------------------------------------

export async function expireOldAudits(): Promise<MutationResult<{ expired: number }>> {
  try {
    const { data, error } = await supabase
      .from('quality_audits')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) return { success: false, error: error.message };
    return { success: true, data: { expired: data?.length ?? 0 } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
