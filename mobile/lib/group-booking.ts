import { supabase } from './supabase';
import { GROUP_BOOKING } from '@/constants/business-rules';

// =============================================
// Group Booking (グループ予約) — Neighbors / Parking Lots
// =============================================
// Lifecycle: create (collecting) → participants join → confirm → individual orders.
// Discount tiers based on participant (vehicle) count.
// Uses: group_bookings, group_booking_entries tables.

// --- Result type ---

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- Types ---

type GroupBooking = {
  id: string;
  organizer_id: string;
  name: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  location_address: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  discount_percent: number;
  status: string;
  created_at: string;
};

type GroupEntry = {
  id: string;
  group_id: string;
  customer_id: string;
  vehicle_id: string | null;
  menu_id: string;
  amount: number;
  order_id: string | null;
  status: string;
  created_at: string;
};

type GroupDetails = {
  group: GroupBooking;
  entries: (GroupEntry & { customer_name: string | null })[];
  totalVehicles: number;
  discountPercent: number;
};

// ---------------------------------------------------------------------------
// 1. createGroupBooking — Organizer starts a group booking
// ---------------------------------------------------------------------------

export async function createGroupBooking(
  organizerId: string,
  data: {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    scheduledDate?: string;
    scheduledTime?: string;
  },
): Promise<Result<GroupBooking>> {
  try {
    const { data: group, error } = await supabase
      .from('group_bookings')
      .insert({
        organizer_id: organizerId,
        name: data.name,
        location_latitude: data.latitude,
        location_longitude: data.longitude,
        location_address: data.address,
        scheduled_date: data.scheduledDate ?? null,
        scheduled_time: data.scheduledTime ?? null,
        discount_percent: 0,
        status: 'collecting',
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: group as GroupBooking };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. joinGroup — Customer joins a group booking
// ---------------------------------------------------------------------------

export async function joinGroup(
  groupId: string,
  customerId: string,
  data: { vehicleId?: string; menuId: string; amount: number },
): Promise<Result<GroupEntry>> {
  try {
    // Verify the group exists and is still collecting
    const { data: group, error: groupErr } = await supabase
      .from('group_bookings')
      .select('status')
      .eq('id', groupId)
      .single();

    if (groupErr) return { success: false, error: groupErr.message };
    if (group.status !== 'collecting') {
      return { success: false, error: 'このグループは現在参加を受け付けていません' };
    }

    // Check current participant count against MAX_VEHICLES
    const { count: currentCount, error: countErr } = await supabase
      .from('group_booking_entries')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (countErr) return { success: false, error: countErr.message };

    if ((currentCount ?? 0) >= GROUP_BOOKING.MAX_VEHICLES) {
      return {
        success: false,
        error: `グループの上限（${GROUP_BOOKING.MAX_VEHICLES}台）に達しています`,
      };
    }

    // Insert the entry
    const { data: entry, error: insertErr } = await supabase
      .from('group_booking_entries')
      .insert({
        group_id: groupId,
        customer_id: customerId,
        vehicle_id: data.vehicleId ?? null,
        menu_id: data.menuId,
        amount: data.amount,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertErr) return { success: false, error: insertErr.message };

    // Recalculate discount for the group (new count = currentCount + 1)
    const newCount = (currentCount ?? 0) + 1;
    await updateGroupDiscount(groupId, newCount);

    return { success: true, data: entry as GroupEntry };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. leaveGroup — Customer leaves a group booking
// ---------------------------------------------------------------------------

export async function leaveGroup(
  groupId: string,
  customerId: string,
): Promise<Result<{ removed: boolean }>> {
  try {
    // Verify the group is still collecting
    const { data: group, error: groupErr } = await supabase
      .from('group_bookings')
      .select('status')
      .eq('id', groupId)
      .single();

    if (groupErr) return { success: false, error: groupErr.message };
    if (group.status !== 'collecting') {
      return { success: false, error: '確定済みのグループからは離脱できません' };
    }

    // Delete the entry
    const { error: deleteErr } = await supabase
      .from('group_booking_entries')
      .delete()
      .eq('group_id', groupId)
      .eq('customer_id', customerId);

    if (deleteErr) return { success: false, error: deleteErr.message };

    // Recalculate discount for remaining participants
    const { count: remaining, error: countErr } = await supabase
      .from('group_booking_entries')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (countErr) return { success: false, error: countErr.message };

    await updateGroupDiscount(groupId, remaining ?? 0);

    return { success: true, data: { removed: true } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. confirmGroup — Organizer confirms; create individual orders
// ---------------------------------------------------------------------------

export async function confirmGroup(
  groupId: string,
): Promise<Result<{ ordersCreated: number }>> {
  try {
    // Verify the group is still collecting
    const { data: group, error: groupErr } = await supabase
      .from('group_bookings')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupErr) return { success: false, error: groupErr.message };
    if (group.status !== 'collecting') {
      return { success: false, error: 'このグループは既に確定済みか、キャンセルされています' };
    }

    // Fetch all entries
    const { data: entries, error: entriesErr } = await supabase
      .from('group_booking_entries')
      .select('*')
      .eq('group_id', groupId);

    if (entriesErr) return { success: false, error: entriesErr.message };
    if (!entries || entries.length === 0) {
      return { success: false, error: '参加者がいません' };
    }

    // Minimum vehicle check
    if (entries.length < GROUP_BOOKING.MIN_VEHICLES) {
      return {
        success: false,
        error: `最低${GROUP_BOOKING.MIN_VEHICLES}台以上の参加が必要です`,
      };
    }

    // Calculate discount for the final count
    const discountResult = getGroupDiscount(entries.length);
    const discountPercent = discountResult.success
      ? discountResult.data!.discountPercent
      : 0;

    // Create individual orders for each entry
    let ordersCreated = 0;

    for (const entry of entries) {
      const discountedAmount = Math.round(
        entry.amount * (1 - discountPercent / 100),
      );

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: entry.customer_id,
          menu_id: entry.menu_id,
          amount: discountedAmount,
          status: 'payment_authorized',
          payment_method: 'online',
          customer_latitude: group.location_latitude,
          customer_longitude: group.location_longitude,
          location_address: group.location_address,
          group_booking_id: groupId,
        })
        .select('id')
        .single();

      if (orderErr) continue;

      // Link the order back to the entry
      await supabase
        .from('group_booking_entries')
        .update({ order_id: order.id, status: 'confirmed' })
        .eq('id', entry.id);

      ordersCreated++;
    }

    // Update group status to confirmed
    const { error: updateErr } = await supabase
      .from('group_bookings')
      .update({
        status: 'confirmed',
        discount_percent: discountPercent,
      })
      .eq('id', groupId);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true, data: { ordersCreated } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. getGroupDetails — Full info about a group booking
// ---------------------------------------------------------------------------

export async function getGroupDetails(
  groupId: string,
): Promise<Result<GroupDetails>> {
  try {
    // Fetch group
    const { data: group, error: groupErr } = await supabase
      .from('group_bookings')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupErr) return { success: false, error: groupErr.message };
    if (!group) return { success: false, error: 'グループが見つかりません' };

    // Fetch entries with customer names
    const { data: entries, error: entriesErr } = await supabase
      .from('group_booking_entries')
      .select(`
        id, group_id, customer_id, vehicle_id, menu_id, amount, order_id, status, created_at,
        profiles!group_booking_entries_customer_id_fkey(full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (entriesErr) return { success: false, error: entriesErr.message };

    const enrichedEntries = (entries ?? []).map((row: any) => ({
      id: row.id,
      group_id: row.group_id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      menu_id: row.menu_id,
      amount: row.amount,
      order_id: row.order_id,
      status: row.status,
      created_at: row.created_at,
      customer_name: row.profiles?.full_name ?? null,
    }));

    const totalVehicles = enrichedEntries.length;
    const discountResult = getGroupDiscount(totalVehicles);
    const discountPercent = discountResult.success
      ? discountResult.data!.discountPercent
      : 0;

    return {
      success: true,
      data: {
        group: group as GroupBooking,
        entries: enrichedEntries,
        totalVehicles,
        discountPercent,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getActiveGroups — Find nearby groups accepting participants
// ---------------------------------------------------------------------------

export async function getActiveGroups(
  lat: number,
  lng: number,
  radiusKm: number = 5,
): Promise<Result<(GroupBooking & { participantCount: number; distance: number })[]>> {
  try {
    // Fetch all groups that are still collecting
    const { data: groups, error } = await supabase
      .from('group_bookings')
      .select('*')
      .eq('status', 'collecting');

    if (error) return { success: false, error: error.message };
    if (!groups || groups.length === 0) {
      return { success: true, data: [] };
    }

    // Filter by distance (Haversine)
    const nearbyGroups: (GroupBooking & { participantCount: number; distance: number })[] = [];

    for (const group of groups) {
      if (group.location_latitude == null || group.location_longitude == null) continue;

      const distance = haversineKm(
        lat,
        lng,
        group.location_latitude,
        group.location_longitude,
      );

      if (distance <= radiusKm) {
        // Get participant count for this group
        const { count } = await supabase
          .from('group_booking_entries')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', group.id);

        const participantCount = count ?? 0;

        // Only show groups that haven't reached the limit
        if (participantCount < GROUP_BOOKING.MAX_VEHICLES) {
          nearbyGroups.push({
            ...(group as GroupBooking),
            participantCount,
            distance: Math.round(distance * 100) / 100,
          });
        }
      }
    }

    // Sort by distance (nearest first)
    nearbyGroups.sort((a, b) => a.distance - b.distance);

    return { success: true, data: nearbyGroups };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7. getGroupDiscount — Calculate discount from vehicle count
// ---------------------------------------------------------------------------

export function getGroupDiscount(
  vehicleCount: number,
): Result<{ discountPercent: number; label: string | null }> {
  if (vehicleCount < GROUP_BOOKING.MIN_VEHICLES) {
    return { success: true, data: { discountPercent: 0, label: null } };
  }

  // Walk tiers in reverse to find the highest qualifying tier
  const sortedTiers = [...GROUP_BOOKING.DISCOUNTS].sort(
    (a, b) => b.minCount - a.minCount,
  );

  for (const tier of sortedTiers) {
    if (vehicleCount >= tier.minCount) {
      return {
        success: true,
        data: { discountPercent: tier.discount, label: tier.label },
      };
    }
  }

  return { success: true, data: { discountPercent: 0, label: null } };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Update the group's discount_percent based on current participant count. */
async function updateGroupDiscount(
  groupId: string,
  vehicleCount: number,
): Promise<void> {
  const discountResult = getGroupDiscount(vehicleCount);
  const discountPercent = discountResult.success
    ? discountResult.data!.discountPercent
    : 0;

  await supabase
    .from('group_bookings')
    .update({ discount_percent: discountPercent })
    .eq('id', groupId);
}

/** Haversine distance between two lat/lng points in kilometers. */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
