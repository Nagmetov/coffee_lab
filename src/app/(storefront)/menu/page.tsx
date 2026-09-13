import { listCategories, listProducts } from "@/server/product-service";
import { MenuFilters } from "@/components/storefront/menu-filters";
import { ProductCard } from "@/components/storefront/product-card";
import { FadeIn } from "@/components/fade-in";
import { getLocale, getDictionary } from "@/i18n/dictionary";

export const metadata = { title: "Меню" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort =
    params.sort === "price-asc" || params.sort === "price-desc" ? params.sort : "popular";

  const [locale, categories, products] = await Promise.all([
    getLocale(),
    listCategories(),
    listProducts({ categorySlug: params.category, search: params.search, sort }),
  ]);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading mb-6 text-3xl font-semibold">{t.menu.title}</h1>
      <MenuFilters categories={categories} />

      {products.length === 0 ? (
        <p className="text-muted-foreground mt-16 text-center">{t.menu.empty}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={Math.min(i, 8) * 60}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
