import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/product-service";
import { getSession } from "@/lib/auth/session";
import { ProductThumb } from "@/components/storefront/product-thumb";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { ReviewForm } from "@/components/storefront/review-form";
import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Metadata } from "next";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Товар не найден" };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, session] = await Promise.all([
    getRelatedProducts(product.id),
    getSession(),
  ]);

  const hasReviewed = session
    ? product.reviews.some((r) => r.userId === session.sub)
    : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductThumb categorySlug={product.category.slug} className="w-full" />

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground text-sm">{product.category.name}</p>
            <h1 className="font-heading text-3xl font-semibold">{product.name}</h1>
            {product.reviewCount > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                <Star className="fill-warning text-warning size-4" aria-hidden />
                {Number(product.avgRating).toFixed(1)} · {product.reviewCount} отзывов
              </div>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {product.tastingNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tastingNotes.map((note) => (
                <Badge key={note} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
          )}

          <AddToCartForm
            basePrice={product.basePrice.toString()}
            variants={product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceModifier: v.priceModifier.toString(),
              stock: v.stock,
            }))}
          />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-heading mb-4 text-2xl font-semibold">Отзывы</h2>
        {session && !hasReviewed && <ReviewForm productSlug={product.slug} />}
        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Пока нет отзывов — станьте первым!
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <li key={review.id} className="border-border/70 border-b pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className={`size-3.5 ${v <= review.rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading mb-4 text-2xl font-semibold">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard
                key={r.id}
                product={{
                  id: r.id,
                  name: r.name,
                  slug: r.slug,
                  description: "",
                  basePrice: r.basePrice.toString(),
                  tags: r.tags,
                  avgRating: r.avgRating.toString(),
                  reviewCount: r.reviewCount,
                  categorySlug: r.category.slug,
                  categoryName: r.category.name,
                  inStock: true,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
