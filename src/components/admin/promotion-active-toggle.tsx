"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { apiJson, ApiError } from "@/lib/api-client";

export function PromotionActiveToggle({
  promotionId,
  isActive,
}: {
  promotionId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(checked: boolean) {
    setPending(true);
    try {
      await apiJson(`/api/admin/promotions/${promotionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Не удалось обновить промокод",
      );
    } finally {
      setPending(false);
    }
  }

  return <Switch checked={isActive} onCheckedChange={handleChange} disabled={pending} />;
}
