import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/button-link";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Galéria salónu a výsledkov",
  description:
    "Galéria salónu Timea Skincare, detailov práce a výsledkov. Použité budú iba reálne fotografie so súhlasom zákazníčok.",
};

const galleryItems = [
  {
    title: "Laminácia obočia",
    src: "/images/lami-brows.png",
    alt: "Výsledok laminácie obočia v salóne Timea Skincare",
  },
  {
    title: "Brand salónu",
    src: "/images/timea-logo.png",
    alt: "Logo Timea Skincare",
  },
  {
    title: "Zákulisie salónu",
    src: "/images/WhatsApp%20Image%202026-05-10%20at%2021.59.25.jpeg",
    alt: "Detail prostredia salónu Timea Skincare",
  },
  {
    title: "Detail práce",
    src: "/images/WhatsApp%20Image%202026-05-10%20at%2021.59.26.jpeg",
    alt: "Detail kozmetického ošetrenia v salóne",
  },
  {
    title: "Pred a po",
    src: "/images/lami-brows.png",
    alt: "Porovnanie výsledku ošetrenia pred a po",
  },
  {
    title: "Atmosféra salónu",
    src: "/images/WhatsApp%20Image%202026-05-10%20at%2021.59.25.jpeg",
    alt: "Pokojné prostredie salónu Timea Skincare",
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="reveal-soft mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          eyebrow="Galéria"
          title="Reálne fotky salónu a výsledkov"
          text="Galéria je pripravená na doplnenie skutočných fotografií. Pri fotkách pred a po je potrebný súhlas zákazníčky."
        />
      </section>

      <section className="reveal-soft mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:pb-12 lg:grid-cols-3 lg:px-8">
        {galleryItems.map((item) => (
          <div
            key={`${item.title}-${item.src}`}
            className="interactive-card overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-md border border-[var(--color-line)] bg-[rgba(16,16,15,0.82)] p-2">
                <p className="text-sm font-semibold text-[var(--color-charcoal)]">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="reveal-soft border-t border-[var(--color-line)] bg-[var(--color-surface)]">
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
      </section>
    </>
  );
}
