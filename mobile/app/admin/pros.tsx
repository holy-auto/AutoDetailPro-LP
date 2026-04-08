import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { PRO_RANKING, PRO_BOOST, IMPROVEMENT_STATUS } from '@/constants/business-rules';

type ProData = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  earnings: number;
  jobs: number;
  online: boolean;
  categories: string[];
  createdAt: string;
  isNewcomer: boolean;
  boostActive: boolean;
  boostExpiresAt?: string;
  improvementStatus?: string | null;
  improvementStartedAt?: string | null;
  responseRate: number;
  completionRate: number;
};

const MOCK_PROS: ProData[] = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    earnings: 342000,
    jobs: 28,
    online: true,
    categories: ['外装洗車', '内装クリーニング'],
    createdAt: '2025-01-15',
    isNewcomer: false,
    boostActive: true,
    boostExpiresAt: '2026-04-15T00:00:00Z',
    improvementStatus: null,
    responseRate: 0.98,
    completionRate: 0.99,
  },
  {
    id: '2',
    name: '佐藤 健一',
    rating: 4.8,
    reviews: 89,
    earnings: 258000,
    jobs: 19,
    online: true,
    categories: ['コーティング', '磨き・研磨'],
    createdAt: '2025-06-10',
    isNewcomer: false,
    boostActive: false,
    improvementStatus: null,
    responseRate: 0.95,
    completionRate: 0.97,
  },
  {
    id: '3',
    name: '鈴木 美咲',
    rating: 5.0,
    reviews: 64,
    earnings: 412000,
    jobs: 22,
    online: false,
    categories: ['フルディテイル', 'コーティング'],
    createdAt: '2026-03-20',
    isNewcomer: true,
    boostActive: false,
    improvementStatus: null,
    responseRate: 1.0,
    completionRate: 1.0,
  },
  {
    id: '4',
    name: '木村 翔太',
    rating: 3.2,
    reviews: 45,
    earnings: 89000,
    jobs: 8,
    online: false,
    categories: ['外装洗車'],
    createdAt: '2025-04-01',
    isNewcomer: false,
    boostActive: false,
    improvementStatus: IMPROVEMENT_STATUS.ACTIVE,
    improvementStartedAt: '2026-03-25',
    responseRate: 0.72,
    completionRate: 0.80,
  },
  {
    id: '5',
    name: '渡辺 大輔',
    rating: 2.8,
    reviews: 30,
    earnings: 42000,
    jobs: 5,
    online: false,
    categories: ['外装洗車', 'エンジンルーム'],
    createdAt: '2025-02-10',
    isNewcomer: false,
    boostActive: false,
    improvementStatus: IMPROVEMENT_STATUS.FAILED,
    improvementStartedAt: '2026-01-10',
    responseRate: 0.55,
    completionRate: 0.60,
  },
];

type FilterTab = 'all' | 'good' | 'warning' | 'improvement' | 'removed';

