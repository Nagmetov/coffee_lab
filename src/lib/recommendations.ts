export type RecommendationCandidate = {
  id: string;
  categoryId: string;
  tags: string[];
  avgRating: number;
  reviewCount: number;
};

const WEIGHTS = {
  sameCategory: 3,
  perSharedTag: 1.5,
  ratingSignal: 1, // scaled 0..1 by rating, damped by review volume
};

/**
 * Content-based "related products" scoring: category match + tag overlap +
 * a review-volume-damped rating signal (so a 5.0 from one review doesn't
 * outrank a 4.6 from two hundred). No ML model, no external data — just a
 * transparent, unit-testable ranking function.
 */
export function scoreRelatedProduct(
  target: RecommendationCandidate,
  candidate: RecommendationCandidate,
): number {
  let score = 0;

  if (candidate.categoryId === target.categoryId) {
    score += WEIGHTS.sameCategory;
  }

  const sharedTags = candidate.tags.filter((tag) => target.tags.includes(tag)).length;
  score += sharedTags * WEIGHTS.perSharedTag;

  const confidence = Math.min(candidate.reviewCount / 20, 1); // ramps up to full trust at 20 reviews
  score += (candidate.avgRating / 5) * confidence * WEIGHTS.ratingSignal;

  return score;
}

export function rankRelatedProducts(
  target: RecommendationCandidate,
  candidates: RecommendationCandidate[],
  limit = 4,
): RecommendationCandidate[] {
  return candidates
    .filter((c) => c.id !== target.id)
    .map((c) => ({ candidate: c, score: scoreRelatedProduct(target, c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.candidate);
}
