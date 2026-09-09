"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nextOrderStatuses } from "@/lib/order-state-machine";
import { OrderStatusBadge, STATUS_META } from "@/components/order-status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiJson, ApiError } from "@/lib/api-client";
import type { OrderStatus } from "@prisma/client";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const nextOptions = nextOrderStatuses(status);

  if (nextOptions.length === 0) {
    return <OrderStatusBadge status={status} />;
  }

  async function handleChange(value: string | null) {
    if (!value || value === status) return;
    setIsUpdating(true);
    try {
      await apiJson(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      toast.success("Статус обновлён");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Не удалось обновить статус",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-44">
        <SelectValue>
          {(value: unknown) => STATUS_META[value as OrderStatus]?.label ?? String(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={status}>{STATUS_META[status].label}</SelectItem>
        {nextOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_META[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
