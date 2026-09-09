import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { setGuestCartItem, setUserCartItem } from "@/server/cart-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({ quantity: z.number().int().min(0).max(50) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  try {
    const { variantId } = await params;
    const { quantity } = schema.parse(await request.json());

    if (quantity > 0) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });
      if (!variant) return jsonError("Товар не найден", 404);
      if (quantity > variant.stock) {
        return jsonError("Товара нет в наличии в нужном количестве", 409);
      }
    }

    const identity = await resolveCartIdentity();
    const cart =
      identity.type === "user"
        ? await setUserCartItem(identity.userId, variantId, quantity)
        : await setGuestCartItem(identity.guestToken, variantId, quantity);

    return NextResponse.json({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const { variantId } = await params;
  const identity = await resolveCartIdentity();
  const cart =
    identity.type === "user"
      ? await setUserCartItem(identity.userId, variantId, 0)
      : await setGuestCartItem(identity.guestToken, variantId, 0);
  return NextResponse.json({ cart });
}
