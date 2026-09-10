"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // resolvedTheme is only known after hydration (it depends on the client's
  // system preference / localStorage), so render a neutral placeholder
  // first to avoid a server/client markup mismatch.
  useEffect(() => setMounted(true), []);

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
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
