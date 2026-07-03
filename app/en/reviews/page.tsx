import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { ReviewsPage } from "@/components/pages/reviews-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { enReviews } from "@/data/reviews-en";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read client reviews and experiences with skincare, brow and lash treatments at Timea Skincare.",
  alternates: {
    canonical: "/en/reviews",
    languages: {
      sk: "/recenzie",
      en: "/en/reviews",
      "x-default": "/recenzie",
    },
  },
  openGraph: {
    title: "Reviews | Timea Skincare",
    description:
      "Read client reviews and experiences with skincare, brow and lash treatments at Timea Skincare.",
    url: "https://timeaskincare.sk/en/reviews",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishReviewsPage() {
  return (
    <ReviewsPage
      intro={{
        eyebrow: "Reviews",
        title: "Kind words from clients",
        text: "Read what clients say about their experience at Timea Skincare — from the atmosphere and personal approach to the final result.",
      }}
      note="Reviews are translated from Slovak for easier understanding."
      reviews={enReviews}
      attribution="Timea Skincare client"
      footer={
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
          <ScrollReveal>
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
                  Would you like to experience it too?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--color-stone)]">
                  If you are not sure which treatment is right for you, feel free to contact me. I
                  will gladly help you choose the best option.
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
