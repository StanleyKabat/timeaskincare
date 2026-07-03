import { getLocaleFromPathname, type Locale } from "@/lib/i18n/config";

/**
 * Canonical page identifiers shared across locales. Each key maps to an
 * explicit path per locale, so the language switcher never guesses routes by
 * string replacement.
 */
export type PageKey =
  | "home"
  | "services"
  | "pricing"
  | "gallery"
  | "reviews"
  | "contact"
  | "privacy";

export const routeMap: Record<PageKey, Record<Locale, string>> = {
  home: { sk: "/", en: "/en" },
  services: { sk: "/sluzby", en: "/en/services" },
  pricing: { sk: "/cennik", en: "/en/pricing" },
  gallery: { sk: "/galeria", en: "/en/gallery" },
  reviews: { sk: "/recenzie", en: "/en/reviews" },
  contact: { sk: "/kontakt", en: "/en/contact" },
  privacy: { sk: "/ochrana-osobnych-udajov", en: "/en/privacy-policy" },
};

const pageKeys = Object.keys(routeMap) as PageKey[];

function normalizePathname(pathname: string): string {
  const [pathOnly] = pathname.split(/[?#]/);
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    return pathOnly.slice(0, -1);
  }
  return pathOnly;
}

/** Finds the canonical page key for a given pathname in the given locale. */
export function findPageKey(pathname: string, locale: Locale): PageKey | null {
  const path = normalizePathname(pathname);
  return pageKeys.find((key) => routeMap[key][locale] === path) ?? null;
}

/** Returns the localized path for a page key. */
export function getLocalizedPath(key: PageKey, locale: Locale): string {
  return routeMap[key][locale];
}

/**
 * Given the current pathname, returns the target locale and the equivalent
 * path in that locale. Pages without an explicit mapping fall back to the
 * target locale's homepage, so the switcher can never produce a dead link.
 */
export function getAlternate(pathname: string): { locale: Locale; href: string } {
  const currentLocale = getLocaleFromPathname(pathname);
  const targetLocale: Locale = currentLocale === "sk" ? "en" : "sk";
  const key = findPageKey(pathname, currentLocale);
  const href = key ? routeMap[key][targetLocale] : routeMap.home[targetLocale];

  return { locale: targetLocale, href };
}
