import { describe, expect, it } from "vitest";
import {
  PromotionNotApplicableError,
  computeOrderTotals,
  evaluatePromotion,
  type PromotionRule,
} from "@/lib/pricing";

const basePromo: PromotionRule = {
  type: "PERCENT",
  value: 10,
  minOrderAmount: 300,
  validFrom: new Date("2024-01-01"),
  validTo: new Date("2030-01-01"),
  isActive: true,
  usageLimit: 100,
  usedCount: 0,
};

describe("evaluatePromotion", () => {
  it("applies a percent discount", () => {
    expect(evaluatePromotion(basePromo, 1000)).toBe(100);
  });

  it("applies a fixed discount capped at the subtotal", () => {
    const fixed: PromotionRule = { ...basePromo, type: "FIXED", value: 500 };
    expect(evaluatePromotion(fixed, 300)).toBe(300);
  });

  it("rejects orders below the minimum amount", () => {
    expect(() => evaluatePromotion(basePromo, 100)).toThrow(PromotionNotApplicableError);
  });

  it("rejects an inactive promotion", () => {
    expect(() => evaluatePromotion({ ...basePromo, isActive: false }, 1000)).toThrow(
      PromotionNotApplicableError,
    );
  });

  it("rejects an expired promotion", () => {
    const expired = { ...basePromo, validTo: new Date("2020-01-01") };
    expect(() => evaluatePromotion(expired, 1000)).toThrow(PromotionNotApplicableError);
  });

  it("rejects once the usage limit is reached", () => {
    const exhausted = { ...basePromo, usageLimit: 5, usedCount: 5 };
    expect(() => evaluatePromotion(exhausted, 1000)).toThrow(PromotionNotApplicableError);
  });
});

describe("computeOrderTotals", () => {
  it("returns subtotal as total when there is no promotion", () => {
    expect(computeOrderTotals(500, null)).toEqual({
      subtotal: 500,
      discountAmount: 0,
      totalAmount: 500,
    });
  });

  it("subtracts the discount from the subtotal", () => {
    expect(computeOrderTotals(1000, basePromo)).toEqual({
      subtotal: 1000,
      discountAmount: 100,
      totalAmount: 900,
    });
  });
});
