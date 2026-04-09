import { supabase } from './supabase';
import { SKILL_BADGES, ORDER_STATUS } from '@/constants/business-rules';

// =============================================
// Pro Revenue Analytics
// =============================================
// Revenue tracking, popular menus, repeat customers,
// performance metrics, month-over-month comparison,
// and skill badge progress for pro dashboards.

// --- Result type ---

type Result<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- Types ---

type DailyRevenue = {
  date: string;
  revenue: number;
  orderCount: number;
};

type MonthlyRevenue = {
  date: string; // YYYY-MM
  revenue: number;
  orderCount: number;
};

type PopularMenu = {
  menuName: string;
  categoryId: string;
  orderCount: number;
  revenue: number;
};

type PerformanceMetrics = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageRating: number;
  completionRate: number;
  responseRate: number;
  repeatRate: number;
  averageWorkTime: number; // minutes
};

type RevenueComparison = {
  currentMonth: { revenue: number; orderCount: number };
  lastMonth: { revenue: number; orderCount: number };
  revenueChangePercent: number;
  orderCountChangePercent: number;
};

type BadgeProgress = {
  badgeId: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  progress: number; // 0-100
  requirement: string;
};

// --- Completed statuses (orders that count as revenue) ---

const COMPLETED_STATUSES = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.AUTO_COMPLETED,
  ORDER_STATUS.REVIEW_OPEN,
  ORDER_STATUS.CLOSED,
];

// ---------------------------------------------------------------------------
// 1. getDailyRevenue — Revenue grouped by day for last N days
// ---------------------------------------------------------------------------

export async function getDailyRevenue(
  proId: string,
  days: number = 30,
): Promise<Result<DailyRevenue[]>> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabase
      .from('orders')
      .select('amount, completed_at')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES)
      .gte('completed_at', sinceDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    const orders = data ?? [];

    // Group by date string (YYYY-MM-DD)
    const grouped: Record<string, { revenue: number; orderCount: number }> = {};

    for (const order of orders) {
      const dateStr = order.completed_at
        ? order.completed_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      if (!grouped[dateStr]) {
        grouped[dateStr] = { revenue: 0, orderCount: 0 };
      }
      grouped[dateStr].revenue += order.amount;
      grouped[dateStr].orderCount += 1;
    }

    // Fill in missing days with zero values
    const result: DailyRevenue[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        revenue: grouped[dateStr]?.revenue ?? 0,
        orderCount: grouped[dateStr]?.orderCount ?? 0,
      });
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2. getMonthlyRevenue — Monthly aggregation for last N months
// ---------------------------------------------------------------------------

export async function getMonthlyRevenue(
  proId: string,
  months: number = 12,
): Promise<Result<MonthlyRevenue[]>> {
  try {
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - months);
    sinceDate.setDate(1);
    sinceDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('amount, completed_at')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES)
      .gte('completed_at', sinceDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    const orders = data ?? [];

    // Group by month (YYYY-MM)
    const grouped: Record<string, { revenue: number; orderCount: number }> = {};

    for (const order of orders) {
      const monthStr = order.completed_at
        ? order.completed_at.slice(0, 7)
        : new Date().toISOString().slice(0, 7);

      if (!grouped[monthStr]) {
        grouped[monthStr] = { revenue: 0, orderCount: 0 };
      }
      grouped[monthStr].revenue += order.amount;
      grouped[monthStr].orderCount += 1;
    }

    // Fill in missing months
    const result: MonthlyRevenue[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (months - 1 - i));
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        date: monthStr,
        revenue: grouped[monthStr]?.revenue ?? 0,
        orderCount: grouped[monthStr]?.orderCount ?? 0,
      });
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3. getPopularMenus — Top menus by order count
// ---------------------------------------------------------------------------

