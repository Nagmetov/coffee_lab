"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { CartView } from "@/server/cart-service";

async function fetchCart(): Promise<CartView> {
  const data = await apiJson<{ cart: CartView }>("/api/cart");
  return data.cart;
}

export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: fetchCart });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: string;
      quantity: number;
    }) => {
      const data = await apiJson<{ cart: CartView }>(`/api/cart/items/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      return data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
}
