import { describe, expect, it } from "vitest";
import { rankRelatedProducts, scoreRelatedProduct } from "@/lib/recommendations";

const target = {
  id: "espresso",
  categoryId: "napitki",
  tags: ["классика", "крепкий"],
  avgRating: 4.8,
  reviewCount: 50,
};

describe("scoreRelatedProduct", () => {
  it("scores a same-category, tag-overlapping product higher than an unrelated one", () => {
    const sameCategory = {
      id: "americano",
      categoryId: "napitki",
      tags: ["классика"],
      avgRating: 4.5,
      reviewCount: 30,
    };
    const unrelated = {
      id: "cheesecake",
      categoryId: "deserty",
      tags: ["бестселлер"],
      avgRating: 4.9,
      reviewCount: 100,
    };

    expect(scoreRelatedProduct(target, sameCategory)).toBeGreaterThan(
      scoreRelatedProduct(target, unrelated),
    );
  });

  it("damps the rating signal for low review counts", () => {
    const trusted = {
      id: "a",
      categoryId: "x",
      tags: [],
      avgRating: 5,
      reviewCount: 100,
    };
    const unproven = { id: "b", categoryId: "x", tags: [], avgRating: 5, reviewCount: 1 };

    expect(scoreRelatedProduct(target, trusted)).toBeGreaterThan(
      scoreRelatedProduct(target, unproven),
    );
  });
});

describe("rankRelatedProducts", () => {
  it("excludes the target itself and respects the limit", () => {
    const candidates = [
      target,
      {
        id: "americano",
        categoryId: "napitki",
        tags: ["классика"],
        avgRating: 4.5,
        reviewCount: 30,
      },
      { id: "latte", categoryId: "napitki", tags: [], avgRating: 4.2, reviewCount: 10 },
      { id: "raf", categoryId: "napitki", tags: [], avgRating: 4.6, reviewCount: 5 },
      {
        id: "cheesecake",
        categoryId: "deserty",
        tags: [],
        avgRating: 4.9,
        reviewCount: 100,
      },
    ];

    const ranked = rankRelatedProducts(target, candidates, 2);
    expect(ranked).toHaveLength(2);
    expect(ranked.some((p) => p.id === target.id)).toBe(false);
    expect(ranked[0].id).toBe("americano");
  });
});
