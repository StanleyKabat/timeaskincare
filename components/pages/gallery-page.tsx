import type { ReactNode } from "react";
import Image from "next/image";

import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import type { GalleryPageItem } from "@/data/gallery";

type GalleryPageProps = {
  intro: { eyebrow: string; title: string; text: string };
  items: GalleryPageItem[];
  /** Locale-specific bottom section rendered after the image grid. */
  footer: ReactNode;
};

/**
 * Shared gallery page layout used by both the Slovak (`/galeria`) and English
 * (`/en/gallery`) routes. The image grid, sources, sizing, quality and layout
 * are identical; only the displayed text (titles/categories/alts, intro and
 * footer) differs by locale.
 */
export function GalleryPage({ intro, items, footer }: GalleryPageProps) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:pb-12 lg:grid-cols-3 lg:px-8">
        {items.map((item, index) => (
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

      {footer}
    </>
  );
}
