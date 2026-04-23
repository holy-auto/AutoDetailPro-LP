import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { useAuth } from '../_layout';

type AdStatus = 'pending_review' | 'active' | 'paused' | 'rejected' | 'expired';

type MockAd = {
  id: string;
  title: string;
  description: string;
  advertiser_name: string;
  advertiser_type: 'pro' | 'external' | 'admin';
  ad_type: string;
  placement: string;
  status: AdStatus;
  impressions: number;
  clicks: number;
  price: number;
  starts_at: string;
  expires_at: string;
};


const FILTER_TABS = [
  { key: 'all', label: 'すべて' },
  { key: 'pending_review', label: '審査待ち' },
  { key: 'active', label: '配信中' },
  { key: 'paused', label: '停止中' },
] as const;

const STATUS_CONFIG: Record<AdStatus, { label: string; color: string; bg: string }> = {
  pending_review: { label: '審査待ち', color: '#F59E0B', bg: '#FEF3C7' },
  active: { label: '配信中', color: '#22C55E', bg: '#DCFCE7' },
  paused: { label: '停止中', color: '#94A3B8', bg: '#F1F5F9' },
  rejected: { label: '却下', color: '#EF4444', bg: '#FEE2E2' },
  expired: { label: '期限切れ', color: '#94A3B8', bg: '#F1F5F9' },
};

const TYPE_LABELS: Record<string, string> = {
  pro_promotion: 'プロ宣伝',
  banner: 'バナー',
  sponsored: 'スポンサー',
  in_feed: 'フィード内',
};

const PLACEMENT_LABELS: Record<string, string> = {
  home_top: 'ホーム上部',
  home_feed: 'ホームフィード',
  search_top: '検索上部',
  order_complete: '注文完了後',
  pro_list: 'プロ一覧',
};

