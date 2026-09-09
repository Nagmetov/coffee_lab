"use client";

import { useEffect } from "react";

/**
 * Popovers/dialogs/selects (Base UI) portal straight to document.body, so
 * they land outside the .theme-admin.dark wrapper div and pick up the
 * storefront's light theme instead. Stamping the same classes on <body>
 * while an admin page is mounted lets portaled content inherit the right
 * CSS variables too, without having to pass a portal container to every
 * primitive individually.
 */
export function AdminThemeScope() {
  useEffect(() => {
    document.body.classList.add("theme-admin", "dark");
    return () => {
      document.body.classList.remove("theme-admin", "dark");
    };
  }, []);

  return null;
}
