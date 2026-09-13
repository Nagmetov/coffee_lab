"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, ShoppingBag, User } from "lucide-react";
import { useCurrentUser, useInvalidateCurrentUser } from "@/hooks/use-current-user";
import { useCart } from "@/hooks/use-cart";
import { useLocale } from "@/components/locale-provider";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: cart } = useCart();
  const invalidateUser = useInvalidateCurrentUser();
  const router = useRouter();
  const { t } = useLocale();

  const navLinks = [
    { href: "/menu", label: t.nav.menu },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await invalidateUser();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-border/70 bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading flex items-center gap-2 text-lg font-semibold"
        >
          <Coffee className="size-5" aria-hidden />
          CoffeeLab
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <MobileNav />
          <LanguageToggle />
          <ThemeToggle />
          <Button
            size="icon"
            variant="ghost"
            aria-label={t.nav.cart}
            className="relative"
            nativeButton={false}
            render={<Link href="/cart" />}
          >
            <ShoppingBag className="size-5" />
            {!!cart?.itemCount && (
              <span className="bg-accent text-accent-foreground absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                {cart.itemCount > 9 ? "9+" : cart.itemCount}
              </span>
            )}
          </Button>
          {!isLoading && !user && (
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/auth/login" />}
            >
              {t.nav.login}
            </Button>
          )}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({ size: "icon", variant: "ghost" })}
                aria-label={t.nav.profile}
              >
                <User className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    {t.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/orders" />}>
                    {t.nav.myOrders}
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      {t.nav.admin}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
