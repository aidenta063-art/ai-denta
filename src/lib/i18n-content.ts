import type { Locale } from "@/i18n/routing";

/** Picks the field matching the active locale from a bilingual pair. */
export function localized<T>(
  locale: Locale,
  en: T,
  ar: T,
): T {
  return locale === "ar" ? ar : en;
}
