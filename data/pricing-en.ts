import type { PriceGroupView } from "@/components/pages/pricing-page";

/**
 * English display data for the `/en/pricing` page.
 *
 * IMPORTANT: prices are copied verbatim from the Slovak `priceGroups`
 * (data/site.ts) and must stay identical. Only names, category titles and
 * badges are translated for display; this data does not affect the booking
 * system, which keeps its own canonical Slovak service names.
 */
export const enPriceGroups: PriceGroupView[] = [
  {
    title: "Skincare treatments",
    items: [
      { name: "Basic skincare treatment", price: "40 € - 45 €" },
      { name: "Complete skincare treatment", price: "50 € - 55 €", highlight: "Popular" },
      { name: "Luxury skincare treatment", price: "70 € - 75 €", highlight: "Premium" },
    ],
  },
  {
    title: "Brows and lashes",
    items: [
      { name: "Brow shaping / tweezing", price: "8 €" },
      { name: "Brow shaping and tinting", price: "13 €", highlight: "Popular choice" },
      { name: "Brow lamination with tinting", price: "28 €", highlight: "Popular" },
      { name: "Lash tinting", price: "8 €" },
      { name: "Lash lift with tinting", price: "33 €", highlight: "Popular" },
      { name: "Brow lamination + lash lift", price: "55 €", highlight: "Value package" },
    ],
  },
  {
    title: "Facial waxing",
    items: [
      { name: "Upper lip waxing", price: "3 €" },
      { name: "Chin waxing", price: "3 €" },
      { name: "Upper lip + chin waxing", price: "5 €" },
    ],
  },
  {
    title: "Additional services",
    items: [
      {
        name: "Face and décolleté massage (added to a basic or complete treatment)",
        price: "10 €",
      },
      { name: "The luxury treatment already includes the massage", price: "included" },
    ],
  },
];
