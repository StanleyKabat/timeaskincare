"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/consent";
import { getLocaleFromPathname, isLocaleEnabled } from "@/lib/i18n/config";
import { getAlternate } from "@/lib/i18n/routes";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Small language switcher.
 *
 * It resolves the equivalent page in the other locale via the explicit route
 * map (never by string replacement). While the English version is not yet
 * published, the target locale is disabled in config, so this renders nothing
 * and the live Slovak site stays visually identical. Enabling "en" in
 * `lib/i18n/config.ts` makes it appear on both desktop and mobile.
 */
export function LanguageSwitcher({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const { locale, href } = getAlternate(pathname);

  if (!isLocaleEnabled(locale)) {
    return null;
  }

  // Label/aria come from the CURRENT page's dictionary, which describes the
  // language the control switches TO (sk page -> "EN", en page -> "SK").
  // The target `locale`/`href` above still drive the route and enabled check.
  const currentLocale = getLocaleFromPathname(pathname);
  const { languageSwitcher } = getDictionary(currentLocale);

  const handleClick = () => {
    trackEvent("language_switch", {
      locale: currentLocale,
      event_source: variant,
    });
    onNavigate?.();
  };

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        aria-label={languageSwitcher.ariaLabel}
        onClick={handleClick}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] px-4 text-sm font-semibold text-[rgba(247,241,235,0.9)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-powder)]"
      >
        {languageSwitcher.label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={languageSwitcher.ariaLabel}
      onClick={handleClick}
      className="hidden size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-xs font-semibold text-[var(--color-stone)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-charcoal)] sm:inline-flex"
    >
      {languageSwitcher.label}
    </Link>
  );
}
