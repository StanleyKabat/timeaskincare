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
  home: {
    hero: {
      headlineLines: ["Skincare that enhances", "your natural beauty"],
      subtitleLines: [
        "A calm, personal approach to skincare, brows and lashes —",
        "with attention to detail, comfort and natural results.",
      ],
      primaryCta: "Book an appointment",
      secondaryCta: "View services",
      benefitsAriaLabel: "Why Timea Skincare",
      benefits: ["Natural results", "Personal approach", "Premium products"],
      imageAlt:
        "Timea Skincare beauty salon with a treatment bed, shelves and professional equipment",
    },
    gallery: {
      title: "Salon gallery",
      intro: "A glimpse into the calm atmosphere of Timea Skincare.",
      cardAriaLabel: "Open the Timea Skincare salon gallery",
    },
    features: [
      "A personal approach based on your skin's needs",
      "A gentle, clean and professional treatment style",
      "Care for skin, brows, lashes and facial waxing",
    ],
    services: {
      eyebrow: "Services",
      title: "Treatments and services",
      text: "Choose a treatment focused on your skin, brows or lashes. If you are not sure what to choose, I will gladly help you find the right option.",
    },
    about: {
      eyebrow: "About me",
      heading: "A personal approach, precision and natural results",
      claim: "Precise. Natural. Personal. Calm.",
      intro:
        "My name is Tímea and I have been working in beauty care for more than two and a half years. For me, this work is a passion, a joy and something that truly fulfils me every day.",
      paragraphs: [
        "I have always been close to creative work, while also naturally enjoying caring for others. Beauty care connects these two worlds for me — attention to detail, aesthetics, gentleness and a personal approach to every client.",
        "My goal is for every client to feel comfortable, safe and relaxed. You do not need to feel embarrassed about your skin or about coming with a concern. I am here to help you find a suitable solution with care, precision and respect for your wishes.",
      ],
      moreLabel: "Read more",
      lessLabel: "Show less",
      ctaLabel: "Contact the salon",
    },
    reviews: {
      eyebrow: "Reviews",
      title: "Kind words from clients",
      text: "Genuine feedback from clients who valued precise work, a friendly approach and the calm atmosphere of the salon.",
      allButton: "View all reviews",
      note: "Reviews are translated from Slovak for easier understanding.",
    },
    cta: {
      heading: "Would you like to book a visit?",
      bookButton: "Book an appointment",
    },
  },
};
