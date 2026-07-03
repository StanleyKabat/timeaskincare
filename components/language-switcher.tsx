"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isLocaleEnabled } from "@/lib/i18n/config";
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

  const { languageSwitcher } = getDictionary(locale);

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        aria-label={languageSwitcher.ariaLabel}
        onClick={onNavigate}
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
      onClick={onNavigate}
      className="hidden size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-xs font-semibold text-[var(--color-stone)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-charcoal)] sm:inline-flex"
    >
      {languageSwitcher.label}
    </Link>
  );
}
