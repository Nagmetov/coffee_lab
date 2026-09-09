import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const orderNumberSuffix = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
import {
  computeOrderTotals,
  PromotionNotApplicableError,
  type PromotionRule,
} from "@/lib/pricing";
import { pointsForOrder, tierForPoints } from "@/lib/loyalty";
import type { CartView } from "@/server/cart-service";
import type { FulfillmentType } from "@prisma/client";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly code:
      "EMPTY_CART" | "OUT_OF_STOCK" | "INVALID_PROMOTION" | "INVALID_ADDRESS",
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

function toPromotionRule(p: {
  type: "PERCENT" | "FIXED";
  value: unknown;
  minOrderAmount: unknown;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
}): PromotionRule {
  return {
    type: p.type,
    value: Number(p.value),
    minOrderAmount: Number(p.minOrderAmount),
    validFrom: p.validFrom,
    validTo: p.validTo,
    isActive: p.isActive,
    usageLimit: p.usageLimit,
    usedCount: p.usedCount,
  };
}

export async function checkout(
  userId: string,
  cart: CartView,
  input: {
    fulfillmentType: FulfillmentType;
    addressId?: string;
    promoCode?: string;
    note?: string;
  },
) {
  if (cart.items.length === 0) {
    throw new CheckoutError("Корзина пуста", "EMPTY_CART");
  }

  if (input.fulfillmentType === "DELIVERY") {
    if (!input.addressId) {
      throw new CheckoutError("Укажите адрес доставки", "INVALID_ADDRESS");
    }
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId },
    });
    if (!address) {
      throw new CheckoutError("Адрес не найден", "INVALID_ADDRESS");
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    // Stock reservation: an atomic conditional UPDATE (decrement only if
    // stock >= quantity) takes an implicit row lock per variant, so two
    // concurrent checkouts racing for the last unit can't both succeed —
    // the loser's WHERE clause simply matches zero rows.
    for (const item of cart.items) {
      const result = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        throw new CheckoutError(
          `Недостаточно товара «${item.productName} — ${item.variantName}» на складе`,
          "OUT_OF_STOCK",
        );
      }
    }

    let promotion = null;
    if (input.promoCode) {
      const found = await tx.promotion.findUnique({ where: { code: input.promoCode } });
      if (!found) {
        throw new CheckoutError("Промокод не найден", "INVALID_PROMOTION");
      }
      try {
        computeOrderTotals(cart.subtotal, toPromotionRule(found));
      } catch (error) {
        if (error instanceof PromotionNotApplicableError) {
          throw new CheckoutError(error.message, "INVALID_PROMOTION");
        }
        throw error;
      }
      promotion = found;
      await tx.promotion.update({
        where: { id: found.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const totals = computeOrderTotals(
      cart.subtotal,
      promotion ? toPromotionRule(promotion) : null,
    );
    const loyaltyPointsEarned = pointsForOrder(totals.totalAmount);

    const createdOrder = await tx.order.create({
      data: {
        orderNumber: `CL-${orderNumberSuffix()}`,
        userId,
        status: "PENDING",
        fulfillmentType: input.fulfillmentType,
        addressId: input.fulfillmentType === "DELIVERY" ? input.addressId : null,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        promotionId: promotion?.id,
        loyaltyPointsEarned,
        note: input.note,
        items: {
          create: cart.items.map((item) => ({
            productVariantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
        statusHistory: {
          create: { toStatus: "PENDING", note: "Заказ создан" },
        },
      },
    });

    // No real payment gateway is wired up for this demo: checkout marks
    // the order paid immediately, but the transition still goes through
    // the same state machine (and audit trail) that admin-driven status
    // changes use — see src/lib/order-state-machine.ts.
    const paidOrder = await tx.order.update({
      where: { id: createdOrder.id },
      data: {
        status: "PAID",
        statusHistory: {
          create: {
            fromStatus: "PENDING",
            toStatus: "PAID",
            note: "Оплата подтверждена",
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cart: { userId } } });

    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const newPoints = user.loyaltyPoints + loyaltyPointsEarned;
    await tx.user.update({
      where: { id: userId },
      data: { loyaltyPoints: newPoints, loyaltyTier: tierForPoints(newPoints) },
    });

    return paidOrder;
  });

  return order;
}

export async function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getOrderForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      address: true,
      promotion: true,
    },
  });
}
