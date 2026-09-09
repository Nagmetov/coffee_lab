import Link from "next/link";
import { Coffee, ExternalLink } from "lucide-react";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminSidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 flex-col border-r lg:flex">
      <div className="border-sidebar-border font-heading flex h-16 items-center gap-2 border-b px-4 text-lg font-semibold">
        <Coffee className="size-5" aria-hidden />
        CoffeeLab
      </div>
      <AdminNavLinks />
      <Link
        href="/"
        className="border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground flex items-center gap-2.5 border-t px-5 py-4 text-sm"
      >
        <ExternalLink className="size-4" aria-hidden />
        На сайт
      </Link>
    </aside>
  );
}
