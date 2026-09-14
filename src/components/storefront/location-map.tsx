import { ExternalLink } from "lucide-react";

// Illustrative coordinates near central Moscow — the seeded address ("ул.
// Кофейная, 12") is a demo placeholder, not a real street, so this pin is
// approximate rather than tied to an actual location.
const LAT = 55.7601;
const LON = 37.6186;
const BBOX = `${LON - 0.008}%2C${LAT - 0.004}%2C${LON + 0.008}%2C${LAT + 0.004}`;

export function LocationMap({ openInMapsLabel }: { openInMapsLabel: string }) {
  return (
    <div className="space-y-2">
      <div className="border-border/70 aspect-video overflow-hidden rounded-xl border">
        <iframe
          title="CoffeeLab on the map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${LAT}%2C${LON}`}
          className="size-full grayscale-[30%] contrast-[1.05]"
          loading="lazy"
        />
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${LAT}&mlon=${LON}#map=16/${LAT}/${LON}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
      >
        {openInMapsLabel}
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}
