import { supabase } from './supabase';

// =============================================
// Audit Logging
// =============================================
// Append-only log of sensitive mutations. Used for compliance,
// debugging, and fraud investigation.
//
// NOTE: Client-side inserts are restricted to the authenticated actor
// via RLS (WITH CHECK auth.uid() = actor_id). This gives tamper-evidence
// but not full integrity — for legal-grade logging, move inserts to
// Edge Functions so the service-role key signs them.

export type AuditAction =
  // Orders
  | 'order.create'
  | 'order.cancel'
  | 'order.accept'
  | 'order.complete'
  | 'order.dispute'
  // Payments
  | 'payment.create_intent'
  | 'payment.capture'
  | 'payment.cancel_intent'
  | 'payment.refund'
  // Boost
  | 'boost.create_intent'
  | 'boost.activate'
  | 'boost.expire'
  // Profile / Role
  | 'profile.update'
  | 'profile.role_change'
  | 'pro.online'
  | 'pro.offline'
  | 'pro.suspend'
  | 'pro.unsuspend'
  // KYC
  | 'kyc.submit'
  | 'kyc.approve'
  | 'kyc.reject'
  // Coupons
  | 'coupon.issue'
  | 'coupon.use'
  // Reviews
  | 'review.submit'
  | 'review.moderate';

/**
 * Best-effort audit log insert. Never throws — audit logging
 * must not break the business flow.
 */
export async function logAudit(params: {
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const role = (user.user_metadata?.role as string | undefined) ?? null;

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: role,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Swallow — audit failures must not surface to users
  }
}
