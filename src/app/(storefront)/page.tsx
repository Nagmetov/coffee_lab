import Link from "next/link";
import { Coffee, Cookie, Flame, Gift, Package, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { listCategories, listProducts } from "@/server/product-service";

const FEATURES = [
  {
    icon: Flame,
    title: "Своя обжарка",
    description:
      "Закупаем зелёное зерно напрямую у кооперативов и обжариваем небольшими партиями каждую неделю.",
  },
  {
    icon: Timer,
    title: "Свежая выпечка",
    description:
      "Десерты готовятся на месте нашими кондитерами каждое утро — без полуфабрикатов.",
  },
  {
    icon: Gift,
    title: "Бонусная программа",
    description:
      "1 балл за каждые 10 ₽ заказа. Бронза, серебро, золото, платина — чем больше заказов, тем выше уровень.",
  },
];

const CATEGORY_META: Record<string, { icon: typeof Coffee; description: string }> = {
  napitki: { icon: Coffee, description: "Эспрессо, капучино, латте, раф и фильтр-кофе" },
  zerno: { icon: Package, description: "Моносорта и купажи собственной обжарки" },
  deserty: { icon: Cookie, description: "Выпечка и десерты, приготовленные на месте" },
};

export default async function HomePage() {
  const [categories, popular] = await Promise.all([
    listCategories(),
    listProducts({ sort: "popular" }),
  ]);

  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
        <h1 className="font-heading text-4xl font-semibold text-balance sm:text-5xl">
          CoffeeLab — обжарка и кофейня
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          Зерно собственной обжарки, эспрессо-напитки и десерты. Закажите онлайн с доставкой
          или заберите в кофейне.
        </p>
        <Button size="lg" nativeButton={false} render={<Link href="/menu" />}>
          Смотреть меню
        </Button>
      </section>

      <section className="border-border/70 bg-muted/30 border-y">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3">
              <feature.icon className="text-primary size-6" strokeWidth={1.5} aria-hidden />
              <h2 className="font-heading text-lg font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-heading mb-6 text-2xl font-semibold">Категории</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((category) => {
              const meta = CATEGORY_META[category.slug];
              const Icon = meta?.icon ?? Coffee;
              return (
                <Link
                  key={category.id}
                  href={`/menu?category=${category.slug}`}
                  className="group border-border/70 bg-card flex flex-col gap-2 rounded-xl border p-5 transition-shadow hover:shadow-md"
                >
                  <Icon
                    className="text-primary/70 size-8"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <h3 className="font-medium group-hover:underline">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {meta?.description ?? "Смотреть в меню"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold">Популярное</h2>
            <Link
              href="/menu"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Всё меню →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popular.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-border/70 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">О кофейне</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Небольшая обжарочная студия: сезонные моносорта, стабильные купажи и десерты
              без полуфабрикатов.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/about" />}
          >
            Узнать больше
          </Button>
        </div>
      </section>
    </>
  );
}
