"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { LOCALE_COOKIE } from "@/i18n/config";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const router = useRouter();
  const { locale } = useLocale();
  const [pending, setPending] = useState(false);

  function toggle() {
    const next = locale === "ru" ? "en" : "ru";
    setPending(true);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
    setPending(false);
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      aria-label={locale === "ru" ? "Switch to English" : "Переключить на русский"}
      onClick={toggle}
      disabled={pending}
    >
      {locale === "ru" ? "EN" : "RU"}
    </Button>
  );
}
