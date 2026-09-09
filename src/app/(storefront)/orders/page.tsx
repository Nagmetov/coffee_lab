import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listOrdersForUser } from "@/server/order-service";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatDate, formatPrice } from "@/lib/format";
import { PackageOpen } from "lucide-react";

export const metadata = { title: "Мои заказы" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/orders");

  const orders = await listOrdersForUser(session.sub);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
          <PackageOpen className="size-10" aria-hidden />
          <p>Заказов пока нет</p>
          <Link href="/menu" className="text-foreground font-medium hover:underline">
            Перейти в меню
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="border-border/70 hover:bg-muted/40 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(order.createdAt)} · {order.items.length}{" "}
                    {order.items.length === 1 ? "товар" : "товара"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-tabular font-medium">
                    {formatPrice(order.totalAmount.toString())}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
