import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { rankRelatedProducts, type RecommendationCandidate } from "@/lib/recommendations";
import { Prisma } from "@prisma/client";

const LISTING_CACHE_TTL_SECONDS = 60;

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  tags: string[];
  avgRating: string;
  reviewCount: number;
  categorySlug: string;
  categoryName: string;
  inStock: boolean;
};

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

/**
 * Cache-aside: product listings are read far more often than written, so
 * cache the serialized result in Redis for a short TTL and invalidate on
 * writes (see invalidateProductListingCache) rather than caching per-query
 * indefinitely.
 */
export async function listProducts(params: {
  categorySlug?: string;
  search?: string;
  sort?: "popular" | "price-asc" | "price-desc";
}): Promise<ProductListItem[]> {
  const cacheKey = `products:list:${params.categorySlug ?? "all"}:${params.search ?? ""}:${params.sort ?? "popular"}`;

  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached);
  }

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }

  let products;
  if (params.search?.trim()) {
    // Full-text search via the trigger-maintained tsvector column, ranked
    // by relevance (ts_rank) rather than a plain ILIKE scan.
    const query = params.search.trim();
    products = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        basePrice: Prisma.Decimal;
        tags: string[];
        avgRating: Prisma.Decimal;
        reviewCount: number;
        categorySlug: string;
        categoryName: string;
      }>
    >`
      SELECT p.id, p.name, p.slug, p.description, p."basePrice", p.tags,
             p."avgRating", p."reviewCount", c.slug as "categorySlug", c.name as "categoryName"
      FROM "Product" p
      JOIN "Category" c ON c.id = p."categoryId"
      WHERE p."isActive" = true
        AND p."searchVector" @@ websearch_to_tsquery('russian', ${query})
        ${params.categorySlug ? Prisma.sql`AND c.slug = ${params.categorySlug}` : Prisma.empty}
      ORDER BY ts_rank(p."searchVector", websearch_to_tsquery('russian', ${query})) DESC
    `;
  } else {
    const dbProducts = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy:
        params.sort === "price-asc"
          ? { basePrice: "asc" }
          : params.sort === "price-desc"
            ? { basePrice: "desc" }
            : { reviewCount: "desc" },
    });
    products = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: p.basePrice,
      tags: p.tags,
      avgRating: p.avgRating,
      reviewCount: p.reviewCount,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
    }));
  }

  const variantStocks = await prisma.productVariant.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _sum: { stock: true },
  });
  const stockByProduct = new Map(
    variantStocks.map((v) => [v.productId, v._sum.stock ?? 0]),
  );

  const result: ProductListItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: p.basePrice.toString(),
    tags: p.tags,
    avgRating: p.avgRating.toString(),
    reviewCount: p.reviewCount,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    inStock: (stockByProduct.get(p.id) ?? 0) > 0,
  }));

  await redis
    .set(cacheKey, JSON.stringify(result), "EX", LISTING_CACHE_TTL_SECONDS)
    .catch(() => {});
  return result;
}

export async function invalidateProductListingCache() {
  const keys = await redis.keys("products:list:*");
  if (keys.length) await redis.del(...keys);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { priceModifier: "asc" } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!product || !product.isActive) return null;
  return product;
}

export async function getProductByIdForAdmin(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, variants: { orderBy: { priceModifier: "asc" } } },
  });
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const target = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      categoryId: true,
      tags: true,
      avgRating: true,
      reviewCount: true,
    },
  });
  if (!target) return [];

  const candidates = await prisma.product.findMany({
    where: { isActive: true, id: { not: productId } },
    select: {
      id: true,
      categoryId: true,
      tags: true,
      avgRating: true,
      reviewCount: true,
      name: true,
      slug: true,
      basePrice: true,
      category: { select: { slug: true, name: true } },
    },
  });

  const asCandidate = (p: {
    id: string;
    categoryId: string;
    tags: string[];
    avgRating: Prisma.Decimal;
    reviewCount: number;
  }): RecommendationCandidate => ({
    id: p.id,
    categoryId: p.categoryId,
    tags: p.tags,
    avgRating: Number(p.avgRating),
    reviewCount: p.reviewCount,
  });

  const ranked = rankRelatedProducts(
    asCandidate(target),
    candidates.map(asCandidate),
    limit,
  );
  const byId = new Map(candidates.map((c) => [c.id, c]));
  return ranked.map((r) => byId.get(r.id)!).filter(Boolean);
}

export async function addReview(
  productId: string,
  userId: string,
  input: { rating: number; comment: string },
) {
  const review = await prisma.review.create({
    data: { productId, userId, rating: input.rating, comment: input.comment },
  });

  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });

  await invalidateProductListingCache();
  return review;
}

// ---------- Admin ----------

export async function adminListProducts() {
  return prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  tastingNotes: string[];
  tags: string[];
  variants: {
    id?: string;
    name: string;
    priceModifier: number;
    stock: number;
    sku: string;
  }[];
};

export async function createProduct(input: ProductInput) {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      tastingNotes: input.tastingNotes,
      tags: input.tags,
      variants: {
        create: input.variants.map((v, i) => ({
          name: v.name,
          priceModifier: v.priceModifier,
          stock: v.stock,
          sku: v.sku,
          isDefault: i === 0,
        })),
      },
    },
  });
  await invalidateProductListingCache();
  return product;
}

export async function updateProduct(productId: string, input: ProductInput) {
  const existingVariants = await prisma.productVariant.findMany({ where: { productId } });
  const existingIds = new Set(existingVariants.map((v) => v.id));
  const keptIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id));
  const removedIds = [...existingIds].filter((id) => !keptIds.has(id));

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId,
        basePrice: input.basePrice,
        tastingNotes: input.tastingNotes,
        tags: input.tags,
      },
    }),
    ...(removedIds.length
      ? [prisma.productVariant.deleteMany({ where: { id: { in: removedIds } } })]
      : []),
    ...input.variants.map((v) =>
      v.id
        ? prisma.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              priceModifier: v.priceModifier,
              stock: v.stock,
              sku: v.sku,
            },
          })
        : prisma.productVariant.create({
            data: {
              productId,
              name: v.name,
              priceModifier: v.priceModifier,
              stock: v.stock,
              sku: v.sku,
            },
          }),
    ),
  ]);

  await invalidateProductListingCache();
}

export async function setProductActive(productId: string, isActive: boolean) {
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  await invalidateProductListingCache();
}
