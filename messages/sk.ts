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
  languageSwitcher: {
    /** Label shown on the control (the language it switches TO). */
    label: "EN",
    ariaLabel: "Prepnúť na angličtinu",
  },
} as const;

export type Dictionary = typeof sk;
