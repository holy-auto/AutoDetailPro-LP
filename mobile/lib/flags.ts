import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// =============================================
// Feature Flags
// =============================================
// Read-through cache of the `feature_flags` table. Flags are loaded
// on first use and cached for the app session. Call `invalidateFlagCache()`
// after an admin edits a flag to refresh immediately.
//
// Rollout is deterministic per-user: `hash(key, userId) % 100 < rolloutPercent`.
// The same user gets the same bucket across sessions.

type FlagState = {
  enabled: boolean;
  rolloutPercent: number;
  targetRoles: string[];
};

const cache = new Map<string, FlagState>();
let loaded = false;
let loadPromise: Promise<void> | null = null;

async function loadFlags(): Promise<void> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, enabled, rollout_percent, target_roles');

  if (error || !data) {
    loaded = true; // Don't retry forever on permission error
    return;
  }

  cache.clear();
  for (const row of data) {
    cache.set(row.key, {
      enabled: !!row.enabled,
      rolloutPercent: row.rollout_percent ?? 0,
      targetRoles: row.target_roles ?? [],
    });
  }
  loaded = true;
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  if (!loadPromise) loadPromise = loadFlags();
  await loadPromise;
}

/** Simple stable hash so rollout buckets are deterministic per user. */
function hashToBucket(key: string, userId: string): number {
  const s = `${key}:${userId}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

/**
 * Resolve a single flag. Returns `false` if the flag is not defined.
 */
export async function isFlagEnabled(
  key: string,
  userId?: string,
  role?: string,
): Promise<boolean> {
  await ensureLoaded();
  const flag = cache.get(key);
  if (!flag || !flag.enabled) return false;

  if (flag.targetRoles.length > 0) {
    if (!role || !flag.targetRoles.includes(role)) return false;
  }

  if (flag.rolloutPercent >= 100) return true;
  if (flag.rolloutPercent <= 0) return false;

  // Without a stable userId, fall back to coin flip at 50 — keeps behavior
  // predictable for guests without biasing either way.
  if (!userId) return flag.rolloutPercent >= 50;

  return hashToBucket(key, userId) < flag.rolloutPercent;
}

/** React hook wrapper around `isFlagEnabled`. Returns `false` while loading. */
export function useFlag(key: string, userId?: string, role?: string): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    isFlagEnabled(key, userId, role).then((v) => {
      if (!cancelled) setEnabled(v);
    });
    return () => {
      cancelled = true;
    };
  }, [key, userId, role]);
  return enabled;
}

/** Force a reload of the flag cache on next access. */
export function invalidateFlagCache(): void {
  cache.clear();
  loaded = false;
  loadPromise = null;
}
