import type { Metadata } from "next";

import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Zásady ochrany osobných údajov",
  description:
    "Informácie o spracovaní osobných údajov pri rezervácii termínu v salóne Timea Skincare.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="GDPR"
        title="Zásady ochrany osobných údajov"
        text="Tieto informácie vysvetľujú, ako spracúvame údaje odoslané cez rezervačný formulár."
      />

      <div className="mt-8 space-y-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-sm leading-6 text-[var(--color-stone)] sm:p-8">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-charcoal)]">Prevádzkovateľ</h2>
          <p className="mt-2">
            {siteConfig.owner}, {siteConfig.address}, e-mail: {siteConfig.email}, tel.:{" "}
            {siteConfig.phone}
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-charcoal)]">Aké údaje spracúvame</h2>
          <p className="mt-2">
            Meno a priezvisko, e-mail, telefónne číslo, vybraná služba, preferovaný dátum a čas
            rezervácie.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-charcoal)]">Účel spracovania</h2>
          <p className="mt-2">
            Údaje spracúvame výhradne na vybavenie tvojej žiadosti o rezerváciu termínu a následnú
            komunikáciu k termínu.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-charcoal)]">
            Doba uchovávania údajov
          </h2>
          <p className="mt-2">
            Údaje uchovávame len počas obdobia potrebného na vybavenie rezervácie, prípadne po dobu
            vyžadovanú právnymi predpismi.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-charcoal)]">Tvoje práva</h2>
          <p className="mt-2">
            Máš právo požiadať o prístup k údajom, opravu, vymazanie, obmedzenie spracovania alebo
            namietať proti spracovaniu. V prípade otázok nás kontaktuj na {siteConfig.email}.
          </p>
        </div>
      </div>
    </section>
  );
}
