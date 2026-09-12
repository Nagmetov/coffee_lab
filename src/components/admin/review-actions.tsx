"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { apiJson, ApiError } from "@/lib/api-client";

export function ReviewActions({
  reviewId,
  isHidden,
}: {
  reviewId: string;
  isHidden: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleVisibilityChange(checked: boolean) {
    setPending(true);
    try {
      await apiJson(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !checked }),
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось обновить отзыв");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    setPending(true);
    try {
      await apiJson(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      toast.success("Отзыв удалён");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось удалить отзыв");
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={!isHidden}
        onCheckedChange={handleVisibilityChange}
        disabled={pending}
        aria-label={isHidden ? "Показать отзыв" : "Скрыть отзыв"}
      />
      <Button
        size="icon"
        variant="ghost"
        aria-label="Удалить отзыв"
        disabled={pending}
        onClick={handleDelete}
      >
        <Trash2 className="text-destructive size-4" />
      </Button>
    </div>
  );
}
