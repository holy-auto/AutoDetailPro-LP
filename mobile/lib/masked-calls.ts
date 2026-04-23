import { supabase } from './supabase';
import { logAudit } from './audit';

// =============================================
// Masked Calls — phone number privacy layer
// =============================================
// Real phone numbers are never exposed in the app. To call the
// counterparty for an order, the client requests a proxy number that
// routes through a third-party provider (Twilio Proxy / Vonage).
//
// The actual provisioning happens server-side in an Edge Function
// `masked-calls` (not yet implemented — stub here). This client lib
// is the contract surface so screens can integrate now and the
// backend can land later without UI changes.

export type MaskedCallSession = {
  id: string;
  proxyNumber: string;        // The number the user dials
  expiresAt: string;          // ISO; UI should refuse to dial after this
};

/**
 * Request (or resume) a masked-call session for the given order.
 * Returns the proxy number to dial — never the real counterparty number.
 */
export async function requestMaskedCall(params: {
  orderId: string;
  calleeId: string;          // The user being called (other party of the order)
}): Promise<MaskedCallSession | null> {
  // Reuse an active session if one exists for this order + callee
  const { data: existing } = await supabase
    .from('masked_calls')
    .select('id, proxy_number, expires_at')
    .eq('order_id', params.orderId)
    .eq('callee_id', params.calleeId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      proxyNumber: existing.proxy_number,
      expiresAt: existing.expires_at,
    };
  }

  // Otherwise ask the Edge Function to provision a new proxy number
  const { data, error } = await supabase.functions.invoke('masked-calls', {
    body: {
      action: 'create_session',
      order_id: params.orderId,
      callee_id: params.calleeId,
    },
  });

  if (error || !data) return null;

  await logAudit({
    action: 'order.create',  // call request is part of the order interaction
    resourceType: 'masked_call',
    resourceId: data.id,
    metadata: { order_id: params.orderId },
  });

  return {
    id: data.id,
    proxyNumber: data.proxy_number,
    expiresAt: data.expires_at,
  };
}

/**
 * UI helper: format a phone number for display, never reveal more than
 * the first 3 / last 2 digits even if the real number leaks.
 * `09012345678` → `090****5678`
 */
export function maskPhoneForDisplay(raw: string | null | undefined): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 6) return '****';
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}
