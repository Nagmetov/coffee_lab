"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock, Coffee, MapPin, Phone, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type Category = { id: string; slug: string; name: string };

export function SiteHeader({ categories }: { categories: Category[] }) {
  const { data: user, isLoading } = useCurrentUser();
  const { data: cart } = useCart();
  const invalidateUser = useInvalidateCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();

  const secondaryLinks = [
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await invalidateUser();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-40">
      <div className="border-border/70 bg-secondary/60 text-muted-foreground hidden border-b px-4 py-1.5 text-xs sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3" aria-hidden />
            {t.contact.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3" aria-hidden />
            {t.contact.hours}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3" aria-hidden />
            {t.contact.phone}
          </span>
        </div>
      </div>

      <header className="border-border/70 bg-background/95 supports-backdrop-filter:bg-background/80 border-b shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-heading group flex items-center gap-2.5 text-lg font-semibold"
          >
            <span className="bg-primary/10 group-hover:bg-primary/15 flex size-9 items-center justify-center rounded-full transition-colors">
              <Coffee
                className="text-primary size-4.5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
                aria-hidden
              />
            </span>
            <span className="flex flex-col leading-none">
              CoffeeLab
              <span className="text-muted-foreground hidden text-[10px] font-normal tracking-wide whitespace-nowrap uppercase sm:block">
                Roastery &amp; Coffee Bar
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={isActive("/menu") ? "text-foreground" : "text-muted-foreground"}
                  >
                    {t.nav.menu}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-56 p-1">
                      <li>
                        <NavigationMenuLink render={<Link href="/menu" />} className="font-medium">
                          {t.menu.categoryAll}
                        </NavigationMenuLink>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id}>
                          <NavigationMenuLink
                            render={<Link href={`/menu?category=${category.slug}`} />}
                          >
                            {category.name}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-2.5 py-1.5 transition-colors",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="bg-primary absolute inset-x-2.5 -bottom-[calc(1px+0.5rem)] h-0.5 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <MobileNav categories={categories} />
            <LanguageToggle />
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              aria-label={t.nav.cart}
              className="relative transition-transform duration-200 active:scale-90"
              nativeButton={false}
              render={<Link href="/cart" />}
            >
              <ShoppingBag className="size-5" />
              {!!cart?.itemCount && (
                <span
                  key={cart.itemCount}
                  className="bg-accent text-accent-foreground animate-bump absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium"
                >
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
    </div>
  );
}
