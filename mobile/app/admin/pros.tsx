import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

type ProStatus = 'online' | 'offline' | 'improvement' | 'suspended';

type ProData = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  status: ProStatus;
  orderCount: number;
  completionRate: number;
  joinDate: string;
  categories: string[];
  mysteryShopScore: number | null;
  improvementPlan: {
    active: boolean;
    startDate?: string;
    targetRating?: number;
    progress?: string;
  } | null;
  boostActive: boolean;
  earnings: number;
  phone: string;
  email: string;
};

const MOCK_PROS: ProData[] = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    status: 'online',
    orderCount: 342,
    completionRate: 0.99,
    joinDate: '2025-01-15',
    categories: ['外装洗車', '内装クリーニング', 'コーティング'],
    mysteryShopScore: 95,
    improvementPlan: null,
    boostActive: true,
    earnings: 1240000,
    phone: '090-1234-5678',
    email: 'tanaka@example.com',
  },
  {
    id: '2',
    name: '佐藤 健一',
    rating: 4.8,
    reviews: 89,
    status: 'online',
    orderCount: 198,
    completionRate: 0.97,
    joinDate: '2025-06-10',
    categories: ['コーティング', '磨き・研磨'],
    mysteryShopScore: 88,
    improvementPlan: null,
    boostActive: false,
    earnings: 890000,
    phone: '090-2345-6789',
    email: 'sato@example.com',
  },
  {
    id: '3',
    name: '鈴木 美咲',
    rating: 5.0,
    reviews: 64,
    status: 'offline',
    orderCount: 87,
    completionRate: 1.0,
    joinDate: '2025-09-20',
    categories: ['フルディテイル', 'コーティング'],
    mysteryShopScore: 92,
    improvementPlan: null,
    boostActive: false,
    earnings: 620000,
    phone: '090-3456-7890',
    email: 'suzuki@example.com',
  },
  {
    id: '4',
    name: '木村 翔太',
    rating: 3.2,
    reviews: 45,
    status: 'improvement',
    orderCount: 56,
    completionRate: 0.8,
    joinDate: '2025-04-01',
    categories: ['外装洗車'],
    mysteryShopScore: 52,
    improvementPlan: {
      active: true,
      startDate: '2026-03-25',
      targetRating: 4.0,
      progress: '評価改善中 - 残り18日',
    },
    boostActive: false,
    earnings: 180000,
    phone: '090-4567-8901',
    email: 'kimura@example.com',
  },
  {
    id: '5',
    name: '渡辺 大輔',
    rating: 2.8,
    reviews: 30,
    status: 'suspended',
    orderCount: 23,
    completionRate: 0.6,
    joinDate: '2025-02-10',
    categories: ['外装洗車', 'エンジンルーム'],
    mysteryShopScore: 38,
    improvementPlan: {
      active: false,
      startDate: '2026-01-10',
      targetRating: 4.0,
      progress: '未達成 - プラン終了',
    },
    boostActive: false,
    earnings: 42000,
    phone: '090-5678-9012',
    email: 'watanabe@example.com',
  },
  {
    id: '6',
    name: '山本 由美',
    rating: 4.6,
    reviews: 52,
    status: 'online',
    orderCount: 145,
    completionRate: 0.95,
    joinDate: '2025-07-05',
    categories: ['内装クリーニング', 'フルディテイル'],
    mysteryShopScore: 82,
    improvementPlan: null,
    boostActive: false,
    earnings: 540000,
    phone: '090-6789-0123',
    email: 'yamamoto@example.com',
  },
];

const STATUS_CONFIG: Record<ProStatus, { label: string; color: string; bg: string }> = {
  online: { label: 'オンライン', color: Colors.success, bg: Colors.success + '15' },
  offline: { label: 'オフライン', color: Colors.textMuted, bg: Colors.offWhite },
  improvement: { label: '改善プラン中', color: '#F59E0B', bg: '#FEF3C7' },
  suspended: { label: '停止中', color: Colors.error, bg: Colors.error + '15' },
};

