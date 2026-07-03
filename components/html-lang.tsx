"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { getLocaleFromPathname } from "@/lib/i18n/config";

/**
 * Keeps <html lang> in sync with the active locale on the client.
 *
 * The root layout renders `lang="sk"` for SSR (correct for every Slovak route).
 * This effect updates it to the detected locale after navigation, so English
 * routes under `/en` report `lang="en"` without restructuring the root layout
 * or adding middleware.
 */
export function HtmlLang() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const locale = getLocaleFromPathname(pathname);
    document.documentElement.lang = locale;
  }, [pathname]);

  return null;
}
