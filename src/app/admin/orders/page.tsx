import Link from "next/link";
import { adminListOrders } from "@/server/order-service";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

const STATUS_TABS: { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined, label: "Все" },
  { value: "PENDING", label: "Ожидают оплаты" },
  { value: "PAID", label: "Оплачены" },
  { value: "PREPARING", label: "Готовятся" },
  { value: "READY", label: "Готовы" },
  { value: "COMPLETED", label: "Выполнены" },
  { value: "CANCELLED", label: "Отменены" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const status = STATUS_TABS.find((t) => t.value === params.status)?.value;
  const orders = await adminListOrders({ status, search: params.search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Заказы</h2>
        <form>
          {status && <input type="hidden" name="status" value={status} />}
          <Input
            name="search"
            placeholder="Поиск по номеру или клиенту…"
            defaultValue={params.search}
            className="w-64"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
            className={`rounded-full border px-3 py-1 text-sm ${
              status === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заказ</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div>{order.user.name}</div>
                  <div className="text-muted-foreground text-xs">{order.user.email}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="font-tabular">
                  {formatPrice(order.totalAmount.toString())}
                </TableCell>
                <TableCell>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  Заказов не найдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
