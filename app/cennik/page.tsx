import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { PricingPage } from "@/components/pages/pricing-page";
import { ScrollReveal } from "@/components/scroll-reveal";
import { priceGroups } from "@/data/site";

export const metadata: Metadata = {
  title: "Cenník kozmetických ošetrení",
  description:
    "Prehľadný cenník kozmetických ošetrení, úpravy obočia, laminácie mihalníc a depilácie v salóne Timea Skincare.",
  alternates: {
    canonical: "/cennik",
    languages: {
      sk: "/cennik",
      en: "/en/pricing",
      "x-default": "/cennik",
    },
  },
};

export default function SlovakPricingPage() {
  return (
    <PricingPage
      intro={{
        eyebrow: "Cenník",
        title: "Cenník služieb Timea Skincare",
        text: "Ceny sú rozdelené podľa kategórií. Každé ošetrenie je prispôsobené typu a potrebám pleti.",
      }}
      groups={priceGroups}
      footer={
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid gap-5 rounded-lg border border-[rgba(226,138,180,0.32)] bg-[rgba(226,138,180,0.08)] p-4 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
                  Poznámka k cenníku
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
                  Konečná cena sa môže líšiť podľa rozsahu ošetrenia a aktuálnych
                  potrieb pleti. Pri rezervácii ti odporučím vhodnú službu podľa
                  toho, čo tvoja pleť alebo obočie práve potrebuje.
                </p>
              </div>
              <ButtonLink href="/kontakt#rezervacia" className="gap-2">
                Objednať sa
                <ArrowRight size={17} aria-hidden="true" />
              </ButtonLink>
            </div>
          </ScrollReveal>
        </section>
      }
    />
  );
}
