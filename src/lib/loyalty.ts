import type { LoyaltyTier } from "@prisma/client";

export const LOYALTY_TIER_LABELS: Record<LoyaltyTier, string> = {
  BRONZE: "Бронза",
  SILVER: "Серебро",
  GOLD: "Золото",
  PLATINUM: "Платина",
};

/** 1 loyalty point per 10 ₽ spent on a completed order, rounded down. */
export function pointsForOrder(totalAmount: number): number {
  return Math.floor(totalAmount / 10);
}

const TIER_THRESHOLDS: { tier: LoyaltyTier; minPoints: number }[] = [
  { tier: "PLATINUM", minPoints: 5000 },
  { tier: "GOLD", minPoints: 2000 },
  { tier: "SILVER", minPoints: 500 },
  { tier: "BRONZE", minPoints: 0 },
];

export function tierForPoints(totalPoints: number): LoyaltyTier {
  const match = TIER_THRESHOLDS.find((t) => totalPoints >= t.minPoints);
  return match?.tier ?? "BRONZE";
}

export function nextTierProgress(totalPoints: number): {
  tier: LoyaltyTier;
  pointsToNext: number | null;
} {
  const currentIndex = TIER_THRESHOLDS.findIndex((t) => totalPoints >= t.minPoints);
  const current = TIER_THRESHOLDS[currentIndex];
  const next = TIER_THRESHOLDS[currentIndex - 1];
  return {
    tier: current.tier,
    pointsToNext: next ? next.minPoints - totalPoints : null,
  };
}
