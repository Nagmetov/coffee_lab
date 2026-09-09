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

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
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
      toast.success("Промокод применён");
    } catch (error) {
      setPromoResult(null);
      toast.error(error instanceof ApiError ? error.message : "Промокод недействителен");
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
        <h1 className="font-heading text-2xl font-semibold">Корзина пуста</h1>
        <p className="text-muted-foreground">Добавьте что-нибудь вкусное из меню</p>
        <Button render={<Link href="/menu" />} nativeButton={false}>
          Перейти в меню
        </Button>
      </div>
    );
  }

  const total = promoResult ? promoResult.totalAmount : cart.subtotal;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Корзина</h1>

      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li
            key={item.variantId}
            className="border-border/70 flex items-center gap-4 rounded-lg border p-3"
          >
            <ProductThumb categorySlug={item.categorySlug} className="size-16 shrink-0" />
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
                aria-label="Уменьшить количество"
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
                aria-label="Увеличить количество"
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
              aria-label="Удалить товар"
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
            placeholder="Промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button variant="outline" onClick={applyPromo} disabled={isApplyingPromo}>
            Применить
          </Button>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Сумма</span>
            <span className="font-tabular">{formatPrice(cart.subtotal)}</span>
          </div>
          {promoResult && (
            <div className="text-success flex justify-between">
              <span>Скидка ({promoResult.code})</span>
              <span className="font-tabular">
                −{formatPrice(promoResult.discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Итого</span>
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
          Оформить заказ
        </Button>
      </div>
    </div>
  );
}
