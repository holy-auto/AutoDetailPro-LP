import { supabase } from './supabase';
import { PUSH_NOTIFICATIONS } from '@/constants/business-rules';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// =============================================
// Push Notification System
// =============================================
// Expo Push Notifications を使用したプッシュ通知の
// トークン登録・送信・管理。

type Result<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
};

// =============================================
// 1. Register Push Token
// =============================================

/**
 * デバイスの Expo Push Token を取得し、push_tokens テーブルに保存する。
 * 実機でのみ動作（シミュレーターでは push 不可）。
 */
export async function registerPushToken(
  userId: string,
): Promise<Result<{ token: string }>> {
  try {
    if (!Device.isDevice) {
      return { success: false, error: 'Push notifications require a physical device' };
    }

    // パーミッション確認・リクエスト
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, error: 'Push notification permission denied' };
    }

    // Expo Push Token 取得
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // プラットフォーム判定
    const platform: 'ios' | 'android' | 'web' =
      Platform.OS === 'ios'
        ? 'ios'
        : Platform.OS === 'android'
          ? 'android'
          : 'web';

    // push_tokens テーブルに upsert（同一トークンは更新）
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' },
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { token } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 2. Send Push Notification
// =============================================

/**
 * 指定ユーザーのアクティブなトークンすべてに Expo Push API で通知を送信。
 * 同時に notifications テーブルにも記録する。
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<Result<{ ticketIds: string[] }>> {
  try {
    // ユーザーのアクティブトークンを取得
    const { data: tokens, error: fetchErr } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('active', true);

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    if (!tokens || tokens.length === 0) {
      return { success: false, error: 'No active push tokens found for user' };
    }

    // notifications テーブルに記録
    await supabase.from('notifications').insert({
      user_id: userId,
      type: data?.type ?? PUSH_NOTIFICATIONS.TYPES.ORDER_STATUS,
      title,
      body,
      data: data ?? null,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Expo Push API でバッチ送信
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default' as const,
      title,
      body,
      data: data ?? {},
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    const ticketIds: string[] = (result.data ?? [])
      .filter((ticket: any) => ticket.id)
      .map((ticket: any) => ticket.id);

    return { success: true, data: { ticketIds } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 3. Send Batch Notifications
// =============================================

/**
 * 複数ユーザーに同一通知を一括送信。
 * Expo Push API の 100 件制限に対応してチャンク分割。
 */
export async function sendBatchNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<Result<{ sent: number; failed: number }>> {
  try {
    // 全対象ユーザーのアクティブトークンを一括取得
    const { data: tokens, error: fetchErr } = await supabase
      .from('push_tokens')
      .select('user_id, token')
      .in('user_id', userIds)
      .eq('active', true);

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    if (!tokens || tokens.length === 0) {
      return { success: true, data: { sent: 0, failed: 0 } };
    }

    // notifications テーブルに一括挿入
    const notificationRows = [...new Set(tokens.map((t) => t.user_id))].map(
      (uid) => ({
        user_id: uid,
        type: data?.type ?? PUSH_NOTIFICATIONS.TYPES.ORDER_STATUS,
        title,
        body,
        data: data ?? null,
        read: false,
        created_at: new Date().toISOString(),
      }),
    );

    await supabase.from('notifications').insert(notificationRows);

    // Expo Push メッセージ生成
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default' as const,
      title,
      body,
      data: data ?? {},
    }));

    // 100 件ずつチャンク分割して送信
    const CHUNK_SIZE = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();

      for (const ticket of result.data ?? []) {
        if (ticket.status === 'ok') {
          sent++;
        } else {
          failed++;
        }
      }
    }

    return { success: true, data: { sent, failed } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 4. Mark Notification Read
// =============================================

/**
 * 指定の通知を既読にする。
 */
export async function markNotificationRead(
  notificationId: string,
): Promise<Result<{ notificationId: string }>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { notificationId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 5. Get My Notifications
// =============================================

/**
 * ユーザーの通知一覧を取得（新しい順）。
 */
export async function getMyNotifications(
  userId: string,
  limit: number = 50,
): Promise<Result<Notification[]>> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Notification[] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 6. Get Unread Count
// =============================================

/**
 * ユーザーの未読通知数を返す。
 */
export async function getUnreadCount(
  userId: string,
): Promise<Result<{ count: number }>> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { count: count ?? 0 } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
