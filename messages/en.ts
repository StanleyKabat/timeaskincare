import type { Dictionary } from "@/messages/sk";

/**
 * English UI dictionary (foundation for the future `/en` version).
 *
 * Not yet used by any published page. It exists so locale-aware components and
 * the upcoming English routes have a ready translation source.
 */
export const en: Dictionary = {
  nav: {
    home: "Home",
    services: "Services",
    about: "About me",
    gallery: "Gallery",
    pricing: "Pricing",
    contact: "Contact",
    privacy: "Privacy policy",
  },
  header: {
    brandTagline: "Beauty that radiates you",
    booking: "Online booking",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
  },
  footer: {
    tagline: "Gentle and professional skincare in Nová Baňa.",
    navHeading: "Navigation",
    contactHeading: "Contact",
    socialHeading: "Social media",
    rights: "All rights reserved.",
  },
  languageSwitcher: {
    label: "SK",
    ariaLabel: "Switch to Slovak",
  },
};
