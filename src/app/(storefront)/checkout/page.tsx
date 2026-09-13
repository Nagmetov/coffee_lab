"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { apiJson, ApiError } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  postalCode: string;
  phone: string;
};

type PromoResult = { code: string; discountAmount: number; totalAmount: number };

function CheckoutForm() {
  const router = useRouter();
  const promoFromUrl = useSearchParams().get("promo");
  const { data: cart, isLoading } = useCart();
  const queryClient = useQueryClient();
  const { t } = useLocale();

  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | undefined>();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Дом",
    line1: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState(promoFromUrl ?? "");
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiJson<{ addresses: Address[] }>("/api/addresses").then((data) => {
      setAddresses(data.addresses);
      if (data.addresses.length > 0) setAddressId(data.addresses[0].id);
      else setShowNewAddress(true);
    });
  }, []);

  useEffect(() => {
    if (!promoFromUrl || !cart) return;
    apiJson<PromoResult>("/api/promotions/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoFromUrl }),
    })
      .then(setPromoResult)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when cart is ready
  }, [cart != null]);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    try {
      const result = await apiJson<PromoResult>("/api/promotions/validate", {
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

  async function handleAddAddress() {
    try {
      const data = await apiJson<{ address: Address }>("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      setAddresses((prev) => [...prev, data.address]);
      setAddressId(data.address.id);
      setShowNewAddress(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : t.checkout.addressSaveErrorToast,
      );
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const data = await apiJson<{ order: { id: string; orderNumber: string } }>(
        "/api/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fulfillmentType,
            addressId: fulfillmentType === "DELIVERY" ? addressId : undefined,
            promoCode: promoResult?.code,
            note: note || undefined,
          }),
        },
      );
      toast.success(`${data.order.orderNumber} ${t.checkout.orderPlacedToast}`);
      queryClient.setQueryData(["cart"], { items: [], subtotal: 0, itemCount: 0 });
      router.push(`/orders/${data.order.id}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.checkout.orderErrorToast);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!cart || cart.items.length === 0) {
    return <p className="text-muted-foreground">{t.checkout.cartEmpty}</p>;
  }

  const total = promoResult ? promoResult.totalAmount : cart.subtotal;
  const canSubmit =
    fulfillmentType === "PICKUP" || (fulfillmentType === "DELIVERY" && !!addressId);

  return (
    <div className="grid gap-8 sm:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 font-medium">{t.checkout.fulfillmentTitle}</h2>
          <div className="flex gap-2">
            {(["PICKUP", "DELIVERY"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFulfillmentType(type)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  fulfillmentType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {type === "PICKUP" ? t.checkout.pickup : t.checkout.delivery}
              </button>
            ))}
          </div>
        </div>

        {fulfillmentType === "DELIVERY" && (
          <div className="space-y-3">
            <h2 className="font-medium">{t.checkout.addressTitle}</h2>
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${
                  addressId === address.id ? "border-primary" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addressId === address.id}
                  onChange={() => setAddressId(address.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{address.label}</p>
                  <p className="text-muted-foreground">
                    {address.line1}, {address.city}, {address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{address.phone}</p>
                </div>
              </label>
            ))}

            {showNewAddress ? (
              <div className="border-border space-y-2 rounded-lg border p-3">
                <Input
                  placeholder={t.checkout.labelPlaceholder}
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress((a) => ({ ...a, label: e.target.value }))
                  }
                />
                <Input
                  placeholder={t.checkout.linePlaceholder}
                  value={newAddress.line1}
                  onChange={(e) =>
                    setNewAddress((a) => ({ ...a, line1: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder={t.checkout.cityPlaceholder}
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress((a) => ({ ...a, city: e.target.value }))
                    }
                  />
                  <Input
                    placeholder={t.checkout.postalPlaceholder}
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress((a) => ({ ...a, postalCode: e.target.value }))
                    }
                  />
                </div>
                <Input
                  placeholder={t.checkout.phonePlaceholder}
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress((a) => ({ ...a, phone: e.target.value }))
                  }
                />
                <Button type="button" size="sm" onClick={handleAddAddress}>
                  {t.checkout.saveAddress}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewAddress(true)}
              >
                {t.checkout.addNewAddress}
              </Button>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="note" className="mb-2 block font-medium">
            {t.checkout.noteTitle}
          </Label>
          <Textarea
            id="note"
            placeholder={t.checkout.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="border-border/70 h-fit space-y-4 rounded-lg border p-4">
        <h2 className="font-medium">{t.checkout.yourOrder}</h2>
        <ul className="space-y-1 text-sm">
          {cart.items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.productName} ({item.variantName}) × {item.quantity}
              </span>
              <span className="font-tabular">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-border/70 flex gap-2 border-t pt-3">
          <Input
            placeholder={t.checkout.promoPlaceholder}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyPromo}
            disabled={isApplyingPromo}
          >
            {t.checkout.apply}
          </Button>
        </div>
        <div className="border-border/70 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.checkout.sum}</span>
            <span className="font-tabular">{formatPrice(cart.subtotal)}</span>
          </div>
          {promoResult && (
            <div className="text-success flex justify-between">
              <span>
                {t.checkout.discount} ({promoResult.code})
              </span>
              <span className="font-tabular">
                −{formatPrice(promoResult.discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>{t.checkout.total}</span>
            <span className="font-tabular">{formatPrice(total)}</span>
          </div>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? t.checkout.confirming : t.checkout.confirm}
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">{t.checkout.title}</h1>
      <Suspense>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
