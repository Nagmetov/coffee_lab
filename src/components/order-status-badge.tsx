import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/order-state-machine";
import type { OrderStatus } from "@prisma/client";

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: ORDER_STATUS_LABELS.PENDING,
    className: "bg-warning/15 text-warning border-warning/30",
  },
  PAID: {
    label: ORDER_STATUS_LABELS.PAID,
    className: "bg-primary/10 text-primary border-primary/30",
  },
  PREPARING: {
    label: ORDER_STATUS_LABELS.PREPARING,
    className: "bg-accent/20 text-accent-foreground border-accent/40",
  },
  READY: {
    label: ORDER_STATUS_LABELS.READY,
    className: "bg-success/15 text-success border-success/30",
  },
  COMPLETED: {
    label: ORDER_STATUS_LABELS.COMPLETED,
    className: "bg-muted text-muted-foreground border-border",
  },
  CANCELLED: {
    label: ORDER_STATUS_LABELS.CANCELLED,
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
