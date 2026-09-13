"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function subscribeNever() {
  return () => {};
}

// resolvedTheme is only known after hydration (it depends on the client's
// system preference / localStorage), so render a neutral placeholder on the
// server and the first client render, then swap in the real icon.
function useMounted() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button size="icon" variant="ghost" aria-label="Переключить тему" disabled>
        <Sun className="size-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className="overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun key="sun" className="animate-in zoom-in-50 spin-in-45 size-5 duration-300" />
      ) : (
        <Moon key="moon" className="animate-in zoom-in-50 spin-in-45 size-5 duration-300" />
      )}
    </Button>
  );
}
