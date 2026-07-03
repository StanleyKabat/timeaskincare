import type { ReactNode } from "react";

import { ReviewCard } from "@/components/review-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";

export type ReviewView = { service: string; text: string };

type ReviewsPageProps = {
  intro: { eyebrow: string; title: string; text: string };
  reviews: ReviewView[];
  /** Attribution line under each quote (locale-specific). */
  attribution?: string;
  /** Optional note shown under the intro (e.g. translation disclosure). */
  note?: string;
  /** Locale-specific bottom section rendered after the review grid. */
  footer: ReactNode;
};

/**
 * Shared reviews page layout used by both the Slovak (`/recenzie`) and English
 * (`/en/reviews`) routes. Structure, order and styling are identical; only the
 * displayed text (intro, reviews, attribution, optional note, footer) differs.
 */
export function ReviewsPage({ intro, reviews, attribution, note, footer }: ReviewsPageProps) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
          {note ? (
            <p className="mt-4 text-xs leading-5 text-[var(--color-stone)]">{note}</p>
          ) : null}
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 sm:gap-5 sm:px-6 sm:pb-20 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {reviews.map((review, index) => (
          <ScrollReveal key={`${review.service}-${review.text}`} staggerIndex={index} className="min-w-0">
            <ReviewCard service={review.service} text={review.text} attribution={attribution} />
          </ScrollReveal>
        ))}
      </section>

      {footer}
    </>
  );
}
