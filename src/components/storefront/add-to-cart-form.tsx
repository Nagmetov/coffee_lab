"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiJson, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/components/locale-provider";

type Variant = {
  id: string;
  name: string;
  priceModifier: string;
  stock: number;
};

export function AddToCartForm({
  basePrice,
  variants,
}: {
  basePrice: string;
  variants: Variant[];
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLocale();

  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const unitPrice = Number(basePrice) + Number(selected?.priceModifier ?? 0);
  const outOfStock = !selected || selected.stock <= 0;

  async function handleAdd() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await apiJson("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selected.id, quantity }),
      });
      toast.success(t.product.addedToast);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.product.addErrorToast);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVariantId(v.id)}
            disabled={v.stock <= 0}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              v.id === variantId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-tabular text-2xl font-semibold">
          {formatPrice(unitPrice)}
        </span>
        {outOfStock && (
          <span className="text-destructive text-sm">{t.product.outOfStock}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="border-border flex items-center rounded-lg border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.product.decreaseQty}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </Button>
          <span className="font-tabular w-8 text-center text-sm">{quantity}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.product.increaseQty}
            onClick={() => setQuantity((q) => Math.min(selected?.stock ?? 1, q + 1))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button
          className="flex-1"
          disabled={outOfStock || isSubmitting}
          onClick={handleAdd}
        >
          <ShoppingBag className="size-4" />
          {isSubmitting ? t.product.adding : t.product.addToCart}
        </Button>
      </div>
    </div>
  );
}
