import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SERVICE_CATEGORIES } from '@/constants/categories';

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

const INITIAL_MENUS: MenuItem[] = [
  {
    id: '1',
    categoryId: 'exterior',
    name: '手洗い洗車',
    price: 3000,
    duration: '30分',
    description: '手洗い洗車＋拭き上げ',
  },
  {
    id: '2',
    categoryId: 'exterior',
    name: 'プレミアム洗車',
    price: 5000,
    duration: '45分',
    description: '手洗い＋ワックス＋ホイール洗浄',
  },
  {
    id: '3',
    categoryId: 'coating',
    name: 'ガラスコーティング',
    price: 15000,
    duration: '120分',
    description: '高耐久ガラスコーティング',
  },
];

export default function MenuScreen() {
  const [menus, setMenus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    price: '',
    duration: '',
    description: '',
  });

  const openNewMenu = () => {
    setEditingMenu(null);
    setForm({ categoryId: '', name: '', price: '', duration: '', description: '' });
    setShowModal(true);
  };

  const openEditMenu = (menu: MenuItem) => {
    setEditingMenu(menu);
    setForm({
      categoryId: menu.categoryId,
      name: menu.name,
      price: menu.price.toString(),
      duration: menu.duration,
      description: menu.description,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.categoryId || !form.name || !form.price) {
      Alert.alert('エラー', 'カテゴリ・メニュー名・価格は必須です');
      return;
    }

    if (editingMenu) {
      setMenus((prev) =>
        prev.map((m) =>
          m.id === editingMenu.id
            ? {
                ...m,
                ...form,
                price: parseInt(form.price, 10),
              }
            : m
        )
      );
    } else {
      setMenus((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...form,
          price: parseInt(form.price, 10),
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('削除確認', 'このメニューを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => setMenus((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const groupedMenus = SERVICE_CATEGORIES.map((cat) => ({
    ...cat,
    items: menus.filter((m) => m.categoryId === cat.id),
  })).filter((group) => group.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>メニュー管理</Text>
          <TouchableOpacity style={styles.addButton} onPress={openNewMenu}>
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>追加</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          運営が定義したカテゴリに沿ってメニューを登録してください
        </Text>

        {groupedMenus.map((group) => (
          <View key={group.id} style={styles.categoryGroup}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons
                name={CATEGORY_ICONS[group.id] as any}
                size={20}
                color={group.color}
              />
              <Text style={styles.categoryTitle}>{group.name}</Text>
              <Text style={styles.categoryCount}>{group.items.length}件</Text>
            </View>

            {group.items.map((menu) => (
              <View key={menu.id} style={styles.menuCard}>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{menu.name}</Text>
                  <Text style={styles.menuDescription}>{menu.description}</Text>
                  <Text style={styles.menuDuration}>{menu.duration}</Text>
                </View>
                <View style={styles.menuRight}>
                  <Text style={styles.menuPrice}>
                    ¥{menu.price.toLocaleString()}
                  </Text>
                  <View style={styles.menuActions}>
                    <TouchableOpacity
                      onPress={() => openEditMenu(menu)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(menu.id)}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        {groupedMenus.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>メニューがまだありません</Text>
            <Text style={styles.emptySubtext}>
              「追加」からメニューを登録しましょう
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMenu ? 'メニュー編集' : '新規メニュー'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>カテゴリ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categorySelector}
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categorySelectorItem,
                    form.categoryId === cat.id &&
                      styles.categorySelectorItemActive,
                  ]}
                  onPress={() => setForm({ ...form, categoryId: cat.id })}
                >
                  <Text
                    style={[
                      styles.categorySelectorText,
                      form.categoryId === cat.id &&
                        styles.categorySelectorTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>メニュー名</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="例: 手洗い洗車"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>価格 (¥)</Text>
                <TextInput
                  style={styles.input}
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: v })}
                  placeholder="3000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>所要時間</Text>
                <TextInput
                  style={styles.input}
                  value={form.duration}
                  onChangeText={(v) => setForm({ ...form, duration: v })}
                  placeholder="30分"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>説明</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="メニューの詳細説明"
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingMenu ? '更新する' : '登録する'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryGroup: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuDuration: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  menuRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  menuPrice: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  menuActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  iconButton: {
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  categorySelector: {
    flexDirection: 'row',
    maxHeight: 40,
  },
  categorySelectorItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
    marginRight: Spacing.sm,
  },
  categorySelectorItemActive: {
    backgroundColor: Colors.primary,
  },
  categorySelectorText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categorySelectorTextActive: {
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
