import Image from "next/image";
import { cn } from "@/lib/utils";

const ACCENTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Small deterministic hash so the same product always gets the same variant. */
function pickVariant(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

type ArtProps = { accent: string; id: string };

/**
 * Shared gradient defs so every illustration reads as lit from one direction
 * instead of flat-filled shapes. `id` scopes the gradients to one product
 * (its slug, or the category slug for the generic fallback) so multiple
 * thumbnails on one page don't fight over the same <linearGradient> id.
 */
function ArtDefs({ id, accent }: { id: string; accent: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--card)" />
        <stop offset="100%" stopColor="color-mix(in oklch, var(--card), var(--foreground) 12%)" />
      </linearGradient>
      <radialGradient id={`${id}-liquid`} cx="32%" cy="28%" r="80%">
        <stop offset="0%" stopColor={`color-mix(in oklch, ${accent}, white 40%)`} />
        <stop offset="100%" stopColor={`color-mix(in oklch, ${accent}, black 22%)`} />
      </radialGradient>
      <radialGradient id={`${id}-bean`} cx="30%" cy="22%" r="85%">
        <stop offset="0%" stopColor={`color-mix(in oklch, ${accent}, white 48%)`} />
        <stop offset="100%" stopColor={`color-mix(in oklch, ${accent}, black 28%)`} />
      </radialGradient>
    </defs>
  );
}

function Steam({
  x,
  accent,
  opacity = 0.55,
}: {
  x: number;
  accent: string;
  opacity?: number | string;
}) {
  return (
    <path
      d={`M${x} 30c-3-6-1-11 4-14M${x + 13} 30c-2-8 1-13 6-15`}
      fill="none"
      stroke={accent}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

function Shadow({ cx, rx = 26 }: { cx: number; rx?: number }) {
  return <ellipse cx={cx} cy="78" rx={rx} ry="5" fill="var(--foreground)" opacity="0.08" />;
}

function Saucer({ cx, rx = 19 }: { cx: number; rx?: number }) {
  return (
    <ellipse
      cx={cx}
      cy="78"
      rx={rx}
      ry="4"
      fill="none"
      stroke="var(--border)"
      strokeWidth="1.5"
      opacity="0.7"
    />
  );
}

/** Small glassy streak that reads as a reflection on ceramic in both themes. */
function Gloss({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.28" />;
}

// ---------- Drinks ----------

function EspressoArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Steam x={41} accent={accent} opacity="0.4" />
      <Shadow cx={50} rx={20} />
      <Saucer cx={50} rx={20} />
      <path
        d="M36 52h28l-2 16a5 5 0 0 1-5 4H43a5 5 0 0 1-5-4z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path d="M64 55h4a5 5 0 0 1 0 10h-4" fill="none" stroke={accent} strokeWidth="2.5" />
      <ellipse cx="50" cy="52" rx="14" ry="3.5" fill={`url(#${id}-liquid)`} />
      <Gloss d="M39 55c0 5 0 9 1 12" />
    </svg>
  );
}

function CappuccinoArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Steam x={35} accent={accent} />
      <Steam x={48} accent={accent} opacity="0.35" />
      <Shadow cx={42} />
      <Saucer cx={42} rx={22} />
      <path
        d="M22 42h38l-3 28a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path d="M60 47h6a7 7 0 0 1 0 14h-7" fill="none" stroke={accent} strokeWidth="2.5" />
      <ellipse cx="41" cy="43" rx="19" ry="4" fill={`url(#${id}-liquid)`} />
      <path
        d="M35 42c2-3 5-3 6 0s4 3 6 0 5-3 6 0"
        fill="none"
        stroke="var(--card)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Gloss d="M26 46c-1 6-1 12 1 17" />
    </svg>
  );
}

function LatteArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Steam x={40} accent={accent} opacity="0.4" />
      <Shadow cx={44} rx={20} />
      <Saucer cx={44} rx={21} />
      <path
        d="M32 34h26l-2 40a5 5 0 0 1-5 5H39a5 5 0 0 1-5-5z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path d="M31 52h27" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="45" cy="35" rx="13" ry="3.5" fill={`url(#${id}-liquid)`} />
      <path
        d="M45 34c0 4-4 4-4 7s4 4 4 4"
        fill="none"
        stroke="var(--card)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Gloss d="M35 38c-1 10-1 20 1 30" />
    </svg>
  );
}

function RafArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Steam x={44} accent={accent} opacity="0.4" />
      <Shadow cx={48} />
      <Saucer cx={48} rx={22} />
      <path
        d="M30 36h36l-3 38a6 6 0 0 1-6 5H39a6 6 0 0 1-6-5z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path
        d="M30 36c3 3 7 4 18 4s15-1 18-4"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M60 20l4 20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <Gloss d="M34 42c-1 10-1 20 1 30" />
    </svg>
  );
}

function AmericanoArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Steam x={35} accent={accent} opacity="0.5" />
      <Steam x={48} accent={accent} opacity="0.3" />
      <Shadow cx={42} />
      <Saucer cx={42} rx={22} />
      <path
        d="M22 42h38l-3 28a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path d="M60 47h6a7 7 0 0 1 0 14h-7" fill="none" stroke={accent} strokeWidth="2.5" />
      <ellipse cx="41" cy="44" rx="17" ry="3.5" fill={`url(#${id}-liquid)`} />
      <Gloss d="M26 47c-1 6-1 13 1 18" />
    </svg>
  );
}

function FilterCoffeeArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Shadow cx={50} rx={20} />
      <Saucer cx={50} rx={20} />
      <path
        d="M38 60h24l-2 14a5 5 0 0 1-5 4H45a5 5 0 0 1-5-4z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path
        d="M33 34h34l-6 20a4 4 0 0 1-4 3H43a4 4 0 0 1-4-3z"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="58" r="1.8" fill={`url(#${id}-liquid)`} />
      <circle cx="47" cy="53" r="1.4" fill={`url(#${id}-liquid)`} opacity="0.7" />
      <Gloss d="M40 62c0 4 0 8 1 12" />
    </svg>
  );
}

// ---------- Beans ----------

function makeBeansArt(tag: "round" | "rect" | "star", density: number) {
  return function BeansArt({ accent, id }: ArtProps) {
    return (
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
        <ArtDefs id={id} accent={accent} />
        <Shadow cx={50} rx={24} />
        <path
          d="M30 34h40l4 38a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10z"
          fill={`url(#${id}-surface)`}
          stroke={accent}
          strokeWidth="2.5"
        />
        <path
          d="M34 34c-2-8 2-16 16-16s18 8 16 16"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
        />
        <rect x="41" y="30" width="18" height="5" rx="2" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6" />
        <circle cx="50" cy="32.5" r="1.6" fill={accent} opacity="0.7" />
        {tag === "rect" && (
          <rect x="41" y="42" width="18" height="12" rx="2" fill={`url(#${id}-liquid)`} />
        )}
        {tag === "round" && <circle cx="50" cy="47" r="8" fill={`url(#${id}-liquid)`} />}
        {tag === "star" && (
          <path d="M50 38l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={`url(#${id}-liquid)`} />
        )}
        {[
          [38, 64],
          [50, 68],
          [62, 62],
          [46, 58],
        ]
          .slice(0, density)
          .map(([cx, cy], i) => (
            <g key={i} transform={`rotate(${i * 35} ${cx} ${cy})`}>
              <ellipse cx={cx} cy={cy} rx="5" ry="3.5" fill={`url(#${id}-bean)`} />
              <path
                d={`M${cx - 3.5} ${cy}q3.5 -2 7 0`}
                fill="none"
                stroke={`color-mix(in oklch, ${accent}, black 35%)`}
                strokeWidth="0.8"
                opacity="0.6"
              />
            </g>
          ))}
        <Gloss d="M34 40c-1 10-1 22 1 34" />
      </svg>
    );
  };
}

// ---------- Desserts ----------

function CheesecakeArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Shadow cx={50} rx={28} />
      <ellipse cx="50" cy="74" rx="27" ry="6" fill={`url(#${id}-surface)`} stroke={accent} strokeWidth="2.5" />
      <path
        d="M30 68v-16a20 8 0 0 1 40 0v16a20 8 0 0 1-40 0"
        fill={`url(#${id}-liquid)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <ellipse cx="50" cy="52" rx="20" ry="8" fill={`url(#${id}-bean)`} />
      <circle cx="50" cy="46" r="4" fill={accent} />
      <path d="M50 42v-5M47 39l2 3M53 39l-2 3" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <Gloss d="M35 56c0 4 1 8 3 11" />
    </svg>
  );
}

function TiramisuArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Shadow cx={50} rx={22} />
      <ellipse cx="50" cy="76" rx="20" ry="4.5" fill={`url(#${id}-surface)`} stroke={accent} strokeWidth="2.5" />
      <path
        d="M36 30h28l3 40a4 4 0 0 1-4 4H37a4 4 0 0 1-4-4z"
        fill={`url(#${id}-surface)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <rect x="34.5" y="40" width="31" height="7" fill={`url(#${id}-liquid)`} opacity="0.85" />
      <rect x="35.5" y="52" width="29" height="7" fill={`url(#${id}-liquid)`} opacity="0.7" />
      <rect x="37" y="64" width="26" height="6" fill={`url(#${id}-liquid)`} opacity="0.55" />
      {[
        [42, 34],
        [50, 32],
        [58, 35],
        [46, 37],
        [54, 38],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill={accent} opacity="0.8" />
      ))}
      <Gloss d="M39 44c0 8 0 16 1 24" />
    </svg>
  );
}

function CroissantArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Shadow cx={50} />
      <path
        d="M24 58c4-20 20-30 38-26 10 2 16 10 18 18-8-6-16-8-24-6-14 3-22 12-24 22-4-2-7-5-8-8z"
        fill={`url(#${id}-liquid)`}
        stroke={accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 46c6-8 14-13 22-13M30 56c8-9 18-15 28-15"
        fill="none"
        stroke="var(--card)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {[
        [46, 40],
        [56, 46],
        [40, 52],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="2" ry="1.2" fill="var(--card)" opacity="0.9" />
      ))}
      <Gloss d="M30 50c4-8 10-14 17-17" />
    </svg>
  );
}

function BrownieArt({ accent, id }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ArtDefs id={id} accent={accent} />
      <Shadow cx={50} rx={24} />
      <ellipse cx="50" cy="76" rx="22" ry="4.5" fill={`url(#${id}-surface)`} stroke={accent} strokeWidth="2.5" />
      <rect
        x="32"
        y="38"
        width="36"
        height="32"
        rx="4"
        fill={`url(#${id}-bean)`}
        stroke={accent}
        strokeWidth="2.5"
      />
      <path
        d="M36 46h28M35 54h30M37 62h26"
        stroke="var(--card)"
        strokeWidth="1.4"
        opacity="0.35"
      />
      <ellipse cx="58" cy="44" rx="6" ry="4" fill={`url(#${id}-surface)`} />
      <ellipse cx="58" cy="44" rx="6" ry="4" fill="none" stroke={accent} strokeWidth="1.5" />
      <Gloss d="M36 42c-1 8-1 16 1 24" />
    </svg>
  );
}

const PRODUCT_ART: Record<string, (props: ArtProps) => React.JSX.Element> = {
  espresso: EspressoArt,
  cappuccino: CappuccinoArt,
  latte: LatteArt,
  raf: RafArt,
  americano: AmericanoArt,
  "filter-coffee": FilterCoffeeArt,
  "ethiopia-yirgacheffe": makeBeansArt("round", 2),
  "colombia-supremo": makeBeansArt("rect", 3),
  "brazil-santos": makeBeansArt("rect", 4),
  "coffeelab-blend-1": makeBeansArt("star", 4),
  "cheesecake-newyork": CheesecakeArt,
  tiramisu: TiramisuArt,
  "croissant-almond": CroissantArt,
  "brownie-pecan": BrownieArt,
};

const CATEGORY_ART: Record<string, (props: ArtProps) => React.JSX.Element> = {
  napitki: CappuccinoArt,
  zerno: makeBeansArt("rect", 3),
  deserty: CheesecakeArt,
};

const GRADIENTS: Record<string, string> = {
  napitki: "from-primary/20 via-primary/8 to-transparent",
  zerno: "from-accent/25 via-accent/8 to-transparent",
  deserty: "from-secondary via-secondary/40 to-transparent",
};

/**
 * Renders an uploaded product photo when one exists (see the admin image
 * manager); otherwise falls back to a bespoke illustration on a tinted
 * backdrop so the grid never shows a broken <img>. Known seed-catalog slugs
 * get their own hand-drawn illustration (a cappuccino doesn't look like a
 * filter coffee); anything else — a future admin-added product — falls back
 * to a category-level illustration with a deterministic accent from `seed`.
 */
export function ProductThumb({
  categorySlug,
  seed,
  imageUrl,
  className,
}: {
  categorySlug: string;
  seed?: string;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div
        className={cn("relative aspect-square overflow-hidden rounded-lg", className)}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 20vw, 40vw"
          className="object-cover"
        />
      </div>
    );
  }

  const Art = (seed ? PRODUCT_ART[seed] : undefined) ?? CATEGORY_ART[categorySlug] ?? CappuccinoArt;
  const gradient = GRADIENTS[categorySlug] ?? GRADIENTS.napitki;
  const artId = seed ?? categorySlug;
  const accent = ACCENTS[pickVariant(artId, ACCENTS.length)];

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br p-6",
        gradient,
        className,
      )}
    >
      <Art accent={accent} id={artId} />
    </div>
  );
}
