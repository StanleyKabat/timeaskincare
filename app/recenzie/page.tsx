import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { ReviewsPage } from "@/components/pages/reviews-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Recenzie zákazníčok",
  description:
    "Reálne recenzie zákazníčok Timea Skincare v Novej Bani na starostlivosť o pleť, obočie, lamináciu a prístup v salóne.",
  alternates: {
    canonical: "/recenzie",
    languages: {
      sk: "/recenzie",
      en: "/en/reviews",
      "x-default": "/recenzie",
    },
  },
};

export default function SlovakReviewsPage() {
  return (
    <ReviewsPage
      intro={{
        eyebrow: "Recenzie",
        title: "Skúsenosti zákazníčok",
        text: "Reálne spätné väzby od zákazníčok, ktoré ocenili precíznu prácu, príjemný prístup a pokojné prostredie salónu.",
      }}
      reviews={reviews}
      footer={
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
      }
    />
  );
}
