import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const STATS_CACHE_KEY = "admin:dashboard-stats";
const STATS_CACHE_TTL_SECONDS = 60;

export type DashboardStats = {
  revenueToday: number;
  ordersToday: number;
  avgOrderValue: number;
  activeCustomers: number;
  revenueTrend: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; revenue: number }[];
};

const PAID_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"] as const;

export async function getDashboardStats(): Promise<DashboardStats> {
  const cached = await redis.get(STATS_CACHE_KEY).catch(() => null);
  if (cached) return JSON.parse(cached);

  const stats = await computeDashboardStats();
  await redis
    .set(STATS_CACHE_KEY, JSON.stringify(stats), "EX", STATS_CACHE_TTL_SECONDS)
    .catch(() => {});
  return stats;
}

export async function invalidateDashboardStatsCache() {
  await redis.del(STATS_CACHE_KEY).catch(() => {});
}

async function computeDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fourteenDaysAgo = new Date(startOfToday);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [todayAgg, ordersByStatusRaw, activeCustomers, recentOrders, orderItems] =
    await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfToday }, status: { in: [...PAID_STATUSES] } },
        _sum: { totalAmount: true },
        _count: true,
        _avg: { totalAmount: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.user.count({
        where: { orders: { some: { createdAt: { gte: fourteenDaysAgo } } } },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: fourteenDaysAgo },
          status: { in: [...PAID_STATUSES] },
        },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: { order: { status: { in: [...PAID_STATUSES] } } },
        _sum: { quantity: true, unitPrice: true },
      }),
    ]);

  const trendByDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    trendByDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    trendByDay.set(key, (trendByDay.get(key) ?? 0) + Number(order.totalAmount));
  }

  // Revenue per product isn't stored directly on OrderItem, so approximate
  // it as unitPrice (at time of sale) x total quantity sold — good enough
  // for a "top sellers" ranking without a separate materialized column.
  const productRevenue = new Map<string, number>();
  for (const item of orderItems) {
    productRevenue.set(
      item.productName,
      (productRevenue.get(item.productName) ?? 0) +
        Number(item._sum.unitPrice ?? 0) * (item._sum.quantity ?? 0),
    );
  }

  return {
    revenueToday: Number(todayAgg._sum.totalAmount ?? 0),
    ordersToday: todayAgg._count,
    avgOrderValue: Math.round(Number(todayAgg._avg.totalAmount ?? 0)),
    activeCustomers,
    revenueTrend: Array.from(trendByDay.entries()).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    })),
    ordersByStatus: ordersByStatusRaw.map((s) => ({ status: s.status, count: s._count })),
    topProducts: Array.from(productRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) })),
  };
}
