import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveCartIdentity } from "@/lib/cart-identity";
import {
  getGuestCartView,
  getUserCartView,
  setGuestCartItem,
  setUserCartItem,
} from "@/server/cart-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  try {
    const { variantId, quantity } = schema.parse(await request.json());

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      return jsonError("Товар не найден", 404);
    }

    const identity = await resolveCartIdentity();
    const currentCart =
      identity.type === "user"
        ? await getUserCartView(identity.userId)
        : await getGuestCartView(identity.guestToken);
    const currentQuantity =
      currentCart.items.find((i) => i.variantId === variantId)?.quantity ?? 0;
    const nextQuantity = Math.min(currentQuantity + quantity, variant.stock);

    if (nextQuantity <= currentQuantity) {
      return jsonError("Товара нет в наличии в нужном количестве", 409);
    }

    const cart =
      identity.type === "user"
        ? await setUserCartItem(identity.userId, variantId, nextQuantity)
        : await setGuestCartItem(identity.guestToken, variantId, nextQuantity);

    return NextResponse.json({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}
