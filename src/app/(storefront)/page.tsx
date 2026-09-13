import Link from "next/link";
import { Coffee, Cookie, Flame, Gift, Package, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { FadeIn } from "@/components/fade-in";
import { listCategories, listProducts } from "@/server/product-service";
import { getLocale, getDictionary } from "@/i18n/dictionary";

// Without this the page has no dynamic API call in its body, so Next
// prerenders it once at build time and "Популярное"/"Категории" would
// freeze at whatever the catalog looked like then. Match the Redis
// listing cache's own TTL instead of statically freezing it forever.
export const revalidate = 60;

const CATEGORY_ICONS: Record<string, typeof Coffee> = {
  napitki: Coffee,
  zerno: Package,
  deserty: Cookie,
};

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [categories, popular] = await Promise.all([
    listCategories(),
    listProducts({ sort: "popular" }),
  ]);

  const features = [
    { icon: Flame, ...t.home.features.roast },
    { icon: Timer, ...t.home.features.pastry },
    { icon: Gift, ...t.home.features.loyalty },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="bg-primary/20 animate-float-slow pointer-events-none absolute top-[-6rem] right-[-4rem] size-72 rounded-full blur-3xl"
          aria-hidden
        />
        <div
          className="bg-accent/25 animate-float pointer-events-none absolute bottom-[-4rem] left-[-3rem] size-64 rounded-full blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
          <FadeIn>
            <h1 className="font-heading text-4xl font-semibold text-balance sm:text-5xl">
              {t.home.title}
            </h1>
          </FadeIn>
          <FadeIn delay={120}>
            <p className="text-muted-foreground max-w-xl text-lg">{t.home.subtitle}</p>
          </FadeIn>
          <FadeIn delay={240}>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/menu" />}
              className="transition-transform duration-300 hover:scale-[1.03] active:scale-95"
            >
              {t.home.cta}
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="border-border/70 bg-muted/30 border-y">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 100} className="flex flex-col gap-3">
              <feature.icon
                className="text-primary size-6 transition-transform duration-300 hover:scale-110"
                strokeWidth={1.5}
                aria-hidden
              />
              <h2 className="font-heading text-lg font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <FadeIn>
            <h2 className="font-heading mb-6 text-2xl font-semibold">
              {t.home.categoriesTitle}
            </h2>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((category, i) => {
              const description =
                t.home.categoryDescriptions[
                  category.slug as keyof typeof t.home.categoryDescriptions
                ] ?? t.home.categoryFallback;
              const Icon = CATEGORY_ICONS[category.slug] ?? Coffee;
              return (
                <FadeIn key={category.id} delay={i * 100}>
                  <Link
                    href={`/menu?category=${category.slug}`}
                    className="group border-border/70 bg-card flex flex-col gap-2 rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Icon
                      className="text-primary/70 size-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="font-medium group-hover:underline">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{description}</p>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <FadeIn>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold">{t.home.popularTitle}</h2>
              <Link
                href="/menu"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {t.home.viewAllMenu}
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popular.slice(0, 4).map((product, i) => (
              <FadeIn key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <section className="border-border/70 border-t">
        <FadeIn className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{t.home.aboutTitle}</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">{t.home.aboutText}</p>
          </div>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/about" />}
            className="transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          >
            {t.home.aboutCta}
          </Button>
        </FadeIn>
      </section>
    </>
  );
}
