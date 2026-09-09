"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { useCurrentUser, useInvalidateCurrentUser } from "@/hooks/use-current-user";

export function AdminHeader() {
  const { data: user } = useCurrentUser();
  const invalidateUser = useInvalidateCurrentUser();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await invalidateUser();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-border flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Открыть меню"
          className="lg:hidden"
          onClick={() => setNavOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-sidebar-border flex-row items-center gap-2 border-b">
            <Coffee className="size-5" aria-hidden />
            <SheetTitle>CoffeeLab</SheetTitle>
          </SheetHeader>
          <div className="bg-sidebar text-sidebar-foreground flex-1">
            <AdminNavLinks onNavigate={() => setNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground hidden sm:inline">{user?.name}</span>
        <Button size="sm" variant="ghost" nativeButton={false} render={<Link href="/" />}>
          На сайт
        </Button>
        <Button variant="ghost" size="icon" aria-label="Выйти" onClick={handleLogout}>
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
