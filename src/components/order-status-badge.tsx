import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Ожидает оплаты",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  PAID: { label: "Оплачен", className: "bg-primary/10 text-primary border-primary/30" },
  PREPARING: {
    label: "Готовится",
    className: "bg-accent/20 text-accent-foreground border-accent/40",
  },
  READY: { label: "Готов", className: "bg-success/15 text-success border-success/30" },
  COMPLETED: {
    label: "Выполнен",
    className: "bg-muted text-muted-foreground border-border",
  },
  CANCELLED: {
    label: "Отменён",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={cn("border", meta.className)}>
      {meta.label}
    </Badge>
  );
}

export { STATUS_META };
