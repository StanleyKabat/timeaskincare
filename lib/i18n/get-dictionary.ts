import { type Locale } from "@/lib/i18n/config";
import { sk, type Dictionary } from "@/messages/sk";
import { en } from "@/messages/en";

const dictionaries: Record<Locale, Dictionary> = { sk, en };

/** Returns the UI dictionary for a locale, falling back to Slovak. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.sk;
}
