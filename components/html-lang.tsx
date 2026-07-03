"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { getLocaleFromPathname } from "@/lib/i18n/config";

/**
 * Keeps <html lang> in sync with the active locale during client-side navigation.
 *
 * The root layout now renders the correct `lang` on the server (via the
 * `x-pathname` header set in middleware), so the initial HTML is already correct
 * for crawlers and screen readers. The root layout does not re-render on
 * client-side (SPA) navigation, so this harmless effect keeps `<html lang>` in
 * sync when the user navigates between Slovak and English routes.
 */
export function HtmlLang() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const locale = getLocaleFromPathname(pathname);
    document.documentElement.lang = locale;
  }, [pathname]);

  return null;
}
