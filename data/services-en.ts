/**
 * English display data for the `/en/services` page.
 *
 * IMPORTANT: `canonical` holds the exact Slovak service name used by the
 * booking system (`bookableServices`) and must never change — it is only used
 * to look up the correct duration. `name`/`details` are display-only English
 * labels and do not affect any booking submission.
 */
export type EnServiceItem = {
  canonical: string;
  name: string;
  details?: string[];
};

export type EnServiceGroup = {
  title: string;
  description: string;
  services: EnServiceItem[];
};

export const enServicesIntro = {
  eyebrow: "Services",
  title: "Treatments tailored to your skin, brows and lashes",
  text: "Choose from skincare treatments, brow and lash services, facial waxing or a gift voucher. If you are not sure which service is right for you, I will gladly help you choose the best option.",
};

export const enServicesCta = {
  eyebrow: "Booking",
  title: "Not sure which service to choose?",
  text: "If you are not sure which service is right for you, feel free to write to me. I will gladly recommend the best option based on your skin's needs.",
  button: "Book an appointment",
};

export const enServicesIncludesLabel = "Includes";

export const enServiceGroups: EnServiceGroup[] = [
  {
    title: "Skincare treatments",
    description:
      "Treatments are tailored to your skin type and its current needs — to cleanse, refresh and hydrate the skin.",
    services: [
      {
        canonical: "Základné ošetrenie",
        name: "Basic skincare treatment",
        details: [
          "surface cleansing",
          "deep cleansing",
          "use of device attachments",
          "mask, serums and cream",
        ],
      },
      {
        canonical: "Kompletné ošetrenie",
        name: "Complete skincare treatment",
        details: [
          "surface cleansing",
          "deep cleansing",
          "use of device attachments",
          "application of active ingredients",
          "mask, serums and cream",
        ],
      },
      {
        canonical: "Luxusné ošetrenie",
        name: "Luxury skincare treatment",
        details: [
          "surface cleansing",
          "deep cleansing",
          "lifting lymphatic massage",
          "use of device attachments",
          "application of active ingredients using robotic non-invasive mesotherapy",
          "mask, serums and cream",
        ],
      },
    ],
  },
  {
    title: "Brows and lashes",
    description:
      "Services focused on naturally enhancing the brows and lashes, so the face looks neat, soft and harmonious.",
    services: [
      { canonical: "Úprava obočia", name: "Brow shaping" },
      { canonical: "Úprava a farbenie obočia", name: "Brow shaping and tinting" },
      { canonical: "Laminácia obočia", name: "Brow lamination" },
      { canonical: "Farbenie mihalníc", name: "Lash tinting" },
      { canonical: "Laminácia mihalníc", name: "Lash lift (lash lamination)" },
    ],
  },
  {
    title: "Facial waxing",
    description: "Quick and gentle removal of unwanted facial hair.",
    services: [
      { canonical: "Depilácia hornej pery", name: "Upper lip waxing" },
      { canonical: "Depilácia brady", name: "Chin waxing" },
      { canonical: "Depilácia hornej pery + brady", name: "Upper lip + chin waxing" },
    ],
  },
  {
    title: "Gift voucher",
    description: "Every treatment can also be purchased as a gift voucher.",
    services: [
      {
        canonical: "Darčekový poukaz na vybranú službu",
        name: "Gift voucher for a selected service",
      },
    ],
  },
];
