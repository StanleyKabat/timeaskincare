import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { PricingPage } from "@/components/pages/pricing-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { enPriceGroups } from "@/data/pricing-en";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "View prices for skincare treatments, brow and lash services, facial waxing and gift vouchers at Timea Skincare.",
  alternates: {
    canonical: "/en/pricing",
    languages: {
      sk: "/cennik",
      en: "/en/pricing",
      "x-default": "/cennik",
    },
  },
  openGraph: {
    title: "Pricing | Timea Skincare",
    description:
      "View prices for skincare treatments, brow and lash services, facial waxing and gift vouchers at Timea Skincare.",
    url: "https://timeaskincare.sk/en/pricing",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishPricingPage() {
  return (
    <PricingPage
      intro={{
        eyebrow: "Pricing",
        title: "Transparent prices for your treatment",
        text: "Choose from skincare treatments, brow and lash services, facial waxing or a gift voucher. If you are not sure which service is right for you, I will gladly help you choose during booking.",
      }}
      groups={enPriceGroups}
      footer={
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
          <ScrollReveal>
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
                  Not sure which service to choose?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--color-stone)]">
                  If you are not sure which treatment is right for you, feel free to contact me. I
                  will gladly recommend the best option based on your skin, brows or lashes.
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
