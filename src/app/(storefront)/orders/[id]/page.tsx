import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrderForUser } from "@/server/order-service";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatDate, formatPrice } from "@/lib/format";
import { getLocale, getDictionary } from "@/i18n/dictionary";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE_STATUSES = ["PENDING", "PAID", "PREPARING", "READY", "COMPLETED"] as const;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const [order, locale] = await Promise.all([
    getOrderForUser(id, session.sub),
    getLocale(),
  ]);
  if (!order) notFound();
  const t = getDictionary(locale);

  const reachedStatuses = new Set(order.statusHistory.map((h) => h.toStatus));
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} label={t.orderStatus[order.status]} />
      </div>

      {!isCancelled && (
        <ol className="mb-8 flex items-center justify-between">
          {TIMELINE_STATUSES.map((status, i) => {
            const reached = reachedStatuses.has(status);
            return (
              <li key={status} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 text-xs font-medium",
                      reached
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {reached ? <Check className="size-3.5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "w-16 text-[11px]",
                      reached ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t.orderStatus[status]}
                  </span>
                </div>
                {i < TIMELINE_STATUSES.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1",
                      reached ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-border/70 space-y-4 rounded-lg border p-4">
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.productName} ({item.variantName}) × {item.quantity}
              </span>
              <span className="font-tabular">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-border/70 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.orderDetail.sum}</span>
            <span className="font-tabular">{formatPrice(order.subtotal.toString())}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="text-success flex justify-between">
              <span>
                {t.orderDetail.discount}
                {order.promotion ? ` (${order.promotion.code})` : ""}
              </span>
              <span className="font-tabular">
                −{formatPrice(order.discountAmount.toString())}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>{t.orderDetail.total}</span>
            <span className="font-tabular">
              {formatPrice(order.totalAmount.toString())}
            </span>
          </div>
        </div>
        {order.loyaltyPointsEarned > 0 && (
          <p className="text-muted-foreground text-sm">
            {t.orderDetail.loyaltyEarnedPrefix} {order.loyaltyPointsEarned}{" "}
            {t.orderDetail.loyaltyEarnedSuffix}
          </p>
        )}
        {order.fulfillmentType === "DELIVERY" && order.address && (
          <div className="border-border/70 border-t pt-3 text-sm">
            <p className="font-medium">{t.orderDetail.delivery}</p>
            <p className="text-muted-foreground">
              {order.address.line1}, {order.address.city}, {order.address.postalCode}
            </p>
          </div>
        )}
        {order.note && (
          <div className="border-border/70 border-t pt-3 text-sm">
            <p className="font-medium">{t.orderDetail.comment}</p>
            <p className="text-muted-foreground">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
