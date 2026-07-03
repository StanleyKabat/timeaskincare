import type { Metadata } from "next";

import { HomePage } from "@/components/pages/home-page";
import { reviews } from "@/data/reviews";
import { homeGalleryPreview, heroSalonPhoto } from "@/data/gallery";
import { serviceGroups, siteConfig } from "@/data/site";
import { sk } from "@/messages/sk";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      sk: "/",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default function Home() {
  return (
    <HomePage
      t={sk.home}
      heroImageSrc={heroSalonPhoto.src}
      serviceCards={serviceGroups.slice(0, 4).map((group) => ({
        title: group.title,
        description: group.description,
      }))}
      galleryItems={homeGalleryPreview}
      reviewItems={reviews.slice(0, 2)}
      location={siteConfig.location}
      instagramUrl={siteConfig.instagram}
      hrefs={{
        book: "/kontakt#rezervacia",
        services: "/sluzby",
        gallery: "/galeria",
        reviews: "/recenzie",
        aboutCta: "/kontakt#rezervacia",
      }}
    />
  );
}
