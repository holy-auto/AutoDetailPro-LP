import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SiteStats = {
  waitlist: number;
  pros: number;
  bookings: number;
  appInstalls: number;
  prefecturesActive: number;
  prefecturesPlanned: number;
  isPreLaunch: boolean;
  launchTarget: string;
  fetchedAt: string;
};

const DEFAULTS: SiteStats = {
  waitlist: 0,
  pros: 0,
  bookings: 0,
  appInstalls: 0,
  prefecturesActive: 0,
  prefecturesPlanned: 47,
  isPreLaunch: true,
  launchTarget: "2026年Q3",
  fetchedAt: new Date(0).toISOString(),
};

export const INSTALLS_DISPLAY_THRESHOLD = Number(
  process.env.STATS_INSTALLS_DISPLAY_MIN ?? 10000,
);

export function shouldDisplayInstalls(installs: number): boolean {
  return installs >= INSTALLS_DISPLAY_THRESHOLD;
}

const isPlaceholder = (url?: string) =>
  !url || url.includes("placeholder") || url.includes("your-project");

async function safeCount(
  supabase: SupabaseClient,
  table: string,
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return typeof count === "number" ? count : 0;
  } catch {
    return 0;
  }
}

export async function getSiteStats(): Promise<SiteStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || isPlaceholder(url)) {
    return DEFAULTS;
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
    const [waitlist, pros, bookings, appInstalls] = await Promise.all([
      safeCount(supabase, "waitlist"),
      safeCount(supabase, "pros"),
      safeCount(supabase, "bookings"),
      safeCount(supabase, "app_installs"),
    ]);

    return {
      ...DEFAULTS,
      waitlist,
      pros,
      bookings,
      appInstalls,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return DEFAULTS;
  }
}
