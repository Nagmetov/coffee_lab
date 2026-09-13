import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { ru } from "./dictionaries/ru";
import { en } from "./dictionaries/en";

export type { Dictionary } from "./dictionaries/ru";

const dictionaries = { ru, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
