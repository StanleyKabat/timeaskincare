/**
 * Display-only English names for the canonical Slovak booking services.
 *
 * IMPORTANT: these are for display in the English booking form and in
 * English customer-facing emails/calendar only. The booking backend, API
 * payload, signed token and owner-facing emails keep the canonical Slovak
 * service names (the keys below) unchanged.
 */
export const bookingServiceNamesEn: Record<string, string> = {
  "Základné ošetrenie": "Basic skincare treatment",
  "Kompletné ošetrenie": "Complete skincare treatment",
  "Luxusné ošetrenie": "Luxury skincare treatment",
  "Úprava obočia": "Brow shaping",
  "Úprava a farbenie obočia": "Brow shaping and tinting",
  "Laminácia obočia": "Brow lamination",
  "Farbenie mihalníc": "Lash tinting",
  "Laminácia mihalníc": "Lash lift / lash lamination",
  "Laminácia obočia + laminácia mihalníc": "Brow + lash lamination package",
  "Depilácia hornej pery": "Upper lip waxing",
  "Depilácia brady": "Chin waxing",
  "Depilácia hornej pery + brady": "Upper lip + chin waxing",
  "Masáž tváre a dekoltu k základnému alebo kompletnému ošetreniu":
    "Face and décolleté massage add-on",
  "Darčekový poukaz": "Gift voucher",
};

/** Returns the English display name for a canonical service, or the input unchanged. */
export function toEnglishServiceName(canonicalName: string): string {
  return bookingServiceNamesEn[canonicalName] ?? canonicalName;
}

/** Maps a list of canonical service names to English display names. */
export function toEnglishServiceNames(canonicalNames: readonly string[]): string[] {
  return canonicalNames.map(toEnglishServiceName);
}
