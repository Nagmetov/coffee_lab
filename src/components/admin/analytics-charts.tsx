"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { LOYALTY_TIER_LABELS } from "@/lib/loyalty";
import type { AnalyticsStats } from "@/server/admin-stats-service";

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-tabular font-medium">
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

export function RevenueByCategoryChart({
  data,
}: {
  data: AnalyticsStats["revenueByCategory"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Выручка по категориям</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Пока нет данных
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                content={<ChartTooltip formatter={formatPrice} />}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function LoyaltyTierChart({
  data,
}: {
  data: AnalyticsStats["loyaltyTierDistribution"];
}) {
  const order = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const formatted = order
    .map((tier) => ({
      tier,
      label: LOYALTY_TIER_LABELS[tier as keyof typeof LOYALTY_TIER_LABELS],
      count: data.find((d) => d.tier === tier)?.count ?? 0,
    }))
    .filter((d) => d.count > 0 || data.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Клиенты по уровню лояльности</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {formatted.length === 0 ? (
          <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Пока нет данных
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatted} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
