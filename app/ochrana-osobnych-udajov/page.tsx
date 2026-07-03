import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@/components/pages/privacy-policy-page";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Zásady ochrany osobných údajov",
  description:
    "Informácie o spracovaní osobných údajov pri rezervácii termínu v salóne Timea Skincare.",
  alternates: {
    canonical: "/ochrana-osobnych-udajov",
    languages: {
      sk: "/ochrana-osobnych-udajov",
      en: "/en/privacy-policy",
      "x-default": "/ochrana-osobnych-udajov",
    },
  },
};

export default function SlovakPrivacyPolicyPage() {
  return (
    <PrivacyPolicyPage
      intro={{
        eyebrow: "GDPR",
        title: "Zásady ochrany osobných údajov",
        text: "Tieto informácie vysvetľujú, ako spracúvame údaje odoslané cez rezervačný formulár.",
      }}
      sections={[
        {
          heading: "Prevádzkovateľ",
          body: (
            <>
              {siteConfig.owner}, {siteConfig.address}, e-mail: {siteConfig.email}, tel.:{" "}
              {siteConfig.phone}
            </>
          ),
        },
        {
          heading: "Aké údaje spracúvame",
          body: "Meno a priezvisko, e-mail, telefónne číslo, vybraná služba, preferovaný dátum a čas rezervácie a voliteľnú poznámku k termínu.",
        },
        {
          heading: "Účel spracovania",
          body: "Údaje spracúvame výhradne na vybavenie tvojej žiadosti o rezerváciu termínu, zapísanie termínu do kalendára, odoslanie potvrdenia a pripomienky termínu e-mailom alebo SMS.",
        },
        {
          heading: "Používané externé služby",
          body: "Pri vybavení rezervácie môžeme použiť Google Calendar na evidenciu obsadených termínov, e-mailovú službu na potvrdenie rezervácie, SMS službu na upozornenia k termínu a Google Maps na zobrazenie polohy salónu.",
        },
        {
          heading: "Cookies",
          body: "Táto webstránka nepoužíva analytické ani marketingové cookies a nesleduje návštevníkov. Vlastný kód stránky neukladá žiadne cookies. Na podstránke Kontakt sa nachádza mapa Google Maps, ktorá sa načíta až po kliknutí používateľa. Pri načítaní mapy môže spoločnosť Google spracúvať technické údaje podľa svojich pravidiel. Písma a ostatné súbory sa načítavajú priamo z našej domény.",
        },
        {
          heading: "Doba uchovávania údajov",
          body: "Údaje uchovávame len počas obdobia potrebného na vybavenie rezervácie, prípadne po dobu vyžadovanú právnymi predpismi.",
        },
        {
          heading: "Tvoje práva",
          body: (
            <>
              Máš právo požiadať o prístup k údajom, opravu, vymazanie, obmedzenie spracovania alebo
              namietať proti spracovaniu. V prípade otázok nás kontaktuj na {siteConfig.email}.
            </>
          ),
        },
      ]}
    />
  );
}
