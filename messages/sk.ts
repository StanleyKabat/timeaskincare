/**
 * Slovak UI dictionary (foundation for future localization).
 *
 * Values mirror the current visible Slovak text 1:1. Nothing here changes the
 * live site yet; it is the shared source that locale-aware components can read
 * once the English version is built.
 */
export const sk = {
  nav: {
    home: "Domov",
    services: "Služby",
    about: "O mne",
    gallery: "Galéria",
    pricing: "Cenník",
    contact: "Kontakt",
    privacy: "Ochrana osobných údajov",
  },
  header: {
    brandTagline: "Krása, ktorá vyžaruje teba",
    brandAriaLabel: "Timea Skincare - domov",
    booking: "Online rezervácia",
    openMenu: "Otvoriť menu",
    closeMenu: "Zavrieť menu",
    mainNav: "Hlavná navigácia",
    mobileNav: "Mobilná navigácia",
  },
  footer: {
    tagline: "Jemná a profesionálna starostlivosť o pleť v Novej Bani.",
    navHeading: "Navigácia",
    contactHeading: "Kontakt",
    socialHeading: "Sociálne siete",
    rights: "Všetky práva vyhradené.",
  },
  social: {
    instagram: "Instagram Timea Skincare (otvorí sa v novom okne)",
    facebook: "Facebook Timea Skincare (otvorí sa v novom okne)",
  },
  languageSwitcher: {
    /** Label shown on the control (the language it switches TO). */
    label: "EN",
    ariaLabel: "Prepnúť na angličtinu",
  },
  home: {
    hero: {
      headlineLines: ["Starostlivosť, ktorá", "nechá vyniknúť tvoju", "prirodzenosť"],
      subtitleLines: [
        "Profesionálna starostlivosť o pleť, obočie a mihalnice",
        "v príjemnom prostredí, kde sa krása stáva rituálom.",
      ],
      primaryCta: "Rezervovať termín",
      secondaryCta: "Pozrieť služby",
      benefitsAriaLabel: "Prečo Timea Skincare",
      benefits: ["Prirodzené výsledky", "Individuálny prístup", "Prémiové produkty"],
      imageAlt:
        "Kozmetický salón Timea Skincare s kozmetickým lôžkom, policami a profesionálnou výbavou",
    },
    gallery: {
      title: "Galéria salónu",
      intro: "Priestor, atmosféra a detaily salónu Timea Skincare.",
      cardAriaLabel: "Otvoriť galériu salónu Timea Skincare",
    },
    features: [
      "Individuálny prístup podľa potrieb pleti",
      "Jemný, čistý a profesionálny štýl ošetrenia",
      "Služby pre pleť, obočie, mihalnice aj depiláciu tváre",
    ],
    services: {
      eyebrow: "Služby",
      title: "Starostlivosť, ktorá rešpektuje tvoju pleť",
      text: "Vybrané služby sú postavené na prirodzenom výsledku, pokojnom priebehu a jasnej komunikácii pred ošetrením.",
    },
    about: {
      eyebrow: "O mne",
      heading: "Kozmetika v Novej Bani s osobným prístupom",
      claim: "Precízny. Prirodzený. Osobný. Pokojný.",
      intro:
        "Volám sa Tímea a kozmetike sa venujem už viac ako dva a pol roka. Je to pre mňa vášeň, radosť a práca, ktorá ma napĺňa každý deň.",
      paragraphs: [
        "Vždy som mala blízko ku kreatívnej a tvorivej práci, no zároveň ma prirodzene bavila starostlivosť o druhých. Práve kozmetika pre mňa spája cit pre detail, estetiku, jemnosť a osobný prístup ku každej zákazníčke.",
        "Pri práci je pre mňa najdôležitejšia precíznosť, prirodzený výsledok a spokojnosť zákazníčky. Každej venujem svoj čas a pozornosť, pretože chcem, aby návšteva u mňa bola nielen o výsledku, ale aj o príjemnom pocite, oddychu a dôvere.",
        "U mňa sa nemusíš hanbiť za svoju pleť ani za to, že prichádzaš s problémom. Som tu na to, aby som ti pomohla nájsť vhodné riešenie jemne, precízne a s rešpektom k tomu, čo si praješ.",
      ],
      moreLabel: "Prečítať si viac",
      lessLabel: "Zobraziť menej",
      ctaLabel: "Kontaktovať salón",
    },
    reviews: {
      eyebrow: "Recenzie",
      title: "Skúsenosti zákazníčok",
      text: "Reálne spätné väzby od zákazníčok, ktoré ocenili precíznu prácu, príjemný prístup a pokojné prostredie salónu.",
      allButton: "Pozrieť všetky recenzie",
      note: "",
    },
    cta: {
      heading: "Dohodni si termín, ktorý ti bude vyhovovať.",
      bookButton: "Rezervovať",
    },
  },
} as const;

/**
 * Widens the Slovak reference dictionary so other locales can provide their own
 * translated string values, while the key structure is still enforced. Missing
 * keys, extra keys, or wrong-shaped values remain type errors.
 *
 * - string literals (e.g. "Domov") widen to `string` (so "Home" is valid),
 * - string tuples/arrays widen to `readonly string[]`,
 * - nested objects widen recursively,
 * - other value types are preserved.
 */
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

export type Dictionary = WidenStrings<typeof sk>;
