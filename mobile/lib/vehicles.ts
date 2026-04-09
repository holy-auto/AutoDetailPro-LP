import { supabase } from './supabase';
import { VEHICLE } from '@/constants/business-rules';

// =============================================
// 車両管理（Vehicle Management）
// =============================================
// CRUD for user vehicles, default vehicle toggling,
// and vehicle-size price multiplier lookup.

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type Vehicle = {
  id: string;
  owner_id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  license_plate: string | null;
  size: string;
  photo_url: string | null;
  is_default: boolean;
  created_at: string;
};

type VehicleInput = {
  name: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  size: string;
  photoUrl?: string;
};

// ---------------------------------------------------------------------------
// 1. addVehicle — Insert a new vehicle (max per user enforced)
// ---------------------------------------------------------------------------

export async function addVehicle(
  ownerId: string,
  data: VehicleInput,
): Promise<Result<Vehicle>> {
  try {
    // Validate vehicle size
    const validSize = VEHICLE.SIZES.find((s) => s.id === data.size);
    if (!validSize) {
      return {
        success: false,
        error: `無効な車両サイズです: "${data.size}"`,
      };
    }

    // Check current vehicle count
    const { count, error: countErr } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    if (countErr) return { success: false, error: countErr.message };

    if ((count ?? 0) >= VEHICLE.MAX_VEHICLES_PER_USER) {
      return {
        success: false,
        error: `車両は最大${VEHICLE.MAX_VEHICLES_PER_USER}台まで登録できます`,
      };
    }

    // If this is the first vehicle, set it as default
    const isFirst = (count ?? 0) === 0;

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        owner_id: ownerId,
        name: data.name,
        make: data.make ?? null,
        model: data.model ?? null,
        year: data.year ?? null,
        color: data.color ?? null,
        license_plate: data.licensePlate ?? null,
        size: data.size,
        photo_url: data.photoUrl ?? null,
        is_default: isFirst,
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: vehicle as Vehicle };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getMyVehicles — List vehicles for a user, default first
// ---------------------------------------------------------------------------

export async function getMyVehicles(
  ownerId: string,
): Promise<Result<Vehicle[]>> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data ?? []) as Vehicle[] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. updateVehicle — Update vehicle details
// ---------------------------------------------------------------------------

export async function updateVehicle(
  vehicleId: string,
  updates: Partial<VehicleInput>,
): Promise<Result<Vehicle>> {
  try {
    // Validate size if provided
    if (updates.size) {
      const validSize = VEHICLE.SIZES.find((s) => s.id === updates.size);
      if (!validSize) {
        return {
          success: false,
          error: `無効な車両サイズです: "${updates.size}"`,
        };
      }
    }

    // Map camelCase input to snake_case columns
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.make !== undefined) payload.make = updates.make;
    if (updates.model !== undefined) payload.model = updates.model;
    if (updates.year !== undefined) payload.year = updates.year;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.licensePlate !== undefined) payload.license_plate = updates.licensePlate;
    if (updates.size !== undefined) payload.size = updates.size;
    if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;

    const { data, error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', vehicleId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Vehicle };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. deleteVehicle — Remove a vehicle
// ---------------------------------------------------------------------------

export async function deleteVehicle(
  vehicleId: string,
): Promise<Result<{ vehicleId: string }>> {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) return { success: false, error: error.message };

    return { success: true, data: { vehicleId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. setDefaultVehicle — Mark one vehicle as default, unset the rest
// ---------------------------------------------------------------------------

export async function setDefaultVehicle(
  ownerId: string,
  vehicleId: string,
): Promise<Result<{ vehicleId: string }>> {
  try {
    // Verify the vehicle belongs to this owner
    const { data: vehicle, error: fetchErr } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('owner_id', ownerId)
      .single();

    if (fetchErr || !vehicle) {
      return { success: false, error: '車両が見つかりません' };
    }

    // Unset all defaults for this owner
    const { error: unsetErr } = await supabase
      .from('vehicles')
      .update({ is_default: false })
      .eq('owner_id', ownerId);

    if (unsetErr) return { success: false, error: unsetErr.message };

    // Set the chosen vehicle as default
    const { error: setErr } = await supabase
      .from('vehicles')
      .update({ is_default: true })
      .eq('id', vehicleId);

    if (setErr) return { success: false, error: setErr.message };

    return { success: true, data: { vehicleId } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getVehicleSizeMultiplier — Lookup price multiplier for a given size
// ---------------------------------------------------------------------------

export function getVehicleSizeMultiplier(
  size: string,
): Result<{ size: string; name: string; priceMultiplier: number }> {
  const entry = VEHICLE.SIZES.find((s) => s.id === size);

  if (!entry) {
    return {
      success: false,
      error: `無効な車両サイズです: "${size}"`,
    };
  }

  return {
    success: true,
    data: {
      size: entry.id,
      name: entry.name,
      priceMultiplier: entry.priceMultiplier,
    },
  };
}
