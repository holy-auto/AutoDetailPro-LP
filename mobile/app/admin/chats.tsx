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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

type Message = {
  id: string;
  sender: 'customer' | 'pro' | 'admin';
  text: string;
  time: string;
  hasNgWord?: boolean;
};

type ChatRoom = {
  id: string;
  customerName: string;
  proName: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  flagged: boolean;
  active: boolean;
  messages: Message[];
};

const NG_WORDS = ['バカ', '死ね', 'ふざけるな'];

const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: '1',
    customerName: '山田 太郎',
    proName: '田中 太郎',
    lastMessage: '到着予定は15時頃になります',
    lastMessageTime: '5分前',
    messageCount: 12,
    flagged: false,
    active: true,
    messages: [
      { id: 'm1', sender: 'customer', text: '本日の予約について確認です', time: '14:00' },
      { id: 'm2', sender: 'pro', text: 'はい、承知しました。何でしょうか？', time: '14:02' },
      { id: 'm3', sender: 'customer', text: '到着時間を教えてください', time: '14:05' },
      { id: 'm4', sender: 'pro', text: '到着予定は15時頃になります', time: '14:07' },
    ],
  },
  {
    id: '2',
    customerName: '高橋 花子',
    proName: '佐藤 健一',
    lastMessage: 'ふざけるな！全然綺麗になってない',
    lastMessageTime: '15分前',
    messageCount: 28,
    flagged: true,
    active: true,
    messages: [
      { id: 'm1', sender: 'pro', text: '作業完了しました。ご確認お願いします。', time: '13:00' },
      { id: 'm2', sender: 'customer', text: '確認しましたが、右側面に汚れが残っています', time: '13:15' },
      { id: 'm3', sender: 'pro', text: '申し訳ございません。再度確認します。', time: '13:18' },
      { id: 'm4', sender: 'customer', text: 'ふざけるな！全然綺麗になってない', time: '13:30', hasNgWord: true },
      { id: 'm5', sender: 'admin', text: '【管理者】お客様、プロの方、冷静にお話しください。問題解決に向けてサポートいたします。', time: '13:35' },
    ],
  },
  {
    id: '3',
    customerName: '田中 一郎',
    proName: '鈴木 美咲',
    lastMessage: 'ありがとうございました！大満足です',
    lastMessageTime: '1時間前',
    messageCount: 8,
    flagged: false,
    active: false,
    messages: [
      { id: 'm1', sender: 'customer', text: '本日はよろしくお願いします', time: '10:00' },
      { id: 'm2', sender: 'pro', text: 'よろしくお願いします！', time: '10:01' },
      { id: 'm3', sender: 'pro', text: '作業完了しました', time: '11:30' },
      { id: 'm4', sender: 'customer', text: 'ありがとうございました！大満足です', time: '11:45' },
    ],
  },
  {
    id: '4',
    customerName: '佐々木 健',
    proName: '木村 翔太',
    lastMessage: 'バカにしてるのか？時間通りに来い',
    lastMessageTime: '30分前',
    messageCount: 15,
    flagged: true,
    active: true,
    messages: [
      { id: 'm1', sender: 'customer', text: '予約時間を過ぎていますが...', time: '12:00' },
      { id: 'm2', sender: 'pro', text: '申し訳ありません、渋滞で遅れています', time: '12:05' },
      { id: 'm3', sender: 'customer', text: 'もう30分も待ってます', time: '12:30' },
      { id: 'm4', sender: 'customer', text: 'バカにしてるのか？時間通りに来い', time: '12:35', hasNgWord: true },
    ],
  },
  {
    id: '5',
    customerName: '中村 美咲',
    proName: '渡辺 大輔',
    lastMessage: '次回もお願いしたいです',
    lastMessageTime: '2時間前',
    messageCount: 6,
    flagged: false,
    active: false,
    messages: [
      { id: 'm1', sender: 'customer', text: 'コーティングもお願いできますか？', time: '09:00' },
      { id: 'm2', sender: 'pro', text: 'もちろんです！追加料金は5000円になります', time: '09:02' },
      { id: 'm3', sender: 'customer', text: 'お願いします', time: '09:03' },
      { id: 'm4', sender: 'customer', text: '次回もお願いしたいです', time: '10:30' },
    ],
  },
];

type FilterTab = 'all' | 'flagged' | 'active';

