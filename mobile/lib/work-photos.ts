import { supabase } from './supabase';
import { WORK_PHOTOS } from '@/constants/business-rules';

// =============================================
// 施工写真（Work Photos）— Upload & Portfolio
// =============================================
// Before/After photos for each order.
// Pros can toggle photos as public for their portfolio.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type WorkPhoto = {
  id: string;
  order_id: string;
  pro_id: string;
  photo_type: 'before' | 'after';
  photo_url: string;
  caption: string | null;
  is_public: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// 1. uploadWorkPhoto — Upload a photo to Storage + insert DB record
// ---------------------------------------------------------------------------

export async function uploadWorkPhoto(
  orderId: string,
  proId: string,
  photoType: 'before' | 'after',
  photoUri: string,
  caption?: string,
): Promise<Result<WorkPhoto>> {
  try {
    // Check photo count limit
    const { data: existing, error: countErr } = await supabase
      .from('work_photos')
      .select('id')
      .eq('order_id', orderId);

    if (countErr) return { success: false, error: countErr.message };

    if ((existing?.length ?? 0) >= WORK_PHOTOS.MAX_PHOTOS_PER_ORDER) {
      return {
        success: false,
        error: `写真の上限（${WORK_PHOTOS.MAX_PHOTOS_PER_ORDER}枚）に達しています`,
      };
    }

    // Read file and validate size
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const fileSizeMB = blob.size / (1024 * 1024);
    if (fileSizeMB > WORK_PHOTOS.MAX_FILE_SIZE_MB) {
      return {
        success: false,
        error: `ファイルサイズが${WORK_PHOTOS.MAX_FILE_SIZE_MB}MBを超えています`,
      };
    }

    // Determine file extension from URI or default to jpg
    const extension = photoUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${orderId}/${photoType}_${Date.now()}.${extension}`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('work-photos')
      .upload(fileName, blob, {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        upsert: false,
      });

    if (uploadErr) return { success: false, error: uploadErr.message };

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('work-photos')
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Insert DB record
    const { data: photo, error: insertErr } = await supabase
      .from('work_photos')
      .insert({
        order_id: orderId,
        pro_id: proId,
        photo_type: photoType,
        photo_url: photoUrl,
        caption: caption ?? null,
        is_public: false,
      })
      .select('*')
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    return { success: true, data: photo as WorkPhoto };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getOrderPhotos — Get before/after photos for an order
// ---------------------------------------------------------------------------

export async function getOrderPhotos(
  orderId: string,
): Promise<Result<{ before: WorkPhoto[]; after: WorkPhoto[] }>> {
  try {
    const { data, error } = await supabase
      .from('work_photos')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    const photos = (data ?? []) as WorkPhoto[];
    const before = photos.filter((p) => p.photo_type === 'before');
    const after = photos.filter((p) => p.photo_type === 'after');

    return { success: true, data: { before, after } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getProPortfolio — Get public photos for a pro's portfolio
// ---------------------------------------------------------------------------

export async function getProPortfolio(
  proId: string,
  limit: number = 20,
): Promise<Result<WorkPhoto[]>> {
  try {
    const { data, error } = await supabase
      .from('work_photos')
      .select('*')
      .eq('pro_id', proId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as WorkPhoto[] };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. togglePhotoPublic — Pro toggles whether photo is in their public portfolio
// ---------------------------------------------------------------------------

export async function togglePhotoPublic(
  photoId: string,
  isPublic: boolean,
): Promise<Result<{ photoId: string; isPublic: boolean }>> {
  try {
    const { error } = await supabase
      .from('work_photos')
      .update({ is_public: isPublic })
      .eq('id', photoId);

    if (error) return { success: false, error: error.message };

    return { success: true, data: { photoId, isPublic } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. deletePhoto — Delete from storage and DB
// ---------------------------------------------------------------------------

export async function deletePhoto(
  photoId: string,
): Promise<Result<{ photoId: string }>> {
  try {
    // Fetch the photo record to get the storage path
    const { data: photo, error: fetchErr } = await supabase
      .from('work_photos')
      .select('photo_url')
      .eq('id', photoId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (!photo) return { success: false, error: '写真が見つかりません' };

    // Extract the storage path from the public URL
    // URL format: .../storage/v1/object/public/work-photos/<path>
    const url = photo.photo_url as string;
    const bucketPrefix = '/work-photos/';
    const pathIndex = url.indexOf(bucketPrefix);
    if (pathIndex !== -1) {
      const storagePath = url.substring(pathIndex + bucketPrefix.length);
      await supabase.storage.from('work-photos').remove([storagePath]);
    }

    // Delete DB record
    const { error: deleteErr } = await supabase
      .from('work_photos')
      .delete()
      .eq('id', photoId);

    if (deleteErr) return { success: false, error: deleteErr.message };

    return { success: true, data: { photoId } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
