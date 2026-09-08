import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
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
  );
}
