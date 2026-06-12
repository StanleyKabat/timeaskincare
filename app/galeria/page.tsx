import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/button-link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { galleryPageItems } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Galéria salónu a výsledkov",
  description:
    "Galéria salónu Timea Skincare, detailov práce a výsledkov. Použité budú iba reálne fotografie so súhlasom zákazníčok.",
  alternates: {
    canonical: "/galeria",
  },
};

export default function GalleryPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Galéria"
            title="Galéria salónu"
            text="Pozrite si priestor, atmosféru a detaily salónu Timea Skincare."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:pb-12 lg:grid-cols-3 lg:px-8">
        {galleryPageItems.map((item, index) => (
          <ScrollReveal
            key={item.src}
            staggerIndex={index}
            className={`min-w-0 ${item.featured ? "sm:col-span-2" : ""}`}
          >
            <div className="interactive-card h-full overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className={`relative ${item.featured ? "aspect-[4/5] sm:aspect-[16/9]" : "aspect-[4/5]"}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  quality={88}
                  sizes={
                    item.featured
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover"
                />
                <div className="absolute inset-x-3 bottom-3 rounded-md border border-[var(--color-line)] bg-[rgba(16,16,15,0.78)] p-3 backdrop-blur-sm">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
                    {item.category}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-charcoal)]">{item.title}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

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
    </>
  );
}