export async function getPopularMenus(
  proId: string,
  limit: number = 10,
): Promise<Result<PopularMenu[]>> {
  try {
    // Fetch completed orders for the pro, joining with the menu
    const { data, error } = await supabase
      .from('orders')
      .select('amount, menu_id, menus(name, category_id)')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES)
      .not('menu_id', 'is', null);

    if (error) return { success: false, error: error.message };

    const orders = data ?? [];

    // Aggregate by menu_id
    const menuMap: Record<
      string,
      { menuName: string; categoryId: string; orderCount: number; revenue: number }
    > = {};

    for (const order of orders) {
      const menuId = order.menu_id as string;
      const menu = order.menus as any;
      if (!menuId || !menu) continue;

      if (!menuMap[menuId]) {
        menuMap[menuId] = {
          menuName: menu.name ?? 'Unknown',
          categoryId: menu.category_id ?? '',
          orderCount: 0,
          revenue: 0,
        };
      }
      menuMap[menuId].orderCount += 1;
      menuMap[menuId].revenue += order.amount;
    }

    // Sort by order count descending, then take top N
    const sorted = Object.values(menuMap)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, limit);

    return { success: true, data: sorted };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4. getRepeatCustomerRate — (customers with 2+ orders / total unique) * 100
// ---------------------------------------------------------------------------

export async function getRepeatCustomerRate(
  proId: string,
): Promise<Result<{ repeatRate: number; repeatCustomers: number; totalCustomers: number }>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES);

    if (error) return { success: false, error: error.message };

    const orders = data ?? [];

    // Count orders per customer
    const customerCounts: Record<string, number> = {};
    for (const order of orders) {
      const cid = order.customer_id as string;
      customerCounts[cid] = (customerCounts[cid] ?? 0) + 1;
    }

    const totalCustomers = Object.keys(customerCounts).length;
    const repeatCustomers = Object.values(customerCounts).filter((c) => c >= 2).length;
    const repeatRate = totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 10000) / 100
      : 0;

    return { success: true, data: { repeatRate, repeatCustomers, totalCustomers } };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5. getPerformanceMetrics — Aggregated dashboard metrics
// ---------------------------------------------------------------------------

