import { describe, expect, it } from "vitest";
import { nextTierProgress, pointsForOrder, tierForPoints } from "@/lib/loyalty";

describe("pointsForOrder", () => {
  it("awards 1 point per 10 rubles, rounded down", () => {
    expect(pointsForOrder(250)).toBe(25);
    expect(pointsForOrder(255)).toBe(25);
    expect(pointsForOrder(9)).toBe(0);
  });
});

describe("tierForPoints", () => {
  it.each([
    [0, "BRONZE"],
    [499, "BRONZE"],
    [500, "SILVER"],
    [1999, "SILVER"],
    [2000, "GOLD"],
    [4999, "GOLD"],
    [5000, "PLATINUM"],
  ] as const)("classifies %i points as %s", (points, tier) => {
    expect(tierForPoints(points)).toBe(tier);
  });
});

describe("nextTierProgress", () => {
  it("reports points remaining to the next tier", () => {
    expect(nextTierProgress(300)).toEqual({ tier: "BRONZE", pointsToNext: 200 });
  });

  it("reports null when already at the top tier", () => {
    expect(nextTierProgress(6000)).toEqual({ tier: "PLATINUM", pointsToNext: null });
  });
});
