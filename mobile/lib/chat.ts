import { supabase, verifyAdmin } from './supabase';
import { CHAT, ORDER_STATUS } from '@/constants/business-rules';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================
// Chat System — Admin Monitoring 付きチャット
// =============================================
// 顧客とプロのチャット機能。
// NGワード検出で個人情報交換を防止し、
// 管理者が介入・監視できる仕組みを提供。

type Result<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

type ChatRoom = {
  id: string;
  order_id: string;
  customer_id: string;
  pro_id: string;
  status: 'active' | 'flagged' | 'closed';
  flagged_by?: string | null;
  flag_reason?: string | null;
  created_at: string;
  closed_at?: string | null;
};

type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  flagged: boolean;
  flag_reason?: string | null;
  read_at?: string | null;
  created_at: string;
};

type NgCheckResult = {
  flagged: boolean;
  reason?: string;
};

// =============================================
// 1. Create Chat Room
// =============================================

/**
 * 注文に紐づくチャットルームを作成する。
 */
export async function createChatRoom(
  orderId: string,
  customerId: string,
  proId: string,
): Promise<Result<{ roomId: string }>> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        pro_id: proId,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { roomId: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 2. Send Message
// =============================================

/**
 * チャットメッセージを送信する。
 * NGワードチェックを行い、検出された場合は flagged=true で保存し、
 * 管理者に通知する。
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  message: string,
  messageType: string = 'text',
): Promise<Result<{ messageId: string; flagged: boolean }>> {
  try {
    // メッセージバリデーション
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { success: false, error: 'メッセージを入力してください' };
    }
    if (trimmed.length > CHAT.MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `メッセージは${CHAT.MAX_MESSAGE_LENGTH}文字以内で入力してください`,
      };
    }

    // NGワードチェック
    const ngResult = checkNgWords(message);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        message,
        message_type: messageType,
        flagged: ngResult.flagged,
        flag_reason: ngResult.reason ?? null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // NGワード検出時: 管理者に通知
    if (ngResult.flagged) {
      await notifyAdminNgDetected(roomId, senderId, ngResult.reason ?? '');
    }

    return { success: true, data: { messageId: data.id, flagged: ngResult.flagged } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 3. Get Messages (Paginated)
// =============================================

/**
 * チャットルームのメッセージを取得（ページネーション対応）。
 * before を指定すると、そのタイムスタンプより前のメッセージを取得。
 */
export async function getMessages(
  roomId: string,
  limit: number = 50,
  before?: string,
): Promise<Result<ChatMessage[]>> {
  try {
    // Cap the limit to prevent excessive data fetching
    const safeLimit = Math.min(Math.max(1, limit), 100);

    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ChatMessage[] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 4. Mark Message Read
// =============================================

/**
 * メッセージを既読にする。
 */
export async function markMessageRead(
  messageId: string,
): Promise<Result<{ messageId: string }>> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { messageId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 5. Check NG Words
// =============================================

/**
 * テキストに NG パターン（電話番号、メール、LINE、Instagram、Twitter）が
 * 含まれているかチェックする。
 */
export function checkNgWords(text: string): NgCheckResult {
  const patternLabels = [
    '電話番号',
    'メールアドレス',
    'LINE',
    'Instagram',
    'Twitter',
  ];

  for (let i = 0; i < CHAT.NG_PATTERNS.length; i++) {
    if (CHAT.NG_PATTERNS[i].test(text)) {
      return {
        flagged: true,
        reason: `${patternLabels[i]}の共有が検出されました`,
      };
    }
  }

  return { flagged: false };
}

// =============================================
// 6. Flag Room (Admin)
// =============================================

/**
 * 管理者が問題のあるチャットルームをフラグ付けする。
 */
export async function flagRoom(
  roomId: string,
  reason: string,
): Promise<Result<{ roomId: string }>> {
  try {
    // Verify caller is an authenticated admin
    const adminId = await verifyAdmin();
    if (!adminId) {
      return { success: false, error: '管理者権限が必要です' };
    }

    const { error } = await supabase
      .from('chat_rooms')
      .update({
        status: 'flagged',
        flagged_by: adminId,
        flag_reason: reason,
        flagged_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { roomId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 7. Send Admin Message
// =============================================

/**
 * 管理者がチャットルームに介入メッセージを送信する。
 */
export async function sendAdminMessage(
  roomId: string,
  message: string,
): Promise<Result<{ messageId: string }>> {
  try {
    // Verify caller is an authenticated admin
    const adminId = await verifyAdmin();
    if (!adminId) {
      return { success: false, error: '管理者権限が必要です' };
    }

    // Validate message length
    if (message.length > CHAT.MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `メッセージは${CHAT.MAX_MESSAGE_LENGTH}文字以内で入力してください`,
      };
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: adminId,
        message,
        message_type: 'admin',
        flagged: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { messageId: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 8. Close Chat Room
// =============================================

/**
 * チャットルームをクローズする。
 */
export async function closeChatRoom(
  roomId: string,
): Promise<Result<{ roomId: string }>> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { roomId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 9. Subscribe to Chat (Realtime)
// =============================================

/**
 * チャットルームの新着メッセージをリアルタイムで受信する。
 * unsubscribe 関数を返す。
 */
export function subscribeToChat(
  roomId: string,
  callback: (message: ChatMessage) => void,
): { unsubscribe: () => void } {
  const channel: RealtimeChannel = supabase
    .channel(`chat-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// =============================================
// 10. Get Flagged Chats (Admin)
// =============================================

/**
 * フラグ付きチャットルーム一覧を取得（管理者向け）。
 */
export async function getFlaggedChats(): Promise<Result<ChatRoom[]>> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('status', 'flagged')
      .order('flagged_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ChatRoom[] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// 11. Auto-Close Expired Chats (Cron)
// =============================================

/**
 * 注文完了から AUTO_CLOSE_HOURS (24h) 経過したチャットルームを
 * 自動クローズする。Cron ジョブから呼び出される想定。
 */
export async function autoCloseExpiredChats(): Promise<
  Result<{ closedCount: number }>
> {
  try {
    const cutoff = new Date(
      Date.now() - CHAT.AUTO_CLOSE_HOURS * 60 * 60 * 1000,
    ).toISOString();

    // 完了済み注文に紐づくアクティブなチャットルームを取得
    // completed_at が cutoff より前のものを対象
    const { data: rooms, error: fetchErr } = await supabase
      .from('chat_rooms')
      .select('id, order_id')
      .eq('status', 'active');

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    if (!rooms || rooms.length === 0) {
      return { success: true, data: { closedCount: 0 } };
    }

    // 対象注文の完了日時を取得
    const orderIds = rooms.map((r) => r.order_id);
    const { data: orders, error: orderErr } = await supabase
      .from('orders')
      .select('id, status, completed_at')
      .in('id', orderIds)
      .in('status', [ORDER_STATUS.COMPLETED, ORDER_STATUS.AUTO_COMPLETED])
      .lt('completed_at', cutoff);

    if (orderErr) {
      return { success: false, error: orderErr.message };
    }

    if (!orders || orders.length === 0) {
      return { success: true, data: { closedCount: 0 } };
    }

    // 対象ルームをクローズ
    const completedOrderIds = new Set(orders.map((o) => o.id));
    const roomsToClose = rooms.filter((r) => completedOrderIds.has(r.order_id));

    if (roomsToClose.length === 0) {
      return { success: true, data: { closedCount: 0 } };
    }

    const roomIdsToClose = roomsToClose.map((r) => r.id);
    const now = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('chat_rooms')
      .update({ status: 'closed', closed_at: now })
      .in('id', roomIdsToClose);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true, data: { closedCount: roomIdsToClose.length } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =============================================
// Internal Helpers
// =============================================

/**
 * NGワード検出時に管理者へ通知を送る。
 * notifications テーブルに admin 向けレコードを挿入。
 */
async function notifyAdminNgDetected(
  roomId: string,
  senderId: string,
  reason: string,
): Promise<void> {
  try {
    // 管理者ユーザーを取得（role = 'admin'）
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) return;

    const now = new Date().toISOString();
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: 'chat_ng_detected',
      title: 'NGワード検出',
      body: CHAT.NG_WARNING,
      data: {
        room_id: roomId,
        sender_id: senderId,
        reason,
      },
      read: false,
      created_at: now,
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (err) {
    console.error('[chat] Failed to notify admin about NG word:', (err as Error).message);
  }
}
