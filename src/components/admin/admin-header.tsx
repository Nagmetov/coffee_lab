"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useInvalidateCurrentUser } from "@/hooks/use-current-user";

export function AdminHeader() {
  const { data: user } = useCurrentUser();
  const invalidateUser = useInvalidateCurrentUser();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await invalidateUser();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-border flex h-16 items-center justify-end border-b px-6">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">{user?.name}</span>
        <Button variant="ghost" size="icon" aria-label="Выйти" onClick={handleLogout}>
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
