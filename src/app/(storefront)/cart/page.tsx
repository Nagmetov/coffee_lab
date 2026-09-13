"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, useUpdateCartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumb } from "@/components/storefront/product-thumb";
import { formatPrice } from "@/lib/format";
import { apiJson, ApiError } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const { t } = useLocale();
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    code: string;
    discountAmount: number;
    totalAmount: number;
  } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    try {
      const result = await apiJson<{
        code: string;
        discountAmount: number;
        totalAmount: number;
      }>("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      setPromoResult(result);
      toast.success(t.cart.promoAppliedToast);
    } catch (error) {
      setPromoResult(null);
      toast.error(error instanceof ApiError ? error.message : t.cart.promoInvalidToast);
    } finally {
      setIsApplyingPromo(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground size-10" aria-hidden />
        <h1 className="font-heading text-2xl font-semibold">{t.cart.empty}</h1>
        <p className="text-muted-foreground">{t.cart.emptyHint}</p>
        <Button render={<Link href="/menu" />} nativeButton={false}>
          {t.cart.goToMenu}
        </Button>
      </div>
    );
  }

  const total = promoResult ? promoResult.totalAmount : cart.subtotal;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">{t.cart.title}</h1>

      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li
            key={item.variantId}
            className="border-border/70 flex items-center gap-4 rounded-lg border p-3"
          >
            <ProductThumb
              categorySlug={item.categorySlug}
              seed={item.productSlug}
              className="size-16 shrink-0"
            />
            <div className="flex-1">
              <Link
                href={`/products/${item.productSlug}`}
                className="font-medium hover:underline"
              >
                {item.productName}
              </Link>
              <p className="text-muted-foreground text-sm">{item.variantName}</p>
              <p className="font-tabular text-sm">{formatPrice(item.unitPrice)}</p>
            </div>
            <div className="border-border flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.cart.decreaseQty}
                onClick={() =>
                  updateItem.mutate({
                    variantId: item.variantId,
                    quantity: item.quantity - 1,
                  })
                }
              >
                <Minus className="size-4" />
              </Button>
              <span className="font-tabular w-8 text-center text-sm">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.cart.increaseQty}
                disabled={item.quantity >= item.stock}
                onClick={() =>
                  updateItem.mutate({
                    variantId: item.variantId,
                    quantity: item.quantity + 1,
                  })
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <span className="font-tabular w-20 text-right font-medium">
              {formatPrice(item.lineTotal)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.cart.remove}
              onClick={() =>
                updateItem.mutate({ variantId: item.variantId, quantity: 0 })
              }
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="border-border/70 mt-8 space-y-4 rounded-lg border p-4">
        <div className="flex gap-2">
          <Input
            placeholder={t.cart.promoPlaceholder}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button variant="outline" onClick={applyPromo} disabled={isApplyingPromo}>
            {t.cart.apply}
          </Button>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.cart.sum}</span>
            <span className="font-tabular">{formatPrice(cart.subtotal)}</span>
          </div>
          {promoResult && (
            <div className="text-success flex justify-between">
              <span>
                {t.cart.discount} ({promoResult.code})
              </span>
              <span className="font-tabular">
                −{formatPrice(promoResult.discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>{t.cart.total}</span>
            <span className="font-tabular">{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          nativeButton={false}
          render={
            <Link
              href={promoResult ? `/checkout?promo=${promoResult.code}` : "/checkout"}
            />
          }
        >
          {t.cart.checkout}
        </Button>
      </div>
    </div>
  );
}
