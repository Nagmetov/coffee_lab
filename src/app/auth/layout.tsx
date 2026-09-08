import Link from "next/link";
import { Coffee } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="font-heading text-foreground mb-8 flex items-center gap-2 text-xl font-semibold"
      >
        <Coffee className="size-6" aria-hidden />
        CoffeeLab
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
