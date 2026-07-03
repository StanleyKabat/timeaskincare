import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { GalleryPage } from "@/components/pages/gallery-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { galleryPageItems } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Galéria salónu a výsledkov",
  description:
    "Galéria salónu Timea Skincare, detailov práce a výsledkov. Použité budú iba reálne fotografie so súhlasom zákazníčok.",
  alternates: {
    canonical: "/galeria",
    languages: {
      sk: "/galeria",
      en: "/en/gallery",
      "x-default": "/galeria",
    },
  },
};

export default function SlovakGalleryPage() {
  return (
    <GalleryPage
      intro={{
        eyebrow: "Galéria",
        title: "Galéria salónu",
        text: "Pozrite si priestor, atmosféru a detaily salónu Timea Skincare.",
      }}
      items={galleryPageItems}
      footer={
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
          <ScrollReveal>
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
                  Chceš vidieť aktuálnu prácu a skúsenosti zákazníčok?
                </h2>
                <p className="mt-2 text-sm text-[var(--color-stone)]">
                  Najnovšie výsledky budú dostupné cez Instagram, recenzie nájdeš aj priamo na webe.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/recenzie" variant="secondary">
                  Pozrieť recenzie
                </ButtonLink>
                <ButtonLink href="/kontakt#rezervacia">Rezervovať termín</ButtonLink>
              </div>
            </div>
          </ScrollReveal>
        </section>
      }
    />
  );
}
