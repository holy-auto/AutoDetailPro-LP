import { useEffect, useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { useAuth } from '../_layout';

type KycStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';

type KycSubmission = {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'pro';
  submissionDate: string;
  documentType: string;
  status: KycStatus;
  rejectionReason?: string;
};

const DOC_TYPE_LABELS: Record<string, string> = {
  drivers_license: '運転免許証',
  my_number: 'マイナンバーカード',
  passport: 'パスポート',
  residence_card: '在留カード',
};

type FilterTab = 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: '審査待ち', color: Colors.warning, bg: Colors.warning + '20', icon: 'time' },
  approved: { label: '承認済み', color: Colors.success, bg: Colors.success + '20', icon: 'checkmark-circle' },
  rejected: { label: '却下', color: Colors.error, bg: Colors.error + '20', icon: 'close-circle' },
  resubmit: { label: '再提出', color: Colors.warning, bg: Colors.warning + '20', icon: 'refresh' },
};

const DOC_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  '運転免許証': { color: Colors.primary, bg: Colors.primaryFaint },
  'マイナンバーカード': { color: '#7C3AED', bg: '#EDE9FE' },
  'パスポート': { color: '#0891B2', bg: '#CFFAFE' },
};

export default function AdminKycScreen() {
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState<FilterTab>('pending');
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  async function refresh() {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        id, user_id, status, id_document_type, rejection_reason, created_at,
        profile:user_id(full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) {
      setLoading(false);
      return;
    }

    const rows: KycSubmission[] = data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.profile?.full_name ?? '未入力',
      userType: row.profile?.role === 'customer' ? 'customer' : 'pro',
      submissionDate: row.created_at?.slice(0, 10) ?? '',
      documentType: DOC_TYPE_LABELS[row.id_document_type] ?? row.id_document_type,
      status: row.status as KycStatus,
      rejectionReason: row.rejection_reason ?? undefined,
    }));
    setSubmissions(rows);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredSubmissions = submissions.filter((s) =>
    filterTab === 'pending'
      ? s.status === 'pending' || s.status === 'resubmit'
      : s.status === filterTab,
  );

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'pending', label: '審査待ち', count: pendingCount },
    { key: 'approved', label: '承認済み', count: approvedCount },
    { key: 'rejected', label: '却下', count: rejectedCount },
  ];

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'approved',
        rejection_reason: null,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      Alert.alert('エラー', error.message);
      return;
    }
    await logAudit({
      action: 'kyc.approve',
      resourceType: 'kyc_verification',
      resourceId: id,
    });
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' as KycStatus } : s)),
    );
    setSelectedSubmission(null);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return;
    const reason = rejectionReason.trim();
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      Alert.alert('エラー', error.message);
      return;
    }
    await logAudit({
      action: 'kyc.reject',
      resourceType: 'kyc_verification',
      resourceId: id,
      metadata: { reason },
    });
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'rejected' as KycStatus, rejectionReason: reason }
          : s,
      ),
    );
    setSelectedSubmission(null);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>本人確認審査</Text>
        <Text style={styles.subtitle}>
          {pendingCount}件の審査待ち
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
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={{ paddingVertical: Spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Submissions List */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        windowSize={7}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>該当する申請はありません</Text>
          </View>
        }
        renderItem={({ item: submission }) => {
          const statusConfig = STATUS_CONFIG[submission.status];
          const docColors = DOC_TYPE_COLORS[submission.documentType] ?? {
            color: Colors.textSecondary,
            bg: Colors.offWhite,
          };

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedSubmission(submission)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={22} color={Colors.primaryMedium} />
                  </View>
                  <View>
                    <Text style={styles.userName}>{submission.userName}</Text>
                    <Text style={styles.userType}>
                      {submission.userType === 'pro' ? 'プロ' : 'カスタマー'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>書類種別</Text>
                  <View style={[styles.docBadge, { backgroundColor: docColors.bg }]}>
                    <Text style={[styles.docBadgeText, { color: docColors.color }]}>
                      {submission.documentType}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>申請日</Text>
                  <Text style={styles.cardValue}>{submission.submissionDate}</Text>
                </View>
                {submission.rejectionReason && (
                  <View style={styles.rejectionRow}>
                    <Ionicons name="alert-circle" size={14} color={Colors.error} />
                    <Text style={styles.rejectionText}>
                      {submission.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Review Modal */}
      <Modal
        visible={!!selectedSubmission}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        {selectedSubmission && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>KYC審査</Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Ionicons name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>申請者情報</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>氏名</Text>
                    <Text style={styles.modalInfoValue}>{selectedSubmission.userName}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>ユーザー種別</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedSubmission.userType === 'pro' ? 'プロ' : 'カスタマー'}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>書類種別</Text>
                    <Text style={styles.modalInfoValue}>{selectedSubmission.documentType}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>申請日</Text>
                    <Text style={styles.modalInfoValue}>{selectedSubmission.submissionDate}</Text>
                  </View>
                </View>

                {/* ID Document Placeholders */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>本人確認書類</Text>
                  <View style={styles.docPreviewRow}>
                    <View style={styles.docPreview}>
                      <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                      <Text style={styles.docPreviewLabel}>表面</Text>
                    </View>
                    <View style={styles.docPreview}>
                      <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                      <Text style={styles.docPreviewLabel}>裏面</Text>
                    </View>
                  </View>
                </View>

                {/* Selfie Placeholder */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>セルフィー</Text>
                  <View style={styles.selfiePreview}>
                    <Ionicons name="person-circle-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.docPreviewLabel}>本人確認写真</Text>
                  </View>
                </View>

                {/* Previous rejection reason */}
                {selectedSubmission.rejectionReason && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>前回の却下理由</Text>
                    <View style={styles.previousRejection}>
                      <Ionicons name="alert-circle" size={16} color={Colors.error} />
                      <Text style={styles.previousRejectionText}>
                        {selectedSubmission.rejectionReason}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons (only for pending) */}
                {selectedSubmission.status === 'pending' && (
                  <View style={styles.modalActions}>
                    {!showRejectInput ? (
                      <>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApprove(selectedSubmission.id)}
                        >
                          <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                          <Text style={styles.approveBtnText}>承認する</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => setShowRejectInput(true)}
                        >
                          <Ionicons name="close-circle" size={20} color={Colors.error} />
                          <Text style={styles.rejectBtnText}>却下する</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.rejectInputWrap}>
                        <Text style={styles.rejectInputLabel}>却下理由</Text>
                        <TextInput
                          style={styles.rejectInput}
                          value={rejectionReason}
                          onChangeText={setRejectionReason}
                          placeholder="却下理由を入力してください..."
                          placeholderTextColor={Colors.textMuted}
                          multiline
                          numberOfLines={3}
                        />
                        <View style={styles.rejectInputActions}>
                          <TouchableOpacity
                            style={styles.cancelRejectBtn}
                            onPress={() => {
                              setShowRejectInput(false);
                              setRejectionReason('');
                            }}
                          >
                            <Text style={styles.cancelRejectBtnText}>キャンセル</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.confirmRejectBtn,
                              !rejectionReason.trim() && styles.confirmRejectBtnDisabled,
                            ]}
                            onPress={() => handleReject(selectedSubmission.id)}
                            disabled={!rejectionReason.trim()}
                          >
                            <Text style={styles.confirmRejectBtnText}>却下を確定</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Status for non-pending */}
                {selectedSubmission.status !== 'pending' && (
                  <View style={styles.modalStatusSection}>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        { backgroundColor: STATUS_CONFIG[selectedSubmission.status].bg },
                      ]}
                    >
                      <Ionicons
                        name={STATUS_CONFIG[selectedSubmission.status].icon as any}
                        size={20}
                        color={STATUS_CONFIG[selectedSubmission.status].color}
                      />
                      <Text
                        style={[
                          styles.modalStatusText,
                          { color: STATUS_CONFIG[selectedSubmission.status].color },
                        ]}
                      >
                        {STATUS_CONFIG[selectedSubmission.status].label}
                      </Text>
                    </View>
                  </View>
                )}
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
    color: Colors.warning,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
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
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userType: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  cardBody: {
    gap: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  cardValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  docBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  docBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  rejectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  rejectionText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.error,
    lineHeight: 16,
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
  },
  docPreviewRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  docPreview: {
    flex: 1,
    height: 120,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docPreviewLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  selfiePreview: {
    height: 140,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previousRejection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '08',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  previousRejectionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error,
    lineHeight: 20,
  },

  // Actions
  modalActions: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
  },
  approveBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  rejectBtn: {
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
  rejectBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.error,
  },
  rejectInputWrap: {
    gap: Spacing.sm,
  },
  rejectInputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.error,
  },
  rejectInput: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rejectInputActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelRejectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
  },
  cancelRejectBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmRejectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
  },
  confirmRejectBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  confirmRejectBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  modalStatusSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  modalStatusText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
