import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SiteStats = {
  waitlist: number;
  pros: number;
  bookings: number;
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
  prefecturesActive: 0,
  prefecturesPlanned: 47,
  isPreLaunch: true,
  launchTarget: "2026年Q3",
  fetchedAt: new Date(0).toISOString(),
};

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
    const [waitlist, pros, bookings] = await Promise.all([
      safeCount(supabase, "waitlist"),
      safeCount(supabase, "pros"),
      safeCount(supabase, "bookings"),
    ]);

    return {
      ...DEFAULTS,
      waitlist,
      pros,
      bookings,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return DEFAULTS;
  }
}
