import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

const MOCK_PROS = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    earnings: 342000,
    jobs: 28,
    online: true,
    categories: ['外装洗車', '内装クリーニング'],
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
  },
  {
    id: '4',
    name: '木村 翔太',
    rating: 4.7,
    reviews: 45,
    earnings: 189000,
    jobs: 15,
    online: false,
    categories: ['外装洗車', 'エンジンルーム'],
  },
];

export default function AdminProsScreen() {
  const onlineCount = MOCK_PROS.filter((p) => p.online).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロ管理</Text>
        <Text style={styles.count}>
          {MOCK_PROS.length}名登録 / {onlineCount}名稼働中
        </Text>
      </View>

      <FlatList
        data={MOCK_PROS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: pro }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.proInfo}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color={Colors.primaryMedium} />
                  </View>
                  <View
                    style={[
                      styles.onlineIndicator,
                      { backgroundColor: pro.online ? Colors.success : Colors.textMuted },
                    ]}
                  />
                </View>
                <View>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={Colors.gold} />
                    <Text style={styles.ratingText}>
                      {pro.rating} ({pro.reviews}件)
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: pro.online
                      ? Colors.success + '20'
                      : Colors.offWhite,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: pro.online
                        ? Colors.success
                        : Colors.textMuted,
                    },
                  ]}
                >
                  {pro.online ? '稼働中' : 'オフライン'}
                </Text>
              </View>
            </View>

            <View style={styles.categories}>
              {pro.categories.map((cat, idx) => (
                <View key={idx} style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{cat}</Text>
                </View>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  ¥{(pro.earnings / 10000).toFixed(1)}万
                </Text>
                <Text style={styles.statLabel}>今月売上</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{pro.jobs}</Text>
                <Text style={styles.statLabel}>完了件数</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  ¥{Math.round(pro.earnings / pro.jobs).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>平均単価</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
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
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
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
    alignItems: 'center',
  },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
  },
  categoryTag: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
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
});
