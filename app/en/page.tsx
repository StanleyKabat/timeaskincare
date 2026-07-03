import type { Metadata } from "next";

import { HomePage } from "@/components/pages/home-page";
import { enReviews } from "@/data/reviews-en";
import { homeGalleryPreview, heroSalonPhoto } from "@/data/gallery";
import { siteConfig } from "@/data/site";
import { en } from "@/messages/en";

export const metadata: Metadata = {
  title: {
    absolute: "Timea Skincare | Skincare, Brows and Lashes",
  },
  description:
    "Personal skincare, brow and lash treatments with a gentle approach, precision and natural results.",
  alternates: {
    canonical: "/en",
    languages: {
      sk: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Timea Skincare | Skincare, Brows and Lashes",
    description:
      "Personal skincare, brow and lash treatments with a gentle approach, precision and natural results.",
    url: "https://timeaskincare.sk/en",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

// English labels for the homepage services preview. The booking system keeps
// the canonical Slovak service names untouched; these are display-only.
const enServiceCards = [
  {
    title: "Skincare treatments",
    description:
      "Treatments are tailored to your skin type and its current needs — to cleanse, refresh and hydrate the skin.",
  },
  {
    title: "Brows and lashes",
    description:
      "Services focused on naturally enhancing the brows and lashes, so the face looks neat, soft and harmonious.",
  },
  {
    title: "Facial waxing",
    description: "Quick and gentle removal of unwanted facial hair.",
  },
  {
    title: "Gift voucher",
    description: "Every treatment can also be purchased as a gift voucher.",
  },
];

export default function EnglishHome() {
  return (
    <HomePage
      t={en.home}
      heroImageSrc={heroSalonPhoto.src}
      serviceCards={enServiceCards}
      galleryItems={homeGalleryPreview}
      reviewItems={enReviews.slice(0, 2)}
      reviewAttribution="Timea Skincare client"
      location={siteConfig.location}
      instagramUrl={siteConfig.instagram}
      instagramAriaLabel={en.social.instagram}
      hrefs={{
        book: "/kontakt#rezervacia",
        services: "/en/services",
        gallery: "/en/gallery",
        reviews: "/en/reviews",
        aboutCta: "/en/contact",
      }}
    />
  );
}
