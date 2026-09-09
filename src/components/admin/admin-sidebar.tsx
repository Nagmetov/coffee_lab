"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tag,
  Coffee,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/customers", label: "Клиенты", icon: Users },
  { href: "/admin/promotions", label: "Промокоды", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground flex w-56 shrink-0 flex-col border-r">
      <div className="border-sidebar-border font-heading flex h-16 items-center gap-2 border-b px-4 text-lg font-semibold">
        <Coffee className="size-5" aria-hidden />
        CoffeeLab
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
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
