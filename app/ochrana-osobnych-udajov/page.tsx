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
          body: "Nevyhnutné cookies zabezpečujú základné fungovanie webu a uloženie tvojej voľby cookies. Na tento účel nepotrebujeme tvoj súhlas a nesledujú tvoje správanie. So samostatným súhlasom môžeme používať aj analytické cookies (Google Analytics 4), ktoré nám pomáhajú pochopiť, ako sa web používa, a marketingové cookies (meranie úspešnosti reklám a remarketing cez Google Ads). Voliteľné analytické a marketingové cookies sa nenačítajú pred udelením súhlasu – predvolene sú cez Google Consent Mode v2 zakázané. Svoj súhlas môžeš kedykoľvek zmeniť cez odkaz „Nastavenia cookies“ v pätičke. Do Google Analytics ani Google Ads neposielame žiadne osobné údaje z rezervačného formulára (meno, e-mail, telefón, text poznámky ani meno obdarovaného). Na podstránke Kontakt sa nachádza mapa Google Maps, ktorá sa načíta až po kliknutí používateľa. Pri načítaní mapy môže spoločnosť Google spracúvať technické údaje podľa svojich pravidiel. Písma a ostatné súbory sa načítavajú priamo z našej domény.",
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