export default function AdminProsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPro, setSelectedPro] = useState<ProData | null>(null);

  const filteredPros = MOCK_PROS.filter((pro) =>
    pro.name.includes(searchQuery) ||
    pro.categories.some((cat) => cat.includes(searchQuery)),
  );

  const onlineCount = MOCK_PROS.filter((p) => p.status === 'online').length;

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return Colors.success;
    if (rating >= 3.5) return Colors.warning;
    return Colors.error;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={14}
          color={getRatingColor(rating)}
        />,
      );
    }
    return stars;
  };

  const handleStartImprovement = (pro: ProData) => {
    Alert.alert(
      '改善プラン開始',
      `${pro.name}に改善プランを開始しますか？\n\n・期間: 30日間\n・目標: 評価 4.0 以上\n・優先表示から除外されます`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '開始する', onPress: () => Alert.alert('完了', '改善プランを開始しました') },
      ],
    );
  };

  const handleSuspend = (pro: ProData) => {
    Alert.alert(
      'アカウント停止',
      `${pro.name}のアカウントを停止しますか？\n\n・新規受注が停止されます\n・この操作は後から解除できます`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '停止する', style: 'destructive', onPress: () => Alert.alert('完了', 'アカウントを停止しました') },
      ],
    );
  };

  const handleBoost = (pro: ProData) => {
    Alert.alert(
      'ブースト付与',
      `${pro.name}にブーストを付与しますか？\n\n・検索結果で優先表示されます\n・期間: 7日間`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '付与する', onPress: () => Alert.alert('完了', 'ブーストを付与しました') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>プロ管理</Text>
        <Text style={styles.subtitle}>
          {MOCK_PROS.length}名登録 / {onlineCount}名オンライン
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="名前やカテゴリで検索..."
            placeholderTextColor={Colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pro List */}
      <FlatList
        data={filteredPros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: pro }) => {
          const statusConfig = STATUS_CONFIG[pro.status];
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedPro(pro)}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.proInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={24} color={Colors.primaryMedium} />
                    </View>
                    <View
                      style={[
                        styles.onlineIndicator,
                        {
                          backgroundColor:
                            pro.status === 'online' ? Colors.success : Colors.textMuted,
                        },
                      ]}
                    />
                  </View>
                  <View>
                    <Text style={styles.proName}>{pro.name}</Text>
                    <View style={styles.ratingRow}>
                      {renderStars(pro.rating)}
                      <Text style={[styles.ratingText, { color: getRatingColor(pro.rating) }]}>
                        {pro.rating}
                      </Text>
                      <Text style={styles.reviewCount}>({pro.reviews}件)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statusBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                  {pro.improvementPlan?.active && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="alert-circle" size={10} color="#F59E0B" />
                      <Text style={[styles.statusText, { color: '#F59E0B' }]}>改善中</Text>
                    </View>
                  )}
                  {pro.boostActive && (
                    <View style={[styles.statusBadge, { backgroundColor: Colors.primaryFaint }]}>
                      <Ionicons name="rocket" size={10} color={Colors.primaryMedium} />
                      <Text style={[styles.statusText, { color: Colors.primaryMedium }]}>ブースト</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{pro.orderCount}</Text>
                  <Text style={styles.statLabel}>注文数</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: getRatingColor(pro.rating) }]}>
                    {pro.rating}
                  </Text>
                  <Text style={styles.statLabel}>評価</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {Math.round(pro.completionRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>完了率</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedPro}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPro(null)}
      >
        {selectedPro && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPro.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedPro(null)}>
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>プロフィール</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>登録日</Text>
                    <Text style={styles.modalInfoValue}>{selectedPro.joinDate}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>電話番号</Text>
                    <Text style={styles.modalInfoValue}>{selectedPro.phone}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>メール</Text>
                    <Text style={styles.modalInfoValue}>{selectedPro.email}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>カテゴリ</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedPro.categories.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>累計売上</Text>
                    <Text style={styles.modalInfoValue}>
                      ¥{selectedPro.earnings.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Mystery Shop Score */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>覆面調査スコア</Text>
                  {selectedPro.mysteryShopScore !== null ? (
                    <View style={styles.scoreWrap}>
                      <View style={styles.scoreCircle}>
                        <Text
                          style={[
                            styles.scoreValue,
                            {
                              color:
                                selectedPro.mysteryShopScore >= 80
                                  ? Colors.success
                                  : selectedPro.mysteryShopScore >= 60
                                  ? Colors.warning
                                  : Colors.error,
                            },
                          ]}
                        >
                          {selectedPro.mysteryShopScore}
                        </Text>
                        <Text style={styles.scoreMax}>/ 100</Text>
                      </View>
                      <View style={styles.scoreBarContainer}>
                        <View style={styles.scoreBarBg}>
                          <View
                            style={[
                              styles.scoreBarFill,
                              {
                                width: `${selectedPro.mysteryShopScore}%`,
                                backgroundColor:
                                  selectedPro.mysteryShopScore >= 80
                                    ? Colors.success
                                    : selectedPro.mysteryShopScore >= 60
                                    ? Colors.warning
                                    : Colors.error,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>未実施</Text>
                  )}
                </View>

                {/* Improvement Plan Status */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>改善プラン</Text>
                  {selectedPro.improvementPlan ? (
                    <View style={styles.improvementCard}>
                      <View style={styles.improvementHeader}>
                        <Ionicons
                          name={selectedPro.improvementPlan.active ? 'time' : 'close-circle'}
                          size={18}
                          color={selectedPro.improvementPlan.active ? '#F59E0B' : Colors.error}
                        />
                        <Text
                          style={[
                            styles.improvementStatus,
                            {
                              color: selectedPro.improvementPlan.active
                                ? '#F59E0B'
                                : Colors.error,
                            },
                          ]}
                        >
                          {selectedPro.improvementPlan.active ? '実施中' : '未達成'}
                        </Text>
                      </View>
                      {selectedPro.improvementPlan.startDate && (
                        <Text style={styles.improvementDetail}>
                          開始日: {selectedPro.improvementPlan.startDate}
                        </Text>
                      )}
                      {selectedPro.improvementPlan.targetRating && (
                        <Text style={styles.improvementDetail}>
                          目標評価: {selectedPro.improvementPlan.targetRating} 以上
                        </Text>
                      )}
                      {selectedPro.improvementPlan.progress && (
                        <Text style={styles.improvementDetail}>
                          {selectedPro.improvementPlan.progress}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>該当なし</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => {
                      setSelectedPro(null);
                      handleStartImprovement(selectedPro);
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color={Colors.white} />
                    <Text style={styles.actionBtnPrimaryText}>改善プラン開始</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDanger}
                    onPress={() => {
                      setSelectedPro(null);
                      handleSuspend(selectedPro);
                    }}
                  >
                    <Ionicons name="ban" size={18} color={Colors.error} />
                    <Text style={styles.actionBtnDangerText}>アカウント停止</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnBoost}
                    onPress={() => {
                      setSelectedPro(null);
                      handleBoost(selectedPro);
                    }}
                  >
                    <Ionicons name="rocket" size={18} color={Colors.primaryMedium} />
                    <Text style={styles.actionBtnBoostText}>ブースト付与</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Search
  searchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  // List
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
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
    alignItems: 'flex-start',
  },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
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
  proName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statusBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },

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
    maxHeight: '85%',
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  modalSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalInfoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  modalInfoValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '60%',
  },

  // Mystery Shop Score
  scoreWrap: {
    gap: Spacing.md,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  scoreBarContainer: {
    marginTop: Spacing.xs,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  noDataText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Improvement Plan
  improvementCard: {
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  improvementStatus: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  improvementDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 26,
  },

  // Actions
  modalActions: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.md,
  },
  actionBtnPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  actionBtnDangerText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.error,
  },
  actionBtnBoost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryMedium + '30',
  },
  actionBtnBoostText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryMedium,
  },
});
