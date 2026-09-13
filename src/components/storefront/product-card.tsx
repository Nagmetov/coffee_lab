import Link from "next/link";
import { Star } from "lucide-react";
import { ProductThumb } from "@/components/storefront/product-thumb";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getLocale, getDictionary } from "@/i18n/dictionary";
import type { ProductListItem } from "@/server/product-service";

export async function ProductCard({ product }: { product: ProductListItem }) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group border-border/70 bg-card flex flex-col gap-3 rounded-xl border p-3 transition-shadow hover:shadow-md"
    >
      <ProductThumb
        categorySlug={product.categorySlug}
        seed={product.slug}
        imageUrl={product.images[0]}
        className="w-full"
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground font-medium group-hover:underline">
            {product.name}
          </h3>
          {!product.inStock && (
            <Badge variant="outline" className="shrink-0">
              {t.product.outOfStock}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {product.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-tabular font-semibold">
          {formatPrice(product.basePrice)}
        </span>
        {product.reviewCount > 0 && (
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <Star className="fill-warning text-warning size-3.5" aria-hidden />
            {Number(product.avgRating).toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
