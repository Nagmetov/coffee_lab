import { Coffee, Cookie, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Coffee> = {
  napitki: Coffee,
  zerno: Package,
  deserty: Cookie,
};

const GRADIENTS: Record<string, string> = {
  napitki: "from-primary/25 via-primary/10 to-transparent",
  zerno: "from-accent/30 via-accent/10 to-transparent",
  deserty: "from-secondary via-secondary/40 to-transparent",
};

/**
 * No product photography in this demo catalog, so instead of broken <img>
 * tags we render an intentional category-tinted placeholder — keeps the
 * grid visually consistent rather than looking like a missing asset.
 */
export function ProductThumb({
  categorySlug,
  className,
}: {
  categorySlug: string;
  className?: string;
}) {
  const Icon = ICONS[categorySlug] ?? Coffee;
  const gradient = GRADIENTS[categorySlug] ?? GRADIENTS.napitki;

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <Icon className="text-primary/70 size-10" strokeWidth={1.5} aria-hidden />
    </div>
  );
}
