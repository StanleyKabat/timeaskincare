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
 * Locales that have at least one published page and are safe to link to. The
 * English homepage (`/en`) is live, so the switcher is active. Slovak remains
 * the default; English subpages are added in later phases.
 */
export const enabledLocales: readonly Locale[] = ["sk", "en"];

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
