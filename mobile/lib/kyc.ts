import * as ImagePicker from 'expo-image-picker';
import { supabase, verifyAdmin } from './supabase';
import { KYC } from '@/constants/business-rules';
import { createConnectAccount } from './stripe-connect';

// ---------------------------------------------------------------------------
// Image picker helpers for KYC submission UI
// ---------------------------------------------------------------------------

/** Prompt the user to take a photo with the device camera. */
export async function pickKycPhotoFromCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

/** Prompt the user to pick a photo from the library. */
export async function pickKycPhotoFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

// =============================================
// KYC / Identity Verification (本人確認)
// =============================================
// Document upload → admin review → approval → (auto Stripe Connect for pros)

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type KYCDocumentType = (typeof KYC.DOCUMENT_TYPES)[number]['id'];

type KYCStatus = 'pending' | 'approved' | 'rejected' | 'resubmit';

interface KYCRecord {
  id: string;
  userId: string;
  documentType: KYCDocumentType;
  documentFrontUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string;
  status: KYCStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapKYCRow(row: any): KYCRecord {
  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.id_document_type,
    documentFrontUrl: row.id_document_front_url,
    documentBackUrl: row.id_document_back_url ?? null,
    selfieUrl: row.selfie_url,
    status: row.status,
    rejectionReason: row.rejection_reason ?? null,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    stripeAccountId: row.stripe_account_id ?? null,
    stripeOnboardingComplete: row.stripe_onboarding_complete ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Upload a file to the kyc-documents storage bucket (private).
 * Returns the storage path on success.
 */
async function uploadKYCDocument(
  userId: string,
  file: { uri: string; type?: string },
  label: string,
): Promise<{ path: string; error?: string }> {
  const timestamp = Date.now();
  const ext = file.type?.includes('png') ? 'png' : 'jpg';
  const storagePath = `${userId}/${label}_${timestamp}.${ext}`;

  // Fetch the file as a blob from the local URI
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('kyc-documents')
    .upload(storagePath, blob, {
      contentType: file.type ?? 'image/jpeg',
      upsert: false,
    });

  if (error) {
    return { path: '', error: error.message };
  }

  return { path: storagePath };
}

// ---------------------------------------------------------------------------
// 1. submitKYC
// ---------------------------------------------------------------------------

/**
 * Submit KYC documents for verification.
 * Uploads ID document (front + optional back) and selfie to Supabase Storage,
 * then creates a kyc_verifications record with status 'pending'.
 */
export async function submitKYC(
  userId: string,
  documentType: KYCDocumentType,
  frontUri: string,
  backUri: string | undefined,
  selfieUri: string,
): Promise<Result<{ verificationId: string }>> {
  try {
    // Validate document type
    const docConfig = KYC.DOCUMENT_TYPES.find((d) => d.id === documentType);
    if (!docConfig) {
      return { success: false, error: `Invalid document type: ${documentType}` };
    }

    // Validate back image is provided when required
    if (docConfig.requiresBack && !backUri) {
      return {
        success: false,
        error: `${docConfig.name} requires both front and back images.`,
      };
    }

    // Upload front
    const frontResult = await uploadKYCDocument(
      userId,
      { uri: frontUri },
      `${documentType}_front`,
    );
    if (frontResult.error) {
      return { success: false, error: `Front upload failed: ${frontResult.error}` };
    }

    // Upload back (if provided)
    let backPath: string | null = null;
    if (backUri) {
      const backResult = await uploadKYCDocument(
        userId,
        { uri: backUri },
        `${documentType}_back`,
      );
      if (backResult.error) {
        return { success: false, error: `Back upload failed: ${backResult.error}` };
      }
      backPath = backResult.path;
    }

    // Upload selfie
    const selfieResult = await uploadKYCDocument(
      userId,
      { uri: selfieUri },
      'selfie',
    );
    if (selfieResult.error) {
      return { success: false, error: `Selfie upload failed: ${selfieResult.error}` };
    }

    // Create kyc_verifications record
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        id_document_type: documentType,
        id_document_front_url: frontResult.path,
        id_document_back_url: backPath,
        selfie_url: selfieResult.path,
        status: 'pending',
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { verificationId: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getMyKYCStatus
// ---------------------------------------------------------------------------

/**
 * Get the current KYC verification status for a user.
 * Returns the most recent verification record.
 */
export async function getMyKYCStatus(
  userId: string,
): Promise<Result<KYCRecord | null>> {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No record found is not an error — user hasn't submitted KYC yet
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: mapKYCRow(data) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. resubmitKYC
// ---------------------------------------------------------------------------

/**
 * Update a rejected KYC submission with corrected documents.
 * Only allowed when status is 'rejected' or 'resubmit'.
 */
export async function resubmitKYC(
  verificationId: string,
  updates: {
    documentType?: KYCDocumentType;
    frontUri?: string;
    backUri?: string;
    selfieUri?: string;
  },
): Promise<Result<{ verificationId: string }>> {
  try {
    // Fetch current record to get user_id and validate status
    const { data: existing, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!['rejected', 'resubmit'].includes(existing.status)) {
      return {
        success: false,
        error: `Cannot resubmit: current status is "${existing.status}". Only rejected or resubmit records can be updated.`,
      };
    }

    const userId = existing.user_id;
    const updatePayload: Record<string, unknown> = {
      status: 'pending',
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: new Date().toISOString(),
    };

    // Update document type if changed
    if (updates.documentType) {
      updatePayload.id_document_type = updates.documentType;
    }

    // Re-upload front if provided
    if (updates.frontUri) {
      const docType = updates.documentType ?? existing.id_document_type;
      const frontResult = await uploadKYCDocument(
        userId,
        { uri: updates.frontUri },
        `${docType}_front`,
      );
      if (frontResult.error) {
        return { success: false, error: `Front upload failed: ${frontResult.error}` };
      }
      updatePayload.id_document_front_url = frontResult.path;
    }

    // Re-upload back if provided
    if (updates.backUri) {
      const docType = updates.documentType ?? existing.id_document_type;
      const backResult = await uploadKYCDocument(
        userId,
        { uri: updates.backUri },
        `${docType}_back`,
      );
      if (backResult.error) {
        return { success: false, error: `Back upload failed: ${backResult.error}` };
      }
      updatePayload.id_document_back_url = backResult.path;
    }

    // Re-upload selfie if provided
    if (updates.selfieUri) {
      const selfieResult = await uploadKYCDocument(
        userId,
        { uri: updates.selfieUri },
        'selfie',
      );
      if (selfieResult.error) {
        return { success: false, error: `Selfie upload failed: ${selfieResult.error}` };
      }
      updatePayload.selfie_url = selfieResult.path;
    }

    const { error } = await supabase
      .from('kyc_verifications')
      .update(updatePayload)
      .eq('id', verificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { verificationId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. adminReviewKYC
// ---------------------------------------------------------------------------

/**
 * Admin approves or rejects a KYC verification.
 * On approval: if the user has a 'pro' role, automatically create a
 * Stripe Connect Express account.
 */
export async function adminReviewKYC(
  verificationId: string,
  approved: boolean,
  rejectionReason?: string,
): Promise<Result<{ status: KYCStatus; stripeAccountCreated?: boolean }>> {
  try {
    // Verify caller is an authenticated admin
    const adminId = await verifyAdmin();
    if (!adminId) {
      return { success: false, error: '管理者権限が必要です' };
    }

    if (!approved && !rejectionReason) {
      return { success: false, error: 'Rejection reason is required when rejecting.' };
    }

    const now = new Date().toISOString();
    const newStatus: KYCStatus = approved ? 'approved' : 'rejected';

    const { data: kyc, error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        status: newStatus,
        rejection_reason: approved ? null : (rejectionReason ?? null),
        reviewed_by: adminId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', verificationId)
      .select('user_id')
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    let stripeAccountCreated = false;

    // On approval, check if the user is a pro and auto-create Stripe Connect account
    if (approved && kyc?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', kyc.user_id)
        .single();

      if (profile?.role === 'pro') {
        const connectResult = await createConnectAccount(kyc.user_id, profile.email);
        stripeAccountCreated = connectResult.success;
      }
    }

    return {
      success: true,
      data: { status: newStatus, stripeAccountCreated },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. getPendingKYCReviews
// ---------------------------------------------------------------------------

/**
 * Admin: list all pending KYC verifications awaiting review.
 * Ordered by creation date (oldest first) to respect the review deadline.
 *
 * Review deadline: {@link KYC.REVIEW_DEADLINE_DAYS} business days.
 */
export async function getPendingKYCReviews(): Promise<
  Result<{
    reviews: Array<KYCRecord & { userName: string | null; userEmail: string | null }>;
    total: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        profiles!kyc_verifications_user_id_fkey(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const reviews = (data ?? []).map((row: any) => ({
      ...mapKYCRow(row),
      userName: row.profiles?.full_name ?? null,
      userEmail: row.profiles?.email ?? null,
    }));

    return {
      success: true,
      data: { reviews, total: reviews.length },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
