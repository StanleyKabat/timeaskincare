/**
 * i18n foundation config.
 *
 * Phase 1 only: this prepares the project for a future English version under
 * `/en`. The Slovak site stays the default and is completely unchanged.
 */

export const locales = ["sk", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sk";

/**
 * Locales that are actually published and safe to link to.
 *
 * Until the English pages exist, only Slovak is enabled. This keeps the
 * language switcher hidden and prevents exposing `/en` links that would 404.
 * When the English pages are ready, add "en" here to activate the switcher.
 */
export const enabledLocales: readonly Locale[] = ["sk"];

export function isLocaleEnabled(locale: Locale): boolean {
  return enabledLocales.includes(locale);
}

/** Detects the active locale purely from the pathname (no cookies/tracking). */
export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }

  return "sk";
}
