"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Menu, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocale } from "@/components/locale-provider";

type Category = { id: string; slug: string; name: string };

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const { t } = useLocale();

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
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>CoffeeLab</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          <SheetClose
            nativeButton={false}
            render={<Link href="/menu" />}
            className="hover:bg-muted rounded-md px-2 py-2.5 text-base font-medium"
          >
            {t.nav.menu}
          </SheetClose>
          <div className="flex flex-col gap-0.5 pl-4">
            {categories.map((category) => (
              <SheetClose
                key={category.id}
                nativeButton={false}
                render={<Link href={`/menu?category=${category.slug}`} />}
                className="hover:bg-muted text-muted-foreground rounded-md px-2 py-2 text-sm"
              >
                {category.name}
              </SheetClose>
            ))}
          </div>
          <SheetClose
            nativeButton={false}
            render={<Link href="/about" />}
            className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
          >
            {t.nav.about}
          </SheetClose>
          <SheetClose
            nativeButton={false}
            render={<Link href="/contact" />}
            className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
          >
            {t.nav.contact}
          </SheetClose>

          <div className="bg-border my-2 h-px" />
          {user ? (
            <>
              <SheetClose
                nativeButton={false}
                render={<Link href="/profile" />}
                className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-2.5 text-base"
              >
                <User className="size-4" /> {t.nav.profile}
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Link href="/orders" />}
                className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
              >
                {t.nav.myOrders}
              </SheetClose>
            </>
          ) : (
            <SheetClose
              nativeButton={false}
              render={<Link href="/auth/login" />}
              className="hover:bg-muted rounded-md px-2 py-2.5 text-base"
            >
              {t.nav.login}
            </SheetClose>
          )}
        </nav>

        <div className="border-border/70 text-muted-foreground space-y-1.5 border-t px-4 py-4 text-xs">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {t.contact.address}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="size-3 shrink-0" aria-hidden />
            {t.contact.hours}
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0" aria-hidden />
            {t.contact.phone}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
