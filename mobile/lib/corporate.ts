import { supabase } from './supabase';
import { CORPORATE } from '@/constants/business-rules';

// =============================================
// Corporate / Fleet Account Management
// =============================================
// Lifecycle: create (pending) → approve (active) → manage members & vehicles.
// Discount tiers based on registered vehicle count.
// Uses: corporate_accounts, corporate_members, corporate_vehicles tables.

// --- Result type ---

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- Types ---

type CorporateAccount = {
  id: string;
  admin_user_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_address: string | null;
  tax_id: string | null;
  billing_cycle: string;
  discount_percent: number;
  status: string;
  created_at: string;
};

type CorporateMember = {
  id: string;
  corporate_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

type CorporateVehicle = {
  id: string;
  corporate_id: string;
  vehicle_id: string;
  department: string | null;
  assigned_to: string | null;
  created_at: string;
};

type CorporateDashboard = {
  account: CorporateAccount;
  memberCount: number;
  vehicleCount: number;
  totalOrders: number;
  totalSpend: number;
  currentDiscountPercent: number;
};

// ---------------------------------------------------------------------------
// 1. createCorporateAccount — Register a new corporate/fleet account
// ---------------------------------------------------------------------------

export async function createCorporateAccount(
  adminUserId: string,
  data: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    companyAddress?: string;
    taxId?: string;
  },
): Promise<Result<CorporateAccount>> {
  try {
    // Insert the corporate account with status 'pending' (admin reviews)
    const { data: account, error: insertErr } = await supabase
      .from('corporate_accounts')
      .insert({
        admin_user_id: adminUserId,
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone ?? null,
        company_address: data.companyAddress ?? null,
        tax_id: data.taxId ?? null,
        billing_cycle: 'monthly',
        discount_percent: 0,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    // Add the admin user as a corporate member with role 'admin'
    const { error: memberErr } = await supabase
      .from('corporate_members')
      .insert({
        corporate_id: account.id,
        user_id: adminUserId,
        role: 'admin',
      });

    if (memberErr) return { success: false, error: memberErr.message };

    return { success: true, data: account as CorporateAccount };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. addCorporateMember — Add a user to a corporate account
// ---------------------------------------------------------------------------

export async function addCorporateMember(
  corporateId: string,
  userId: string,
  role: 'admin' | 'manager' | 'member' = 'member',
): Promise<Result<CorporateMember>> {
  try {
    const { data, error } = await supabase
      .from('corporate_members')
      .insert({
        corporate_id: corporateId,
        user_id: userId,
        role,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'このユーザーは既にメンバーです' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CorporateMember };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. addCorporateVehicle — Link a vehicle to a corporate account
// ---------------------------------------------------------------------------

export async function addCorporateVehicle(
  corporateId: string,
  vehicleId: string,
  department?: string,
  assignedTo?: string,
): Promise<Result<CorporateVehicle>> {
  try {
    const { data, error } = await supabase
      .from('corporate_vehicles')
      .insert({
        corporate_id: corporateId,
        vehicle_id: vehicleId,
        department: department ?? null,
        assigned_to: assignedTo ?? null,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    // Recalculate and update the corporate discount based on vehicle count
    await recalculateDiscount(corporateId);

    return { success: true, data: data as CorporateVehicle };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getCorporateDiscount — Calculate discount tier from vehicle count
// ---------------------------------------------------------------------------

export function getCorporateDiscount(
  vehicleCount: number,
): Result<{ discountPercent: number; label: string | null }> {
  if (vehicleCount < CORPORATE.MIN_VEHICLES) {
    return {
      success: true,
      data: { discountPercent: 0, label: null },
    };
  }

  // Walk tiers in reverse to find the highest qualifying tier
  const sortedTiers = [...CORPORATE.DISCOUNT_TIERS].sort(
    (a, b) => b.minVehicles - a.minVehicles,
  );

  for (const tier of sortedTiers) {
    if (vehicleCount >= tier.minVehicles) {
      return {
        success: true,
        data: { discountPercent: tier.discount, label: tier.label },
      };
    }
  }

  return { success: true, data: { discountPercent: 0, label: null } };
}

// ---------------------------------------------------------------------------
// 5. getCorporateDashboard — Aggregated view of corporate account
// ---------------------------------------------------------------------------

export async function getCorporateDashboard(
  corporateId: string,
): Promise<Result<CorporateDashboard>> {
  try {
    // Fetch account info
    const { data: account, error: accountErr } = await supabase
      .from('corporate_accounts')
      .select('*')
      .eq('id', corporateId)
      .single();

    if (accountErr) return { success: false, error: accountErr.message };
    if (!account) return { success: false, error: '法人アカウントが見つかりません' };

    // Fetch member count
    const { count: memberCount, error: memberErr } = await supabase
      .from('corporate_members')
      .select('id', { count: 'exact', head: true })
      .eq('corporate_id', corporateId);

    if (memberErr) return { success: false, error: memberErr.message };

    // Fetch vehicle count
    const { count: vehicleCount, error: vehicleErr } = await supabase
      .from('corporate_vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('corporate_id', corporateId);

    if (vehicleErr) return { success: false, error: vehicleErr.message };

    // Fetch member user IDs for order aggregation
    const { data: members, error: membersErr } = await supabase
      .from('corporate_members')
      .select('user_id')
      .eq('corporate_id', corporateId);

    if (membersErr) return { success: false, error: membersErr.message };

    const memberUserIds = (members ?? []).map((m: any) => m.user_id);

    // Aggregate orders from all members
    let totalOrders = 0;
    let totalSpend = 0;

    if (memberUserIds.length > 0) {
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, amount')
        .in('customer_id', memberUserIds)
        .in('status', ['completed', 'auto_completed', 'closed']);

      if (ordersErr) return { success: false, error: ordersErr.message };

      totalOrders = orders?.length ?? 0;
      totalSpend = (orders ?? []).reduce((sum: number, o: any) => sum + (o.amount ?? 0), 0);
    }

    // Calculate current discount tier
    const discountResult = getCorporateDiscount(vehicleCount ?? 0);
    const currentDiscountPercent = discountResult.success
      ? discountResult.data!.discountPercent
      : account.discount_percent ?? 0;

    return {
      success: true,
      data: {
        account: account as CorporateAccount,
        memberCount: memberCount ?? 0,
        vehicleCount: vehicleCount ?? 0,
        totalOrders,
        totalSpend,
        currentDiscountPercent,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. approveCorporateAccount — Admin approves a pending account
// ---------------------------------------------------------------------------

export async function approveCorporateAccount(
  corporateId: string,
  adminId: string,
): Promise<Result<CorporateAccount>> {
  try {
    // Verify the caller is a platform admin
    const { data: adminProfile, error: adminErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminErr) return { success: false, error: adminErr.message };
    if (adminProfile?.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    // Verify current status is pending
    const { data: existing, error: fetchErr } = await supabase
      .from('corporate_accounts')
      .select('status')
      .eq('id', corporateId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (existing.status !== 'pending') {
      return {
        success: false,
        error: `ステータスが「${existing.status}」のため承認できません`,
      };
    }

    const { data, error } = await supabase
      .from('corporate_accounts')
      .update({ status: 'active' })
      .eq('id', corporateId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as CorporateAccount };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Helper — Recalculate discount and persist to corporate_accounts
// ---------------------------------------------------------------------------

async function recalculateDiscount(corporateId: string): Promise<void> {
  const { count } = await supabase
    .from('corporate_vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('corporate_id', corporateId);

  const discountResult = getCorporateDiscount(count ?? 0);
  const discountPercent = discountResult.success
    ? discountResult.data!.discountPercent
    : 0;

  await supabase
    .from('corporate_accounts')
    .update({ discount_percent: discountPercent })
    .eq('id', corporateId);
}
