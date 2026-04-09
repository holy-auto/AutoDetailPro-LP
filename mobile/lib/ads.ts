import { supabase, verifyAdmin } from './supabase';
import { ADS, type AdType, type AdPlacement, type ProAdPlanId } from '@/constants/business-rules';

// =============================================
// 広告管理システム (Ads Management)
// =============================================
// プロの自己宣伝 + 外部バナー広告 + スポンサード広告
// 管理者審査必須、インプレッション/クリック計測付き

type MutationResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// 1. createProAd — プロが自分のサービスを宣伝
// ---------------------------------------------------------------------------

export async function createProAd(
  proId: string,
  planId: ProAdPlanId,
  options: {
    title: string;
    description?: string;
    imageUrl?: string;
    placement: AdPlacement;
    targetArea?: string;
    targetCategoryId?: string;
  },
): Promise<MutationResult<{ adId: string }>> {
  try {
    const plan = ADS.PRO_AD_PLANS.find((p) => p.id === planId);
    if (!plan) return { success: false, error: `不明なプラン: ${planId}` };

    if (!options.title.trim()) {
      return { success: false, error: 'タイトルを入力してください' };
    }
    if (options.title.length > ADS.MAX_TEXT_LENGTH) {
      return { success: false, error: `タイトルは${ADS.MAX_TEXT_LENGTH}文字以内にしてください` };
    }
    if (options.description && options.description.length > 500) {
      return { success: false, error: '説明文は500文字以内にしてください' };
    }

    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { data, error } = await supabase
      .from('ads')
      .insert({
        advertiser_id: proId,
        advertiser_type: 'pro',
        ad_type: ADS.TYPES.PRO_PROMOTION,
        title: options.title,
        description: options.description ?? null,
        image_url: options.imageUrl ?? null,
        placement: options.placement,
        target_area: options.targetArea ?? null,
        target_category_id: options.targetCategoryId ?? null,
        plan_id: planId,
        pricing_model: 'fixed',
        price: plan.price,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: ADS.REVIEW_REQUIRED ? 'pending_review' : 'active',
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: { adId: data.id } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. createExternalAd — 外部広告主がバナー広告を出稿
// ---------------------------------------------------------------------------

export async function createExternalAd(
  advertiserId: string,
  options: {
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl: string;
    ctaText?: string;
    placement: AdPlacement;
    adType: AdType;
    pricingModel: 'fixed' | 'cpc' | 'cpm';
    price: number;
    budgetLimit?: number;
    targetArea?: string;
    startsAt: string;
    expiresAt: string;
  },
): Promise<MutationResult<{ adId: string }>> {
  try {
    // Validate linkUrl is a proper URL
    if (options.linkUrl && !/^https?:\/\/.+/.test(options.linkUrl)) {
      return { success: false, error: 'リンクURLはhttp://またはhttps://で始まる必要があります' };
    }
    if (options.price < 0 || options.price > 100_000_000) {
      return { success: false, error: '料金が不正です' };
    }

    const { data, error } = await supabase
      .from('ads')
      .insert({
        advertiser_id: advertiserId,
        advertiser_type: 'external',
        ad_type: options.adType,
        title: options.title,
        description: options.description ?? null,
        image_url: options.imageUrl,
        link_url: options.linkUrl,
        cta_text: options.ctaText ?? 'もっと見る',
        placement: options.placement,
        target_area: options.targetArea ?? null,
        pricing_model: options.pricingModel,
        price: options.price,
        budget_limit: options.budgetLimit ?? null,
        starts_at: options.startsAt,
        expires_at: options.expiresAt,
        status: 'pending_review',
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: { adId: data.id } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getAdsForPlacement — 特定の配置に表示する広告を取得
// ---------------------------------------------------------------------------

export async function getAdsForPlacement(
  placement: AdPlacement,
  options?: { limit?: number; area?: string },
): Promise<MutationResult<any[]>> {
  try {
    const now = new Date().toISOString();
    let query = supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .eq('placement', placement)
      .lte('starts_at', now)
      .gte('expires_at', now)
      .limit(options?.limit ?? ADS.MAX_ADS_PER_SCREEN);

    if (options?.area) {
      query = query.or(`target_area.is.null,target_area.eq.${options.area}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. trackAdEvent — インプレッション/クリック計測
// ---------------------------------------------------------------------------

export async function trackAdEvent(
  adId: string,
  eventType: 'impression' | 'click' | 'dismiss',
  userId?: string,
  placement?: string,
): Promise<void> {
  try {
    // イベント記録
    await supabase.from('ad_events').insert({
      ad_id: adId,
      user_id: userId ?? null,
      event_type: eventType,
      placement: placement ?? null,
    });

    // 広告テーブルのカウンターも更新
    if (eventType === 'impression') {
      await supabase.rpc('increment_ad_impressions', { ad_id_param: adId });
    } else if (eventType === 'click') {
      await supabase.rpc('increment_ad_clicks', { ad_id_param: adId });
    }
  } catch {
    // 計測失敗はUXに影響させない
  }
}

// ---------------------------------------------------------------------------
// 5. reviewAd — 管理者が広告を審査
// ---------------------------------------------------------------------------

export async function reviewAd(
  adId: string,
  approved: boolean,
  rejectionReason?: string,
): Promise<MutationResult> {
  try {
    // Verify caller is an authenticated admin
    const adminId = await verifyAdmin();
    if (!adminId) {
      return { success: false, error: '管理者権限が必要です' };
    }

    const { error } = await supabase
      .from('ads')
      .update({
        status: approved ? 'active' : 'rejected',
        rejection_reason: approved ? null : (rejectionReason ?? null),
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', adId);

    if (error) return { success: false, error: error.message };

    // 広告主に通知
    const { data: ad } = await supabase
      .from('ads')
      .select('advertiser_id, title')
      .eq('id', adId)
      .single();

    if (ad) {
      // Sanitize user content in notification body
      const safeTitle = (ad.title as string).replace(/[\x00-\x1F\x7F]/g, '').slice(0, 50);
      const safeReason = rejectionReason
        ? rejectionReason.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 100)
        : '';
      await supabase.from('notifications').insert({
        user_id: ad.advertiser_id,
        type: 'ad_review',
        title: approved ? '広告が承認されました' : '広告が却下されました',
        body: approved
          ? `「${safeTitle}」の掲載が開始されます。`
          : `「${safeTitle}」は掲載できません。理由: ${safeReason}`,
        data: { ad_id: adId },
      });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getMyAds — 広告主の自分の広告一覧
// ---------------------------------------------------------------------------

export async function getMyAds(
  advertiserId: string,
  limit: number = 50,
): Promise<MutationResult<any[]>> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7. getAdStats — 広告のパフォーマンス統計
// ---------------------------------------------------------------------------

export async function getAdStats(
  adId: string,
  advertiserId: string,
): Promise<MutationResult<{
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
}>> {
  try {
    const { data: ad, error } = await supabase
      .from('ads')
      .select('impressions, clicks, price, pricing_model')
      .eq('id', adId)
      .eq('advertiser_id', advertiserId)
      .single();

    if (error || !ad) return { success: false, error: '広告が見つからないか、操作権限がありません' };

    const impressions = ad.impressions ?? 0;
    const clicks = ad.clicks ?? 0;
    const ctr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;

    let spend = ad.price;
    if (ad.pricing_model === 'cpc') spend = clicks * ad.price;
    if (ad.pricing_model === 'cpm') spend = Math.floor(impressions / 1000) * ad.price;

    return { success: true, data: { impressions, clicks, ctr, spend } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 8. pauseAd / resumeAd — 広告の一時停止/再開
// ---------------------------------------------------------------------------

export async function pauseAd(adId: string, advertiserId: string): Promise<MutationResult> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', adId)
      .eq('advertiser_id', advertiserId)
      .eq('status', 'active')
      .select('id')
      .single();

    if (error || !data) return { success: false, error: '広告が見つからないか、操作権限がありません' };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function resumeAd(adId: string, advertiserId: string): Promise<MutationResult> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', adId)
      .eq('advertiser_id', advertiserId)
      .eq('status', 'paused')
      .select('id')
      .single();

    if (error || !data) return { success: false, error: '広告が見つからないか、操作権限がありません' };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 9. getPendingAds — 管理者用：審査待ち広告一覧
// ---------------------------------------------------------------------------

export async function getPendingAds(): Promise<MutationResult<any[]>> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select(`*, profiles!advertiser_id(full_name, email)`)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 10. expireAds — 期限切れ広告を自動失効（cron用）
// ---------------------------------------------------------------------------

export async function expireAds(): Promise<MutationResult<{ expired: number }>> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('ads')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', now)
      .select('id');

    if (error) return { success: false, error: error.message };
    return { success: true, data: { expired: data?.length ?? 0 } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
