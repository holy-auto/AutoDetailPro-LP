import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { KYC, type KYCDocumentType } from '@/constants/business-rules';
import { useAuth } from '../_layout';
import { supabase } from '@/lib/supabase';
import {
  submitKYC,
  pickKycPhotoFromCamera,
  pickKycPhotoFromLibrary,
} from '@/lib/kyc';

// =============================================
// KYC submission flow
// =============================================
// 1. Status screen (what state the user is in)
// 2. Document type selection
// 3. Photo capture (front / back if required / selfie)
// 4. Submit + transition to 'pending'

type Step = 'status' | 'doc_type' | 'capture' | 'submitting';
type PhotoKind = 'front' | 'back' | 'selfie';

const STATUS_COPY: Record<string, { title: string; body: string; cta: string | null }> = {
  missing: {
    title: '本人確認が必要です',
    body: 'プロとして接客するには、運転免許証等の本人確認書類の提出が必要です。所要時間は5分程度です。',
    cta: '本人確認を始める',
  },
  pending: {
    title: '審査中です',
    body: '本人確認書類を確認しています。通常24時間以内に審査が完了します。',
    cta: null,
  },
  resubmit: {
    title: '再提出が必要です',
    body: '提出いただいた書類に不備がありました。再度ご提出ください。',
    cta: '再提出する',
  },
  rejected: {
    title: '審査が承認されませんでした',
    body: 'お問い合わせフォームより詳細をご確認ください。',
    cta: null,
  },
};

