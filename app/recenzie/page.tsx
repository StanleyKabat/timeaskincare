import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { ReviewCard } from "@/components/review-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Recenzie zákazníčok",
  description:
    "Reálne recenzie zákazníčok Timea Skincare v Novej Bani na starostlivosť o pleť, obočie, lamináciu a prístup v salóne.",
  alternates: {
    canonical: "/recenzie",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Recenzie"
            title="Skúsenosti zákazníčok"
            text="Reálne spätné väzby od zákazníčok, ktoré ocenili precíznu prácu, príjemný prístup a pokojné prostredie salónu."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 sm:gap-5 sm:px-6 sm:pb-20 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {reviews.map((review, index) => (
          <ScrollReveal key={`${review.service}-${review.text}`} staggerIndex={index} className="min-w-0">
            <ReviewCard service={review.service} text={review.text} />
          </ScrollReveal>
        ))}
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
              Chceš sa objednať?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Vyplň krátky formulár a dohodneme si termín.
            </p>
          </div>
          <ButtonLink href="/kontakt#rezervacia" className="gap-2">
            Rezervovať termín
            <ArrowRight size={17} aria-hidden="true" />
          </ButtonLink>
        </div>
        </ScrollReveal>
      </section>
    </>
  );
}