export default function AdminChatsScreen() {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [rooms, setRooms] = useState<ChatRoom[]>(MOCK_CHAT_ROOMS);

  const filteredRooms = rooms.filter((room) => {
    switch (filterTab) {
      case 'flagged':
        return room.flagged;
      case 'active':
        return room.active;
      default:
        return true;
    }
  });

  const flaggedCount = rooms.filter((r) => r.flagged).length;
  const activeCount = rooms.filter((r) => r.active).length;

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'すべて', count: rooms.length },
    { key: 'flagged', label: 'フラグ付き', count: flaggedCount },
    { key: 'active', label: 'アクティブ', count: activeCount },
  ];

  const handleSendAdminMessage = () => {
    if (!adminMessage.trim() || !selectedRoom) return;

    const newMessage: Message = {
      id: `admin_${Date.now()}`,
      sender: 'admin',
      text: `【管理者】${adminMessage}`,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    };

    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoom.id
          ? {
              ...room,
              messages: [...room.messages, newMessage],
              lastMessage: newMessage.text,
              lastMessageTime: 'たった今',
              messageCount: room.messageCount + 1,
            }
          : room,
      ),
    );

    setSelectedRoom((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage: newMessage.text,
            messageCount: prev.messageCount + 1,
          }
        : null,
    );

    setAdminMessage('');
  };

  const handleToggleFlag = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, flagged: !room.flagged } : room,
      ),
    );

    setSelectedRoom((prev) =>
      prev && prev.id === roomId ? { ...prev, flagged: !prev.flagged } : prev,
    );
  };

  const getSenderStyle = (sender: Message['sender']) => {
    switch (sender) {
      case 'customer':
        return { bg: Colors.primaryFaint, align: 'flex-start' as const, label: '客' };
      case 'pro':
        return { bg: Colors.offWhite, align: 'flex-end' as const, label: 'プロ' };
      case 'admin':
        return { bg: '#FEF3C7', align: 'center' as const, label: '管理者' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>チャット監視</Text>
        <Text style={styles.subtitle}>
          {flaggedCount}件のフラグ付きチャット
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
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
        ))}
      </View>

      {/* Chat Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: room }) => (
          <TouchableOpacity
            style={[styles.roomCard, room.flagged && styles.roomCardFlagged]}
            onPress={() => setSelectedRoom(room)}
          >
            <View style={styles.roomHeader}>
              <View style={styles.roomNames}>
                <View style={styles.nameWithFlag}>
                  {room.flagged && (
                    <View style={styles.flagDot} />
                  )}
                  <Text style={styles.roomCustomer}>{room.customerName}</Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={Colors.textMuted}
                />
                <Text style={styles.roomPro}>{room.proName}</Text>
              </View>
              <View style={styles.roomMeta}>
                <Text style={styles.roomTime}>{room.lastMessageTime}</Text>
                <View style={styles.messageCountBadge}>
                  <Text style={styles.messageCountText}>
                    {room.messageCount}
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={[
                styles.roomLastMessage,
                room.flagged && styles.roomLastMessageFlagged,
              ]}
              numberOfLines={1}
            >
              {room.lastMessage}
            </Text>
            <View style={styles.roomFooter}>
              {room.active ? (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>アクティブ</Text>
                </View>
              ) : (
                <Text style={styles.closedText}>終了</Text>
              )}
              {room.flagged && (
                <View style={styles.flagBadge}>
                  <Ionicons name="flag" size={12} color={Colors.error} />
                  <Text style={styles.flagBadgeText}>フラグ付き</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Chat Detail Modal */}
      <Modal
        visible={!!selectedRoom}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRoom(null)}
      >
        {selectedRoom && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalTitle}>
                    {selectedRoom.customerName} × {selectedRoom.proName}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedRoom.messageCount}件のメッセージ
                  </Text>
                </View>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity
                    style={[
                      styles.flagToggleBtn,
                      selectedRoom.flagged && styles.flagToggleBtnActive,
                    ]}
                    onPress={() => handleToggleFlag(selectedRoom.id)}
                  >
                    <Ionicons
                      name={selectedRoom.flagged ? 'flag' : 'flag-outline'}
                      size={18}
                      color={selectedRoom.flagged ? Colors.error : Colors.textMuted}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedRoom(null)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Messages */}
              <ScrollView style={styles.messageList}>
                {selectedRoom.messages.map((msg) => {
                  const senderStyle = getSenderStyle(msg.sender);
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubbleWrap,
                        { alignItems: senderStyle.align },
                      ]}
                    >
                      <Text style={styles.senderLabel}>{senderStyle.label}</Text>
                      <View
                        style={[
                          styles.messageBubble,
                          { backgroundColor: senderStyle.bg },
                          msg.sender === 'admin' && styles.adminBubble,
                          msg.hasNgWord && styles.ngWordBubble,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            msg.hasNgWord && styles.ngWordText,
                          ]}
                        >
                          {msg.text}
                        </Text>
                        {msg.hasNgWord && (
                          <View style={styles.ngWordBadge}>
                            <Ionicons
                              name="warning"
                              size={10}
                              color={Colors.error}
                            />
                            <Text style={styles.ngWordBadgeText}>
                              NGワード検出
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Admin Message Input */}
              <View style={styles.adminInputWrap}>
                <View style={styles.adminInputLabel}>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={Colors.warning}
                  />
                  <Text style={styles.adminInputLabelText}>
                    管理者として介入メッセージを送信
                  </Text>
                </View>
                <View style={styles.adminInputRow}>
                  <TextInput
                    style={styles.adminInput}
                    value={adminMessage}
                    onChangeText={setAdminMessage}
                    placeholder="介入メッセージを入力..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      !adminMessage.trim() && styles.sendBtnDisabled,
                    ]}
                    onPress={handleSendAdminMessage}
                    disabled={!adminMessage.trim()}
                  >
                    <Ionicons name="send" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
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
    color: Colors.error,
    fontWeight: '600',
    marginTop: 2,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },

  // List
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  roomCard: {
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
  roomCardFlagged: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  roomNames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  nameWithFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  roomCustomer: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roomPro: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roomTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  messageCountBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  messageCountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  roomLastMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  roomLastMessageFlagged: {
    color: Colors.error,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  activeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.success,
  },
  closedText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error + '15',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  flagBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.error,
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
    flex: 1,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flagToggleBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.offWhite,
  },
  flagToggleBtnActive: {
    backgroundColor: Colors.error + '15',
  },

  // Messages
  messageList: {
    flex: 1,
    padding: Spacing.lg,
  },
  messageBubbleWrap: {
    marginBottom: Spacing.md,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  adminBubble: {
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  ngWordBubble: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.error + '08',
  },
  messageText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  ngWordText: {
    color: Colors.error,
  },
  ngWordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  ngWordBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Admin Input
  adminInputWrap: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  adminInputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  adminInputLabelText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.warning,
  },
  adminInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  adminInput: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
});