export default function KycGateScreen() {
  const router = useRouter();
  const { user, kycStatus } = useAuth();
  const [step, setStep] = useState<Step>('status');
  const [documentType, setDocumentType] = useState<KYCDocumentType | null>(null);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<PhotoKind | null>(null);

  const status = kycStatus ?? 'missing';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.missing;

  const docConfig = documentType
    ? KYC.DOCUMENT_TYPES.find((d) => d.id === documentType)
    : null;
  const requiresBack = docConfig?.requiresBack ?? false;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const pickFor = (kind: PhotoKind) => setPickerOpen(kind);

  const handlePickSource = async (source: 'camera' | 'library') => {
    const kind = pickerOpen;
    setPickerOpen(null);
    if (!kind) return;
    const uri = source === 'camera'
      ? await pickKycPhotoFromCamera()
      : await pickKycPhotoFromLibrary();
    if (!uri) return;
    if (kind === 'front') setFrontUri(uri);
    if (kind === 'back') setBackUri(uri);
    if (kind === 'selfie') setSelfieUri(uri);
  };

  const handleSubmit = async () => {
    if (!user?.id || !documentType || !frontUri || !selfieUri) return;
    if (requiresBack && !backUri) {
      Alert.alert('エラー', '裏面の写真も必要です');
      return;
    }
    setStep('submitting');
    const result = await submitKYC(
      user.id,
      documentType,
      frontUri,
      requiresBack ? backUri ?? undefined : undefined,
      selfieUri,
    );
    if (!result.success) {
      Alert.alert('エラー', result.error ?? '提出に失敗しました');
      setStep('capture');
      return;
    }
    Alert.alert('提出完了', '審査を開始しました。24時間以内に結果をお知らせします。', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  // --- STATUS step -------------------------------------------------------
  if (step === 'status') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>

          {copy.cta && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('doc_type')}>
              <Text style={styles.primaryBtnText}>{copy.cta}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSignOut}>
            <Text style={styles.secondaryBtnText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- DOC_TYPE step ----------------------------------------------------
  if (step === 'doc_type') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('status')}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>書類を選択</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.docTypeContent}>
          <Text style={styles.subtitle}>ご提出いただく本人確認書類を選んでください</Text>
          {KYC.DOCUMENT_TYPES.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.docCard,
                documentType === doc.id && styles.docCardActive,
              ]}
              onPress={() => {
                setDocumentType(doc.id as KYCDocumentType);
                setFrontUri(null);
                setBackUri(null);
              }}
            >
              <Ionicons
                name="document-text"
                size={28}
                color={documentType === doc.id ? Colors.primary : Colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docHint}>
                  {doc.requiresBack ? '表面 + 裏面 + セルフィー' : '表面 + セルフィー'}
                </Text>
              </View>
              {documentType === doc.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.primaryBtn, !documentType && styles.primaryBtnDisabled]}
            onPress={() => documentType && setStep('capture')}
            disabled={!documentType}
          >
            <Text style={styles.primaryBtnText}>次へ</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CAPTURE / SUBMITTING steps ---------------------------------------
  const allReady = !!(frontUri && selfieUri && (!requiresBack || backUri));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('doc_type')} disabled={step === 'submitting'}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>書類の撮影</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.captureContent}>
        <PhotoSlot
          label={`${docConfig?.name}（表面）`}
          uri={frontUri}
          onTap={() => pickFor('front')}
        />
        {requiresBack && (
          <PhotoSlot
            label={`${docConfig?.name}（裏面）`}
            uri={backUri}
            onTap={() => pickFor('back')}
          />
        )}
        <PhotoSlot
          label="セルフィー（自分の顔）"
          uri={selfieUri}
          onTap={() => pickFor('selfie')}
          hint="書類と本人が同一人物であることを確認します"
        />

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!allReady || step === 'submitting') && styles.primaryBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!allReady || step === 'submitting'}
        >
          {step === 'submitting' ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>提出する</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          提出された書類は本人確認のみに使用され、審査完了後にセキュアに保管されます。
        </Text>
      </ScrollView>

      {/* Source picker modal */}
      <Modal visible={!!pickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerOpen(null)}
        >
          <View style={styles.modalSheet}>
            <TouchableOpacity style={styles.modalBtn} onPress={() => handlePickSource('camera')}>
              <Ionicons name="camera" size={22} color={Colors.primary} />
              <Text style={styles.modalBtnText}>カメラで撮影</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => handlePickSource('library')}>
              <Ionicons name="image" size={22} color={Colors.primary} />
              <Text style={styles.modalBtnText}>ライブラリから選択</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={() => setPickerOpen(null)}
            >
              <Text style={[styles.modalBtnText, { color: Colors.textMuted }]}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function PhotoSlot({
  label,
  uri,
  hint,
  onTap,
}: {
  label: string;
  uri: string | null;
  hint?: string;
  onTap: () => void;
}) {
  return (
    <TouchableOpacity style={styles.slot} onPress={onTap}>
      <View style={styles.slotLabelWrap}>
        <Text style={styles.slotLabel}>{label}</Text>
        {hint && <Text style={styles.slotHint}>{hint}</Text>}
      </View>
      {uri ? (
        <Image source={{ uri }} style={styles.slotImage} />
      ) : (
        <View style={styles.slotPlaceholder}>
          <Ionicons name="camera-outline" size={36} color={Colors.primary} />
          <Text style={styles.slotPlaceholderText}>タップして撮影</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, gap: Spacing.lg,
  },
  docTypeContent: { padding: Spacing.lg, gap: Spacing.md },
  captureContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl, fontWeight: '800',
    color: Colors.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: BorderRadius.md,
    alignSelf: 'stretch', alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.white,
  },
  secondaryBtn: { paddingVertical: Spacing.sm },
  secondaryBtnText: {
    fontSize: FontSize.sm, color: Colors.textMuted,
  },
  // Document selection
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 2, borderColor: Colors.borderLight,
    backgroundColor: Colors.card,
  },
  docCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  docName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  docHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  // Capture slots
  slot: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  slotLabelWrap: { marginBottom: Spacing.sm },
  slotLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  slotHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  slotImage: {
    width: '100%', aspectRatio: 16 / 10,
    borderRadius: BorderRadius.sm, resizeMode: 'cover',
  },
  slotPlaceholder: {
    aspectRatio: 16 / 10, backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center',
    gap: Spacing.sm,
  },
  slotPlaceholderText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  disclaimer: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.md, gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  modalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.sm,
  },
  modalBtnCancel: { justifyContent: 'center' },
  modalBtnText: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary,
  },
});
