"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { apiJson, ApiError } from "@/lib/api-client";

export function ProductActiveToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(checked: boolean) {
    setPending(true);
    try {
      await apiJson(`/api/admin/products/${productId}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Не удалось обновить товар",
      );
    } finally {
      setPending(false);
    }
  }

  return <Switch checked={isActive} onCheckedChange={handleChange} disabled={pending} />;
}
