import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/button-link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Galéria salónu a výsledkov",
  description:
    "Galéria salónu Timea Skincare, detailov práce a výsledkov. Použité budú iba reálne fotografie so súhlasom zákazníčok.",
  alternates: {
    canonical: "/galeria",
  },
};

const galleryItems = [
  {
    title: "Kozmetické lôžko",
    category: "Salón",
    src: "/images/salon/salon-lehatko-detail.jpg",
    alt: "Kozmetické lôžko v salóne Timea Skincare v Novej Bani",
    featured: true,
  },
  {
    title: "Priestor salónu",
    category: "Salón",
    src: "/images/salon/salon-interier-lehatko.jpg",
    alt: "Interiér kozmetického salónu Timea Skincare s kozmetickým lôžkom a policami",
  },
  {
    title: "Zrkadlo a produkty",
    category: "Salón",
    src: "/images/salon/salon-zrkadlo-policky.jpg",
    alt: "Zrkadlo a kozmetické produkty v salóne Timea Skincare",
  },
  {
    title: "Pokojný kútik",
    category: "Atmosféra",
    src: "/images/salon/salon-cakaci-kutik.jpg",
    alt: "Pokojný kútik so stolíkom a detailmi v salóne Timea Skincare",
    featured: true,
  },
  {
    title: "Detail zrkadla",
    category: "Atmosféra",
    src: "/images/salon/salon-kvetinove-zrkadlo.jpg",
    alt: "Kvetinový detail zrkadla v salóne Timea Skincare",
  },
  {
    title: "Vstup do budovy",
    category: "Lokalita",
    src: "/images/salon/budova-salon-vstup.jpg",
    alt: "Budova a vstup, kde sa nachádza salón Timea Skincare v Novej Bani",
  },
  {
    title: "Prístrojové ošetrenie",
    category: "Technológia",
    src: "/images/salon/pristroj-oxygen-osetrenie.jpg",
    alt: "Kozmetický prístroj na ošetrenie pleti v salóne Timea Skincare",
  },
  {
    title: "Prístrojové hlavice",
    category: "Technológia",
    src: "/images/salon/pristroj-hlavice-detail.jpg",
    alt: "Detail prístrojových hlavíc používaných pri kozmetickom ošetrení pleti",
  },
  {
    title: "Certifikát",
    category: "Dôvera",
    src: "/images/salon/certifikat-pristroj.jpg",
    alt: "Certifikát ku kozmetickému prístroju v salóne Timea Skincare",
  },
  {
    title: "Darčekový poukaz",
    category: "Detail",
    src: "/images/salon/darcekovy-poukaz-detail.jpg",
    alt: "Darčekový poukaz a vizitky salónu Timea Skincare",
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Galéria"
            title="Reálne fotky salónu Timea Skincare"
            text="Prvé reálne zábery priestoru, technológie a detailov salónu v Novej Bani. Fotky výsledkov a pred/po doplníme iba so súhlasom zákazníčok."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:pb-12 lg:grid-cols-3 lg:px-8">
        {galleryItems.map((item, index) => (
          <ScrollReveal
            key={`${item.title}-${item.src}`}
            staggerIndex={index}
            className={`min-w-0 ${item.featured ? "sm:col-span-2" : ""}`}
          >
            <div className="interactive-card h-full overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className={`relative ${item.featured ? "aspect-[4/5] sm:aspect-[16/9]" : "aspect-[4/5]"}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
