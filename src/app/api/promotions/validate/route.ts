import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveCartIdentity } from "@/lib/cart-identity";
import { getGuestCartView, getUserCartView } from "@/server/cart-service";
import {
  computeOrderTotals,
  PromotionNotApplicableError,
  type PromotionRule,
} from "@/lib/pricing";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const schema = z.object({ code: z.string().trim().min(1).toUpperCase() });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  try {
    const { code } = schema.parse(await request.json());

    const identity = await resolveCartIdentity();
    const cart =
      identity.type === "user"
        ? await getUserCartView(identity.userId)
        : await getGuestCartView(identity.guestToken);

    const promotion = await prisma.promotion.findUnique({ where: { code } });
    if (!promotion) {
      return jsonError("Промокод не найден", 404);
    }

    const rule: PromotionRule = {
      type: promotion.type,
      value: Number(promotion.value),
      minOrderAmount: Number(promotion.minOrderAmount),
      validFrom: promotion.validFrom,
      validTo: promotion.validTo,
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit,
      usedCount: promotion.usedCount,
    };

    const totals = computeOrderTotals(cart.subtotal, rule);
    return NextResponse.json({ code, ...totals });
  } catch (error) {
    if (error instanceof PromotionNotApplicableError) {
      return jsonError(error.message, 422);
    }
    return handleApiError(error);
  }
}
