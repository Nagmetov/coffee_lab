import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getUserCartView } from "@/server/cart-service";
import { checkout, CheckoutError } from "@/server/order-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";
import { checkRateLimit } from "@/lib/rate-limit";
import { invalidateProductListingCache } from "@/server/product-service";

const schema = z.object({
  fulfillmentType: z.enum(["PICKUP", "DELIVERY"]),
  addressId: z.string().optional(),
  promoCode: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : undefined)),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const session = await getSession();
  if (!session) {
    return jsonError("Войдите, чтобы оформить заказ", 401);
  }

  const rate = await checkRateLimit(`checkout:${session.sub}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!rate.allowed) {
    return jsonError("Слишком много попыток оформления заказа. Попробуйте позже.", 429);
  }

  try {
    const input = schema.parse(await request.json());
    const cart = await getUserCartView(session.sub);
    const order = await checkout(session.sub, cart, input);
    await invalidateProductListingCache();

    return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return jsonError(error.message, 422);
    }
    return handleApiError(error);
  }
}