export default function AdminProsScreen() {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [detailPro, setDetailPro] = useState<ProData | null>(null);

  const filteredPros = MOCK_PROS.filter((pro) => {
    switch (filterTab) {
      case 'good':
        return pro.rating >= PRO_RANKING.RATING_GOOD_THRESHOLD && !pro.improvementStatus;
      case 'warning':
        return (
          pro.rating < PRO_RANKING.RATING_GOOD_THRESHOLD &&
          pro.rating >= PRO_RANKING.RATING_WARNING_THRESHOLD &&
          !pro.improvementStatus
        );
      case 'improvement':
        return pro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE ||
               pro.improvementStatus === IMPROVEMENT_STATUS.EXTENDED;
      case 'removed':
        return pro.improvementStatus === IMPROVEMENT_STATUS.FAILED;
      default:
        return true;
    }
  });

  const onlineCount = MOCK_PROS.filter((p) => p.online).length;
  const improvementCount = MOCK_PROS.filter(
    (p) =>
      p.improvementStatus === IMPROVEMENT_STATUS.ACTIVE ||
      p.improvementStatus === IMPROVEMENT_STATUS.EXTENDED,
  ).length;

  const handleStartImprovement = (pro: ProData) => {
    Alert.alert(
      '改善プラン開始',
      `${pro.name}（評価 ${pro.rating}）に改善プランを適用しますか？\n\n` +
        `・期間: ${PRO_RANKING.IMPROVEMENT_PLAN.EVALUATION_PERIOD_DAYS}日間\n` +
        `・目標: 評価 ${PRO_RANKING.IMPROVEMENT_PLAN.TARGET_RATING} 以上\n` +
        `・最低受注: ${PRO_RANKING.IMPROVEMENT_PLAN.MIN_ORDERS_DURING_PLAN}件\n` +
        `・優先表示から除外されます`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '適用する',
          onPress: () => {
            Alert.alert('完了', '改善プランを適用しました');
          },
        },
      ],
    );
  };

  const handleForceRemoval = (pro: ProData) => {
    Alert.alert(
      '強制退会',
      `${pro.name}を強制退会させますか？\n\n` +
        `・理由: ${pro.improvementStatus === IMPROVEMENT_STATUS.FAILED ? '改善プラン未達成' : `評価 ${pro.rating} が最低基準を下回っています`}\n` +
        `・${PRO_RANKING.FORCED_REMOVAL.COOLDOWN_DAYS}日間の再登録禁止\n` +
        `・この操作は取り消せません`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '退会させる',
          style: 'destructive',
          onPress: () => {
            Alert.alert('完了', '強制退会処理が完了しました');
          },
        },
      ],
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= PRO_RANKING.RATING_GOOD_THRESHOLD) return Colors.success;
    if (rating >= PRO_RANKING.RATING_WARNING_THRESHOLD) return Colors.gold;
    return Colors.error;
  };

  const getStatusInfo = (pro: ProData) => {
    if (pro.improvementStatus === IMPROVEMENT_STATUS.FAILED) {
      return { label: '退会対象', color: Colors.error, bg: Colors.error + '15' };
    }
    if (
      pro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE ||
      pro.improvementStatus === IMPROVEMENT_STATUS.EXTENDED
    ) {
      return { label: '改善中', color: '#F59E0B', bg: '#FEF3C7' };
    }
    if (pro.isNewcomer) {
      return { label: '新人', color: '#3B82F6', bg: '#EFF6FF' };
    }
    if (pro.boostActive) {
      return { label: 'ブースト中', color: PRO_BOOST.BADGE_COLOR, bg: PRO_BOOST.BADGE_COLOR + '15' };
    }
    if (pro.online) {
      return { label: '稼働中', color: Colors.success, bg: Colors.success + '15' };
    }
    return { label: 'オフライン', color: Colors.textMuted, bg: Colors.offWhite };
  };

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'すべて', count: MOCK_PROS.length },
    { key: 'good', label: '良好' },
    { key: 'warning', label: '注意' },
    { key: 'improvement', label: '改善中', count: improvementCount },
    { key: 'removed', label: '退会対象' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロ管理</Text>
        <Text style={styles.count}>
          {MOCK_PROS.length}名登録 / {onlineCount}名稼働中
        </Text>
      </View>

      {/* Rating policy summary */}
      <View style={styles.policyCard}>
        <View style={styles.policyRow}>
          <View style={[styles.policyDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.policyText}>
            {PRO_RANKING.RATING_GOOD_THRESHOLD}以上 — 通常表示
          </Text>
        </View>
        <View style={styles.policyRow}>
          <View style={[styles.policyDot, { backgroundColor: Colors.gold }]} />
          <Text style={styles.policyText}>
            {PRO_RANKING.RATING_WARNING_THRESHOLD}〜{PRO_RANKING.RATING_GOOD_THRESHOLD} — 注意
          </Text>
        </View>
        <View style={styles.policyRow}>
          <View style={[styles.policyDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.policyText}>
            {PRO_RANKING.RATING_WARNING_THRESHOLD}未満 — 改善プラン → 退会
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(t) => t.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        renderItem={({ item: tab }) => (
          <TouchableOpacity
            style={[styles.tab, filterTab === tab.key && styles.tabActive]}
            onPress={() => setFilterTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                filterTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
              {tab.count !== undefined ? ` (${tab.count})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Pro List */}
      <FlatList
        data={filteredPros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: pro }) => {
          const statusInfo = getStatusInfo(pro);
          const ratingColor = getRatingColor(pro.rating);
          const needsAction =
            pro.rating < PRO_RANKING.RATING_WARNING_THRESHOLD &&
            !pro.improvementStatus;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setDetailPro(pro)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.proInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={24}
                        color={Colors.primaryMedium}
                      />
                    </View>
                    <View
                      style={[
                        styles.onlineIndicator,
                        {
                          backgroundColor: pro.online
                            ? Colors.success
                            : Colors.textMuted,
                        },
                      ]}
                    />
                  </View>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.proName}>{pro.name}</Text>
                      {pro.isNewcomer && (
                        <View style={styles.newcomerTag}>
                          <Text style={styles.newcomerTagText}>新人</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={ratingColor} />
                      <Text style={[styles.ratingText, { color: ratingColor }]}>
                        {pro.rating} ({pro.reviews}件)
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusInfo.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusInfo.color }]}
                  >
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              {/* Categories */}
              <View style={styles.categories}>
                {pro.categories.map((cat, idx) => (
                  <View key={idx} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    ¥{(pro.earnings / 10000).toFixed(1)}万
                  </Text>
                  <Text style={styles.statLabel}>今月売上</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {Math.round(pro.responseRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>応答率</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {Math.round(pro.completionRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>完了率</Text>
                </View>
              </View>

              {/* Action buttons */}
              {needsAction && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleStartImprovement(pro)}
                >
                  <Ionicons name="warning" size={16} color="#F59E0B" />
                  <Text style={styles.actionBtnText}>
                    改善プランを適用
                  </Text>
                </TouchableOpacity>
              )}

              {pro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE && (
                <View style={styles.improvementInfo}>
                  <Ionicons name="time" size={16} color="#F59E0B" />
                  <Text style={styles.improvementInfoText}>
                    改善プラン実施中 — 目標: {PRO_RANKING.IMPROVEMENT_PLAN.TARGET_RATING}以上
                  </Text>
                </View>
              )}

              {pro.improvementStatus === IMPROVEMENT_STATUS.FAILED && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleForceRemoval(pro)}
                >
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.removeBtnText}>強制退会を実行</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!detailPro}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailPro(null)}
      >
        {detailPro && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{detailPro.name}</Text>
                <TouchableOpacity onPress={() => setDetailPro(null)}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>評価状況</Text>
                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>現在の評価</Text>
                  <Text
                    style={[
                      styles.modalStatValue,
                      { color: getRatingColor(detailPro.rating) },
                    ]}
                  >
                    {detailPro.rating} / 5.0
                  </Text>
                </View>
                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>レビュー数</Text>
                  <Text style={styles.modalStatValue}>{detailPro.reviews}件</Text>
                </View>
                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>応答率</Text>
                  <Text style={styles.modalStatValue}>
                    {Math.round(detailPro.responseRate * 100)}%
                  </Text>
                </View>
                <View style={styles.modalStatRow}>
                  <Text style={styles.modalStatLabel}>完了率</Text>
                  <Text style={styles.modalStatValue}>
                    {Math.round(detailPro.completionRate * 100)}%
                  </Text>
                </View>
              </View>

              {detailPro.boostActive && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>ブースト</Text>
                  <Text style={styles.modalDetailText}>
                    有効期限: {detailPro.boostExpiresAt
                      ? new Date(detailPro.boostExpiresAt).toLocaleDateString('ja-JP')
                      : '—'}
                  </Text>
                </View>
              )}

              {detailPro.improvementStatus && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>改善プラン</Text>
                  <Text style={styles.modalDetailText}>
                    ステータス: {
                      detailPro.improvementStatus === IMPROVEMENT_STATUS.ACTIVE ? '実施中' :
                      detailPro.improvementStatus === IMPROVEMENT_STATUS.EXTENDED ? '延長中' :
                      detailPro.improvementStatus === IMPROVEMENT_STATUS.PASSED ? '達成' :
                      '未達成'
                    }
                  </Text>
                  {detailPro.improvementStartedAt && (
                    <Text style={styles.modalDetailText}>
                      開始日: {new Date(detailPro.improvementStartedAt).toLocaleDateString('ja-JP')}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.modalActions}>
                {detailPro.rating < PRO_RANKING.RATING_WARNING_THRESHOLD &&
                  !detailPro.improvementStatus && (
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => {
                        setDetailPro(null);
                        handleStartImprovement(detailPro);
                      }}
                    >
                      <Text style={styles.modalActionBtnText}>
                        改善プランを適用
                      </Text>
                    </TouchableOpacity>
                  )}
                {detailPro.improvementStatus === IMPROVEMENT_STATUS.FAILED && (
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalActionBtnDanger]}
                    onPress={() => {
                      setDetailPro(null);
                      handleForceRemoval(detailPro);
                    }}
                  >
                    <Text style={styles.modalActionBtnDangerText}>
                      強制退会
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  count: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },

  // Policy
  policyCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  policyDot: { width: 10, height: 10, borderRadius: 5 },
  policyText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Tabs
  tabRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.sm },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },

  // List
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newcomerTag: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  newcomerTagText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  proName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: FontSize.xs, fontWeight: '600' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },

  // Categories
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.md },
  categoryTag: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.borderLight },

  // Actions
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: '#92400E' },
  improvementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
  },
  improvementInfoText: { fontSize: FontSize.xs, color: '#92400E', fontWeight: '500' },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  removeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.error },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  modalSection: { marginBottom: Spacing.lg },
  modalSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  modalStatLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalStatValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  modalDetailText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  modalActions: { gap: Spacing.sm },
  modalActionBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  modalActionBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  modalActionBtnDanger: { backgroundColor: Colors.error },
  modalActionBtnDangerText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