export async function getPerformanceMetrics(
  proId: string,
): Promise<Result<PerformanceMetrics>> {
  try {
    // Fetch completed orders
    const { data: completedOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('amount, started_at, completed_at')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES);

    if (ordersErr) return { success: false, error: ordersErr.message };

    const orders = completedOrders ?? [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const averageOrderValue = totalOrders > 0
      ? Math.round(totalRevenue / totalOrders)
      : 0;

    // Average work time in minutes (started_at → completed_at)
    let totalWorkMinutes = 0;
    let workTimeCount = 0;
    for (const o of orders) {
      if (o.started_at && o.completed_at) {
        const start = new Date(o.started_at).getTime();
        const end = new Date(o.completed_at).getTime();
        const minutes = (end - start) / 60000;
        if (minutes > 0 && minutes < 1440) {
          // Ignore unreasonable values (> 24h)
          totalWorkMinutes += minutes;
          workTimeCount += 1;
        }
      }
    }
    const averageWorkTime = workTimeCount > 0
      ? Math.round(totalWorkMinutes / workTimeCount)
      : 0;

    // Average rating
    const { data: reviews, error: reviewsErr } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', proId);

    if (reviewsErr) return { success: false, error: reviewsErr.message };

    const ratings = reviews ?? [];
    const averageRating = ratings.length > 0
      ? Math.round(
          (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 100,
        ) / 100
      : 0;

    // Completion rate and response rate from pro_profiles
    const { data: proProfile, error: profileErr } = await supabase
      .from('pro_profiles')
      .select('completion_rate, response_rate')
      .eq('id', proId)
      .single();

    if (profileErr) return { success: false, error: profileErr.message };

    const completionRate = Math.round((proProfile?.completion_rate ?? 1) * 10000) / 100;
    const responseRate = Math.round((proProfile?.response_rate ?? 1) * 10000) / 100;

    // Repeat rate
    const repeatResult = await getRepeatCustomerRate(proId);
    const repeatRate = repeatResult.success ? (repeatResult.data?.repeatRate ?? 0) : 0;

    return {
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        averageRating,
        completionRate,
        responseRate,
        repeatRate,
        averageWorkTime,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6. getRevenueComparison — This month vs last month
// ---------------------------------------------------------------------------

export async function getRevenueComparison(
  proId: string,
): Promise<Result<RevenueComparison>> {
  try {
    const now = new Date();

    // Current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Last month boundaries
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch current month orders
    const { data: currentData, error: currentErr } = await supabase
      .from('orders')
      .select('amount')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES)
      .gte('completed_at', currentMonthStart.toISOString())
      .lt('completed_at', currentMonthEnd.toISOString());

    if (currentErr) return { success: false, error: currentErr.message };

    // Fetch last month orders
    const { data: lastData, error: lastErr } = await supabase
      .from('orders')
      .select('amount')
      .eq('pro_id', proId)
      .in('status', COMPLETED_STATUSES)
      .gte('completed_at', lastMonthStart.toISOString())
      .lt('completed_at', lastMonthEnd.toISOString());

    if (lastErr) return { success: false, error: lastErr.message };

    const currentOrders = currentData ?? [];
    const lastOrders = lastData ?? [];

    const currentMonth = {
      revenue: currentOrders.reduce((sum, o) => sum + o.amount, 0),
      orderCount: currentOrders.length,
    };

    const lastMonth = {
      revenue: lastOrders.reduce((sum, o) => sum + o.amount, 0),
      orderCount: lastOrders.length,
    };

    const revenueChangePercent = lastMonth.revenue > 0
      ? Math.round(((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 10000) / 100
      : currentMonth.revenue > 0
        ? 100
        : 0;

    const orderCountChangePercent = lastMonth.orderCount > 0
      ? Math.round(((currentMonth.orderCount - lastMonth.orderCount) / lastMonth.orderCount) * 10000) / 100
      : currentMonth.orderCount > 0
        ? 100
        : 0;

    return {
      success: true,
      data: {
        currentMonth,
        lastMonth,
        revenueChangePercent,
        orderCountChangePercent,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7. getBadgeProgress — Progress toward each SKILL_BADGES.BADGES
// ---------------------------------------------------------------------------

export async function getBadgeProgress(
  proId: string,
): Promise<Result<BadgeProgress[]>> {
  try {
    // Fetch all data we need in parallel
    const [ordersRes, reviewsRes, profileRes] = await Promise.all([
      supabase
        .from('orders')
        .select('amount, category_id, customer_id, started_at, completed_at, accepted_at')
        .eq('pro_id', proId)
        .in('status', COMPLETED_STATUSES),
      supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('target_id', proId)
        .order('created_at', { ascending: false }),
      supabase
        .from('pro_profiles')
        .select('completion_rate, response_rate')
        .eq('id', proId)
        .single(),
    ]);

    if (ordersRes.error) return { success: false, error: ordersRes.error.message };
    if (reviewsRes.error) return { success: false, error: reviewsRes.error.message };
    if (profileRes.error) return { success: false, error: profileRes.error.message };

    const orders = ordersRes.data ?? [];
    const reviews = reviewsRes.data ?? [];
    const totalOrders = orders.length;

    // Pre-compute badge-specific data
    // coating_master: coating orders count (category_id = 'coating')
    const coatingOrders = orders.filter((o) => o.category_id === 'coating').length;

    // speed_pro: average work time percentile (we compare to a threshold; top 10%)
    // We calculate average work time and use a heuristic: < 45 min = earned
    let totalWorkMinutes = 0;
    let workTimeCount = 0;
    for (const o of orders) {
      if (o.started_at && o.completed_at) {
        const minutes =
          (new Date(o.completed_at).getTime() - new Date(o.started_at).getTime()) / 60000;
        if (minutes > 0 && minutes < 1440) {
          totalWorkMinutes += minutes;
          workTimeCount += 1;
        }
      }
    }
    const avgWorkTime = workTimeCount > 0 ? totalWorkMinutes / workTimeCount : 999;

    // five_star: average rating of last 50 reviews
    const last50Reviews = reviews.slice(0, 50);
    const last50Avg =
      last50Reviews.length > 0
        ? last50Reviews.reduce((sum, r) => sum + r.rating, 0) / last50Reviews.length
        : 0;

    // repeat_magnet: repeat customer rate
    const customerCounts: Record<string, number> = {};
    for (const o of orders) {
      const cid = o.customer_id as string;
      customerCounts[cid] = (customerCounts[cid] ?? 0) + 1;
    }
    const totalCustomers = Object.keys(customerCounts).length;
    const repeatCustomers = Object.values(customerCounts).filter((c) => c >= 2).length;
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // early_bird: orders accepted before 9:00 AM
    const earlyBirdOrders = orders.filter((o) => {
      if (!o.accepted_at) return false;
      const hour = new Date(o.accepted_at).getHours();
      return hour < 9;
    }).length;

    // veteran: total completed orders
    // (just totalOrders)

    // Build badge progress
    const badges = SKILL_BADGES.BADGES;
    const result: BadgeProgress[] = badges.map((badge) => {
      let progress = 0;
      let earned = false;

      switch (badge.id) {
        case 'coating_master': {
          // Requirement: 50+ coating orders
          const target = 50;
          progress = Math.min(100, Math.round((coatingOrders / target) * 100));
          earned = coatingOrders >= target;
          break;
        }
        case 'speed_pro': {
          // Requirement: average work time in top 10%
          // Heuristic: avg work time <= 45 min with at least 20 orders
          const TARGET_MINUTES = 45;
          const MIN_ORDERS = 20;
          if (workTimeCount >= MIN_ORDERS) {
            if (avgWorkTime <= TARGET_MINUTES) {
              progress = 100;
              earned = true;
            } else {
              // Show how close they are (lower is better)
              progress = Math.min(99, Math.round((TARGET_MINUTES / avgWorkTime) * 100));
            }
          } else {
            // Not enough orders yet — show order progress toward minimum
            progress = Math.min(50, Math.round((workTimeCount / MIN_ORDERS) * 50));
          }
          break;
        }
        case 'five_star': {
          // Requirement: last 50 reviews avg >= 4.8
          const TARGET_RATING = 4.8;
          const MIN_REVIEWS = 50;
          if (last50Reviews.length >= MIN_REVIEWS && last50Avg >= TARGET_RATING) {
            progress = 100;
            earned = true;
          } else if (last50Reviews.length < MIN_REVIEWS) {
            // Progress based on review count toward 50
            progress = Math.min(50, Math.round((last50Reviews.length / MIN_REVIEWS) * 50));
          } else {
            // Have 50+ reviews but rating not high enough
            // Scale: 4.0 → 0%, 4.8 → 100%
            const ratingProgress = Math.max(0, (last50Avg - 4.0) / (TARGET_RATING - 4.0));
            progress = Math.min(99, Math.round(50 + ratingProgress * 50));
          }
          break;
        }
        case 'repeat_magnet': {
          // Requirement: repeat rate >= 60%
          const TARGET_RATE = 60;
          progress = Math.min(100, Math.round((repeatRate / TARGET_RATE) * 100));
          earned = repeatRate >= TARGET_RATE;
          break;
        }
        case 'early_bird': {
          // Requirement: 100+ early morning orders
          const target = 100;
          progress = Math.min(100, Math.round((earlyBirdOrders / target) * 100));
          earned = earlyBirdOrders >= target;
          break;
        }
        case 'veteran': {
          // Requirement: 500+ total completed orders
          const target = 500;
          progress = Math.min(100, Math.round((totalOrders / target) * 100));
          earned = totalOrders >= target;
          break;
        }
        default:
          break;
      }

      return {
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        color: badge.color,
        earned,
        progress,
        requirement: badge.requirement,
      };
    });

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
