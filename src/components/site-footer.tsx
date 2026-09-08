import Link from "next/link";
import { Coffee } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-border/70 bg-muted/30 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="font-heading text-foreground flex items-center gap-2 text-base font-semibold">
          <Coffee className="size-5" aria-hidden />
          CoffeeLab
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/menu" className="hover:text-foreground">
            Меню
          </Link>
          <Link href="/about" className="hover:text-foreground">
            О нас
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Контакты
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} CoffeeLab. Все права защищены.</p>
      </div>
    </footer>
  );
}
