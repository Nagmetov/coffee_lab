import { getAnalyticsStats } from "@/server/admin-stats-service";
import { RevenueByCategoryChart, LoyaltyTierChart } from "@/components/admin/analytics-charts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Аналитика" };

export default async function AdminAnalyticsPage() {
  const stats = await getAnalyticsStats();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">Аналитика</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueByCategoryChart data={stats.revenueByCategory} />
        <LoyaltyTierChart data={stats.loyaltyTierDistribution} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-border rounded-lg border">
          <div className="border-border border-b px-4 py-3">
            <h3 className="font-medium">Лучшие клиенты</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead className="text-right">Заказов</TableHead>
                <TableHead className="text-right">Потрачено</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topCustomers.map((c) => (
                <TableRow key={c.email}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground text-xs">{c.email}</div>
                  </TableCell>
                  <TableCell className="font-tabular text-right">{c.orderCount}</TableCell>
                  <TableCell className="font-tabular text-right">
                    {formatPrice(c.totalSpent)}
                  </TableCell>
                </TableRow>
              ))}
              {stats.topCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                    Пока нет оплаченных заказов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-border rounded-lg border">
          <div className="border-border border-b px-4 py-3">
            <h3 className="font-medium">Промокоды</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead className="text-right">Использован</TableHead>
                <TableHead className="text-right">Скидка выдана</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.promotionUsage.map((p) => (
                <TableRow key={p.code}>
                  <TableCell>
                    <Badge variant="outline">{p.code}</Badge>
                  </TableCell>
                  <TableCell className="font-tabular text-right">
                    {p.usedCount}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ""}
                  </TableCell>
                  <TableCell className="font-tabular text-right">
                    {formatPrice(p.totalDiscount)}
                  </TableCell>
                </TableRow>
              ))}
              {stats.promotionUsage.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                    Промокодов пока нет
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
