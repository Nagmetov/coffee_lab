import { DollarSign, Receipt, TrendingUp, Users } from "lucide-react";
import { getDashboardStats } from "@/server/admin-stats-service";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  RevenueTrendChart,
  OrdersByStatusChart,
  TopProductsChart,
} from "@/components/admin/dashboard-charts";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">Дашборд</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Выручка сегодня"
          value={formatPrice(stats.revenueToday)}
          icon={DollarSign}
          accent="success"
          index={0}
        />
        <KpiCard
          label="Заказов сегодня"
          value={String(stats.ordersToday)}
          icon={Receipt}
          accent="info"
          index={1}
        />
        <KpiCard
          label="Средний чек"
          value={formatPrice(stats.avgOrderValue)}
          icon={TrendingUp}
          accent="warning"
          index={2}
        />
        <KpiCard
          label="Активные клиенты (14 дн.)"
          value={String(stats.activeCustomers)}
          icon={Users}
          index={3}
        />
      </div>

      <RevenueTrendChart data={stats.revenueTrend} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OrdersByStatusChart data={stats.ordersByStatus} />
        <TopProductsChart data={stats.topProducts} />
      </div>
    </div>
  );
}
