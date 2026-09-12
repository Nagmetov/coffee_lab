import Image from "next/image";
import { cn } from "@/lib/utils";

const ACCENTS = ["var(--primary)", "var(--accent)", "var(--chart-2)"];

/** Small deterministic hash so the same product always gets the same variant. */
function pickVariant(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

function CoffeeCupArt({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <path
        d="M35 30c-3-6-1-11 4-14M48 30c-2-8 1-13 6-15"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse cx="42" cy="72" rx="26" ry="5" fill={accent} opacity="0.12" />
      <path
        d="M22 40h38l-3 30a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z"
        fill="var(--card)"
        stroke={accent}
        strokeWidth="2.5"
      />
      <path
        d="M60 45h6a7 7 0 0 1 0 14h-7"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
      />
      <ellipse cx="41" cy="41" rx="19" ry="4" fill={accent} opacity="0.85" />
    </svg>
  );
}

function BeansBagArt({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ellipse cx="50" cy="78" rx="24" ry="5" fill={accent} opacity="0.12" />
      <path
        d="M30 34h40l4 38a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10z"
        fill="var(--card)"
        stroke={accent}
        strokeWidth="2.5"
      />
      <path
        d="M34 34c-2-8 2-16 16-16s18 8 16 16"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
      />
      <rect x="41" y="42" width="18" height="12" rx="2" fill={accent} opacity="0.85" />
      {[
        [40, 66],
        [52, 70],
        [63, 63],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="5"
            ry="3.5"
            fill={accent}
            opacity="0.5"
            transform={`rotate(${i * 35} ${cx} ${cy})`}
          />
        </g>
      ))}
    </svg>
  );
}

function DessertArt({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
      <ellipse cx="52" cy="72" rx="26" ry="6" fill="var(--card)" stroke={accent} strokeWidth="2.5" />
      <path
        d="M34 68 34 30 74 68Z"
        fill={accent}
        opacity="0.85"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M34 46h17M34 58h30" stroke="var(--card)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="26" r="4" fill={accent} />
    </svg>
  );
}

const ART: Record<string, (props: { accent: string }) => React.JSX.Element> = {
  napitki: CoffeeCupArt,
  zerno: BeansBagArt,
  deserty: DessertArt,
};

const GRADIENTS: Record<string, string> = {
  napitki: "from-primary/20 via-primary/8 to-transparent",
  zerno: "from-accent/25 via-accent/8 to-transparent",
  deserty: "from-secondary via-secondary/40 to-transparent",
};

/**
 * Renders an uploaded product photo when one exists (see the admin image
 * manager); otherwise falls back to a bespoke category illustration on a
 * tinted backdrop so the grid never shows a broken <img>. `seed` (e.g. the
 * product slug) picks a deterministic accent for the fallback so items in
 * the same category aren't visually identical.
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

  const Art = ART[categorySlug] ?? CoffeeCupArt;
  const gradient = GRADIENTS[categorySlug] ?? GRADIENTS.napitki;
  const accent = ACCENTS[pickVariant(seed ?? categorySlug, ACCENTS.length)];

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br p-6",
        gradient,
        className,
      )}
    >
      <Art accent={accent} />
    </div>
  );
}
