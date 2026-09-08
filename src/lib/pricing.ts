export type PromotionRule = {
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderAmount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
};

export type PricingResult = {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
};

export class PromotionNotApplicableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "PromotionNotApplicableError";
  }
}

/**
 * Validates a promotion against the current cart/time and returns the
 * discount it produces. Throws with a user-facing reason instead of
 * silently applying $0 discount, so the checkout UI can surface *why* a
 * code didn't work.
 */
export function evaluatePromotion(
  promotion: PromotionRule,
  subtotal: number,
  now: Date = new Date(),
): number {
  if (!promotion.isActive) {
    throw new PromotionNotApplicableError("Промокод больше не активен");
  }
  if (now < promotion.validFrom || now > promotion.validTo) {
    throw new PromotionNotApplicableError("Срок действия промокода истёк");
  }
  if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
    throw new PromotionNotApplicableError("Лимит использований промокода исчерпан");
  }
  if (subtotal < promotion.minOrderAmount) {
    throw new PromotionNotApplicableError(
      `Минимальная сумма заказа для промокода — ${promotion.minOrderAmount} ₽`,
    );
  }

  const rawDiscount =
    promotion.type === "PERCENT" ? (subtotal * promotion.value) / 100 : promotion.value;

  return round2(Math.min(rawDiscount, subtotal));
}

export function computeOrderTotals(
  subtotal: number,
  promotion: PromotionRule | null,
  now: Date = new Date(),
): PricingResult {
  const discountAmount = promotion ? evaluatePromotion(promotion, subtotal, now) : 0;
  return {
    subtotal: round2(subtotal),
    discountAmount,
    totalAmount: round2(subtotal - discountAmount),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
