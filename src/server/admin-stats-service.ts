import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { Prisma } from "@prisma/client";

const STATS_CACHE_KEY = "admin:dashboard-stats";
const ANALYTICS_CACHE_KEY = "admin:analytics-stats";
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
  await redis.del(STATS_CACHE_KEY, ANALYTICS_CACHE_KEY).catch(() => {});
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

export type AnalyticsStats = {
  revenueByCategory: { category: string; revenue: number }[];
  loyaltyTierDistribution: { tier: string; count: number }[];
  topCustomers: { name: string; email: string; orderCount: number; totalSpent: number }[];
  promotionUsage: {
    code: string;
    usedCount: number;
    usageLimit: number | null;
    totalDiscount: number;
  }[];
};

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const cached = await redis.get(ANALYTICS_CACHE_KEY).catch(() => null);
  if (cached) return JSON.parse(cached);

  const stats = await computeAnalyticsStats();
  await redis
    .set(ANALYTICS_CACHE_KEY, JSON.stringify(stats), "EX", STATS_CACHE_TTL_SECONDS)
    .catch(() => {});
  return stats;
}

async function computeAnalyticsStats(): Promise<AnalyticsStats> {
  const [revenueByCategoryRaw, tierDistributionRaw, topOrdersByUser, promotions, discountSums] =
    await Promise.all([
      // Revenue-by-category needs a join across OrderItem -> ProductVariant
      // -> Product -> Category, deeper than Prisma's groupBy can express —
      // hence the raw query, same tradeoff as the full-text search.
      prisma.$queryRaw<Array<{ category: string; revenue: number }>>`
        SELECT c.name as category, SUM(oi."unitPrice" * oi.quantity) as revenue
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        JOIN "ProductVariant" pv ON pv.id = oi."productVariantId"
        JOIN "Product" p ON p.id = pv."productId"
        JOIN "Category" c ON c.id = p."categoryId"
        WHERE o.status::text IN (${Prisma.join(PAID_STATUSES)})
        GROUP BY c.name
        ORDER BY revenue DESC
      `,
      prisma.user.groupBy({ by: ["loyaltyTier"], _count: true }),
      prisma.order.groupBy({
        by: ["userId"],
        where: { status: { in: [...PAID_STATUSES] } },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 10,
      }),
      prisma.promotion.findMany({ orderBy: { usedCount: "desc" } }),
      prisma.order.groupBy({
        by: ["promotionId"],
        where: { promotionId: { not: null } },
        _sum: { discountAmount: true },
      }),
    ]);

  const customers = await prisma.user.findMany({
    where: { id: { in: topOrdersByUser.map((o) => o.userId) } },
    select: { id: true, name: true, email: true },
  });
  const customerById = new Map(customers.map((c) => [c.id, c]));

  const discountByPromotion = new Map(
    discountSums.map((d) => [d.promotionId, Number(d._sum.discountAmount ?? 0)]),
  );

  return {
    revenueByCategory: revenueByCategoryRaw.map((r) => ({
      category: r.category,
      revenue: Math.round(Number(r.revenue)),
    })),
    loyaltyTierDistribution: tierDistributionRaw.map((t) => ({
      tier: t.loyaltyTier,
      count: t._count,
    })),
    topCustomers: topOrdersByUser.map((o) => ({
      name: customerById.get(o.userId)?.name ?? "—",
      email: customerById.get(o.userId)?.email ?? "—",
      orderCount: o._count,
      totalSpent: Math.round(Number(o._sum.totalAmount ?? 0)),
    })),
    promotionUsage: promotions.map((p) => ({
      code: p.code,
      usedCount: p.usedCount,
      usageLimit: p.usageLimit,
      totalDiscount: Math.round(discountByPromotion.get(p.id) ?? 0),
    })),
  };
}
