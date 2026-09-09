"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/use-current-user";

const NAV_LINKS = [
  { href: "/menu", label: "Меню" },
  { href: "/about", label: "О нас" },
  { href: "/contact", label: "Контакты" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: user } = useCurrentUser();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Открыть меню"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>CoffeeLab</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <SheetClose
              key={link.href}
              nativeButton={false}
              render={<Link href={link.href} />}
              className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
            >
              {link.label}
            </SheetClose>
          ))}
          <div className="bg-border my-2 h-px" />
          {user ? (
            <>
              <SheetClose
                nativeButton={false}
                render={<Link href="/profile" />}
                className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-2.5 text-base"
              >
                <User className="size-4" /> Профиль
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Link href="/orders" />}
                className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
              >
                Мои заказы
              </SheetClose>
            </>
          ) : (
            <SheetClose
              nativeButton={false}
              render={<Link href="/auth/login" />}
              className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
            >
              Войти
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
