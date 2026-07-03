import type { GalleryPageItem } from "@/data/gallery";

/**
 * English display data for the `/en/gallery` page.
 *
 * IMPORTANT: every `src`, `featured` flag and the item order are copied
 * verbatim from the Slovak `galleryPageItems` (data/gallery.ts). Image paths,
 * dimensions, quality and layout are unchanged — only `title`, `category` and
 * `alt` are translated for display.
 */
export const enGalleryPageItems: GalleryPageItem[] = [
  {
    title: "Salon interior",
    category: "Salon",
    src: "/images/salon/interier-salon-hq.jpg",
    alt: "Interior of the Timea Skincare beauty salon with a treatment bed and shelves",
  },
  {
    title: "Skincare products",
    category: "Salon",
    src: "/images/salon/produkty-policky-hq.jpg",
    alt: "Professional skincare products on lit shelves at Timea Skincare",
  },
  {
    title: "Mirror and products",
    category: "Salon",
    src: "/images/salon/zrkadlo-produkty-hq.jpg",
    alt: "Shelves with cosmetics and certificates reflected in a round mirror at Timea Skincare",
    featured: true,
  },
  {
    title: "Professional certificates",
    category: "Trust",
    src: "/images/salon/certifikaty-stena-hq.jpg",
    alt: "Professional certificates of Timea Polcová from Beauty School Nitra in the salon",
  },
  {
    title: "Brow and lash tools",
    category: "Detail",
    src: "/images/salon/nastroje-obocie-hq.jpg",
    alt: "Professional pink tools for brow and lash styling at Timea Skincare",
  },
  {
    title: "Waiting area",
    category: "Atmosphere",
    src: "/images/salon/cakaci-atmosfera-hq.jpg",
    alt: "Waiting corner with candles, business cards and soft details at Timea Skincare",
  },
  {
    title: "A little gift for clients",
    category: "Atmosphere",
    src: "/images/salon/kosik-cukriky-hq.jpg",
    alt: "Decorative basket with sweets and a pink ribbon at Timea Skincare",
  },
  {
    title: "Next-appointment cards",
    category: "Detail",
    src: "/images/salon/karticky-termin-hq.jpg",
    alt: "Pink next-appointment cards and Timea Skincare business cards in a holder",
  },
  {
    title: "Device training certificate",
    category: "Trust",
    src: "/images/salon/certifikat-pristroj-hq.jpg",
    alt: "Certificate of Timea Polcová for professional training on the Beautyrelax device",
  },
  {
    title: "Device treatment",
    category: "Technology",
    src: "/images/salon/pristroj-beautyrelax-hq.jpg",
    alt: "Professional Beautyrelax cosmetic device at Timea Skincare",
  },
  {
    title: "Device attachments",
    category: "Technology",
    src: "/images/salon/pristroj-hlavice-hq.jpg",
    alt: "Professional attachments of the cosmetic device at Timea Skincare",
  },
  {
    title: "Building entrance",
    category: "Location",
    src: "/images/salon/vstup-budova-hq.jpg",
    alt: "Entrance to the building where the Timea Skincare salon is located in Nová Baňa",
  },
];
