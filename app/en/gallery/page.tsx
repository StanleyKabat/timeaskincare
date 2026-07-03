import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { GalleryPage } from "@/components/pages/gallery-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { enGalleryPageItems } from "@/data/gallery-en";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore the atmosphere of Timea Skincare — a calm and welcoming space for skincare, brow and lash treatments.",
  alternates: {
    canonical: "/en/gallery",
    languages: {
      sk: "/galeria",
      en: "/en/gallery",
      "x-default": "/galeria",
    },
  },
  openGraph: {
    title: "Gallery | Timea Skincare",
    description:
      "Explore the atmosphere of Timea Skincare — a calm and welcoming space for skincare, brow and lash treatments.",
    url: "https://timeaskincare.sk/en/gallery",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishGalleryPage() {
  return (
    <GalleryPage
      intro={{
        eyebrow: "Gallery",
        title: "A glimpse into the salon",
        text: "Take a look at the calm atmosphere of Timea Skincare, the treatment space, details and products used during the visit.",
      }}
      items={enGalleryPageItems}
      footer={
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
          <ScrollReveal>
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
                  Would you like to visit the salon?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--color-stone)]">
                  The latest work is shared on Instagram. When you are ready, you can book your
                  appointment online.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/en/services" variant="secondary">
                  View services
                </ButtonLink>
                <ButtonLink href="/en/contact#booking">Book an appointment</ButtonLink>
              </div>
            </div>
          </ScrollReveal>
        </section>
      }
    />
  );
}