export default function AdminAdsScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [ads, setAds] = useState<MockAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<MockAd | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  async function refresh() {
    const { data } = await supabase
      .from('ads')
      .select(`
        id, title, description, advertiser_type, ad_type, placement,
        status, impressions, clicks, price, starts_at, expires_at,
        advertiser:advertiser_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      setAds(
        data.map((row: any): MockAd => ({
          id: row.id,
          title: row.title,
          description: row.description ?? '',
          advertiser_name:
            row.advertiser_type === 'admin'
              ? '運営'
              : row.advertiser?.full_name ?? '不明',
          advertiser_type: row.advertiser_type,
          ad_type: row.ad_type,
          placement: row.placement,
          status: (row.status === 'approved' ? 'active' : row.status) as AdStatus,
          impressions: row.impressions ?? 0,
          clicks: row.clicks ?? 0,
          price: row.price ?? 0,
          starts_at: row.starts_at?.slice(0, 10) ?? '',
          expires_at: row.expires_at?.slice(0, 10) ?? '',
        })),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = filter === 'all' ? ads : ads.filter((a) => a.status === filter);
  const pendingCount = ads.filter((a) => a.status === 'pending_review').length;

  const totalRevenue = ads
    .filter((a) => ['active', 'expired'].includes(a.status))
    .reduce((sum, a) => sum + a.price, 0);

  async function applyStatus(adId: string, status: AdStatus, extra?: Record<string, unknown>) {
    const { error } = await supabase
      .from('ads')
      .update({
        status,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
        ...extra,
      })
      .eq('id', adId);
    if (error) {
      Alert.alert('エラー', error.message);
      return false;
    }
    setAds((prev) => prev.map((a) => a.id === adId ? { ...a, status } : a));
    await logAudit({
      action: 'profile.update',
      resourceType: 'ad',
      resourceId: adId,
      metadata: { status, ...extra },
    });
    return true;
  }

  const handleApprove = async (adId: string) => {
    if (await applyStatus(adId, 'active')) {
      setSelectedAd(null);
    }
  };

  const handleReject = async (adId: string) => {
    const reason = rejectionReason.trim();
    if (!reason) return;
    if (await applyStatus(adId, 'rejected', { rejection_reason: reason })) {
      setSelectedAd(null);
      setShowRejectInput(false);
      setRejectionReason('');
    }
  };

  const handlePause = async (adId: string) => {
    if (await applyStatus(adId, 'paused')) setSelectedAd(null);
  };

  const handleResume = async (adId: string) => {
    if (await applyStatus(adId, 'active')) setSelectedAd(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>広告管理</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount}件審査待ち</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{ads.length}</Text>
          <Text style={styles.statLabel}>総広告数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {ads.filter((a) => a.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>配信中</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ¥{totalRevenue.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>広告収入</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
              {tab.key === 'pending_review' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && (
        <View style={{ paddingVertical: Spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Ad List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filtered.map((ad) => {
          const status = STATUS_CONFIG[ad.status];
          const ctr = ad.impressions > 0
            ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
            : '0.0';

          return (
            <TouchableOpacity
              key={ad.id}
              style={styles.adCard}
              onPress={() => setSelectedAd(ad)}
            >
              <View style={styles.adHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                  <Text style={styles.adAdvertiser}>{ad.advertiser_name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              <View style={styles.adMeta}>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>{TYPE_LABELS[ad.ad_type] ?? ad.ad_type}</Text>
                </View>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>{PLACEMENT_LABELS[ad.placement] ?? ad.placement}</Text>
                </View>
                {ad.price > 0 && (
                  <Text style={styles.adPrice}>¥{ad.price.toLocaleString()}</Text>
                )}
              </View>

              {ad.status === 'active' && (
                <View style={styles.adStats}>
                  <View style={styles.adStatItem}>
                    <Ionicons name="eye-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.adStatText}>{ad.impressions.toLocaleString()}</Text>
                  </View>
                  <View style={styles.adStatItem}>
                    <Ionicons name="hand-left-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.adStatText}>{ad.clicks}</Text>
                  </View>
                  <View style={styles.adStatItem}>
                    <Text style={styles.adStatText}>CTR {ctr}%</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedAd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAd && (() => {
              const ad = selectedAd;
              const status = STATUS_CONFIG[ad.status];
              const ctr = ad.impressions > 0
                ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                : '0.0';

              return (
                <ScrollView>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>広告詳細</Text>
                    <TouchableOpacity onPress={() => { setSelectedAd(null); setShowRejectInput(false); }}>
                      <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: status.bg, alignSelf: 'flex-start', marginBottom: Spacing.md }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>

                  <Text style={styles.detailTitle}>{ad.title}</Text>
                  <Text style={styles.detailDesc}>{ad.description}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>広告主</Text>
                    <Text style={styles.detailValue}>{ad.advertiser_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>タイプ</Text>
                    <Text style={styles.detailValue}>{TYPE_LABELS[ad.ad_type]}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>配置</Text>
                    <Text style={styles.detailValue}>{PLACEMENT_LABELS[ad.placement]}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>料金</Text>
                    <Text style={styles.detailValue}>¥{ad.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>期間</Text>
                    <Text style={styles.detailValue}>{ad.starts_at} 〜 {ad.expires_at}</Text>
                  </View>

                  {(ad.status === 'active' || ad.status === 'expired') && (
                    <View style={styles.statsSection}>
                      <Text style={styles.statsSectionTitle}>パフォーマンス</Text>
                      <View style={styles.perfRow}>
                        <View style={styles.perfCard}>
                          <Text style={styles.perfValue}>{ad.impressions.toLocaleString()}</Text>
                          <Text style={styles.perfLabel}>表示回数</Text>
                        </View>
                        <View style={styles.perfCard}>
                          <Text style={styles.perfValue}>{ad.clicks}</Text>
                          <Text style={styles.perfLabel}>クリック</Text>
                        </View>
                        <View style={styles.perfCard}>
                          <Text style={styles.perfValue}>{ctr}%</Text>
                          <Text style={styles.perfLabel}>CTR</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Rejection reason input */}
                  {showRejectInput && (
                    <View style={styles.rejectSection}>
                      <Text style={styles.rejectLabel}>却下理由</Text>
                      <TextInput
                        style={styles.rejectInput}
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        placeholder="却下理由を入力..."
                        multiline
                      />
                      <View style={styles.rejectActions}>
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setShowRejectInput(false)}
                        >
                          <Text style={styles.cancelBtnText}>キャンセル</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.rejectConfirmBtn, !rejectionReason && { opacity: 0.4 }]}
                          onPress={() => handleReject(ad.id)}
                          disabled={!rejectionReason}
                        >
                          <Text style={styles.rejectConfirmText}>却下する</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  {!showRejectInput && (
                    <View style={styles.actionButtons}>
                      {ad.status === 'pending_review' && (
                        <>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => handleApprove(ad.id)}
                          >
                            <Ionicons name="checkmark" size={18} color={Colors.white} />
                            <Text style={styles.approveBtnText}>承認</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => setShowRejectInput(true)}
                          >
                            <Ionicons name="close" size={18} color={Colors.error} />
                            <Text style={styles.rejectBtnText}>却下</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {ad.status === 'active' && (
                        <TouchableOpacity
                          style={styles.pauseBtn}
                          onPress={() => handlePause(ad.id)}
                        >
                          <Ionicons name="pause" size={18} color={Colors.white} />
                          <Text style={styles.pauseBtnText}>一時停止</Text>
                        </TouchableOpacity>
                      )}
                      {ad.status === 'paused' && (
                        <TouchableOpacity
                          style={styles.resumeBtn}
                          onPress={() => handleResume(ad.id)}
                        >
                          <Ionicons name="play" size={18} color={Colors.white} />
                          <Text style={styles.resumeBtnText}>再開</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  pendingBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  pendingBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: '#F59E0B' },

  // Stats
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  // Filters
  filterScroll: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, flexGrow: 0 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full, marginRight: Spacing.sm,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.white },

  content: { padding: Spacing.lg, paddingBottom: 100 },

  // Ad Card
  adCard: {
    backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  adHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs },
  adTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  adAdvertiser: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  adMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  metaTag: {
    backgroundColor: Colors.primaryFaint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
  },
  metaTagText: { fontSize: 10, fontWeight: '600', color: Colors.primaryMedium },
  adPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, marginLeft: 'auto' },
  adStats: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  adStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  adStatText: { fontSize: FontSize.xs, color: Colors.textMuted },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },

  detailTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  detailDesc: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  detailValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Performance
  statsSection: { marginTop: Spacing.lg },
  statsSectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  perfRow: { flexDirection: 'row', gap: Spacing.sm },
  perfCard: {
    flex: 1, backgroundColor: Colors.primaryFaint, padding: Spacing.md,
    borderRadius: BorderRadius.sm, alignItems: 'center',
  },
  perfValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  perfLabel: { fontSize: FontSize.xs, color: Colors.primaryLight, marginTop: 2 },

  // Reject
  rejectSection: { marginTop: Spacing.lg },
  rejectLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  rejectInput: {
    backgroundColor: Colors.background, padding: Spacing.md,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border,
    minHeight: 80, textAlignVertical: 'top',
  },
  rejectActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  rejectConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.error, alignItems: 'center',
  },
  rejectConfirmText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },

  // Action buttons
  actionButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  approveBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.success, paddingVertical: 14, borderRadius: BorderRadius.md, gap: 6,
  },
  approveBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  rejectBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.error, paddingVertical: 14, borderRadius: BorderRadius.md, gap: 6,
  },
  rejectBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
  pauseBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.warning, paddingVertical: 14, borderRadius: BorderRadius.md, gap: 6,
  },
  pauseBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  resumeBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.success, paddingVertical: 14, borderRadius: BorderRadius.md, gap: 6,
  },
  resumeBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
