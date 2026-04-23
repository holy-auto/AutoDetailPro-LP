import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { ORDER_STATUSES, type OrderStatus } from '@/constants/categories';
import { supabase } from '@/lib/supabase';

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  searching: { text: '検索中', color: Colors.info, bg: Colors.info + '20' },
  accepted: { text: '承認済', color: Colors.primary, bg: Colors.primaryFaint },
  arriving: { text: '移動中', color: Colors.warning, bg: Colors.warning + '20' },
  in_progress: { text: '作業中', color: Colors.gold, bg: Colors.goldLight + '40' },
  pending_confirm: { text: '確認待', color: Colors.warning, bg: Colors.warning + '20' },
  completed: { text: '完了', color: Colors.success, bg: Colors.success + '20' },
};

type OrderRow = {
  id: string;
  customer: string;
  pro: string;
  service: string;
  amount: number;
  status: OrderStatus;
  date: string;
  payment: string;
};

export default function AdminOrdersScreen() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders() {
    const query = supabase
      .from('orders')
      .select(`
        id, status, created_at, total_amount, customer_total, payment_method,
        customer:customer_id(full_name),
        pro:pro_id(full_name),
        menus:order_menus(menu:menu_id(name))
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (error || !data) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const rows: OrderRow[] = data.map((row: any) => ({
      id: row.id,
      customer: row.customer?.full_name ?? 'お客さま',
      pro: row.pro?.full_name ?? '未アサイン',
      service: row.menus?.[0]?.menu?.name ?? 'サービス',
      amount: row.customer_total ?? row.total_amount ?? 0,
      status: row.status as OrderStatus,
      date: new Date(row.created_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
      payment: row.payment_method ?? 'online',
    }));

    setOrders(rows);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>全注文管理</Text>
      <Text style={styles.count}>{filtered.length}件</Text>

      {/* Filters */}
      <FlatList
        horizontal
        data={[{ id: 'all', label: 'すべて' }, ...ORDER_STATUSES]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === item.id && styles.filterChipActive,
            ]}
            onPress={() => setFilter(item.id as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.id && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>該当する注文はありません</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.completed;
          return (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardService}>{item.service}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.text}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.cardDetail}>{item.customer}</Text>
                  <Ionicons name="arrow-forward" size={12} color={Colors.textMuted} />
                  <Ionicons name="construct-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.cardDetail}>{item.pro}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.cardDetail}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAmount}>¥{item.amount.toLocaleString()}</Text>
                <Text style={styles.cardPayment}>
                  {item.payment === 'online' ? 'オンライン' : '現金'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 2,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardService: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cardAmount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardPayment: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
