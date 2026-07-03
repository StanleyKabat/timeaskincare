import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/contact-page";

export const metadata: Metadata = {
  title: "Kontakt a rezervácia",
  description:
    "Objednajte sa do kozmetického salónu Timea Skincare v Novej Bani. Kontakt, mapa, sociálne siete a rezervačný formulár.",
  alternates: {
    canonical: "/kontakt",
    languages: {
      sk: "/kontakt",
      en: "/en/contact",
      "x-default": "/kontakt",
    },
  },
};

export default function SlovakContactPage() {
  return (
    <ContactPage
      locale="sk"
      bookingAnchorId="rezervacia"
      hrefs={{ services: "/sluzby", pricing: "/cennik" }}
      text={{
        eyebrow: "Kontakt",
        title: "Rezervácia termínu",
        intro:
          "Termín si môžeš dohodnúť telefonicky, cez sociálne siete alebo priamo cez krátky formulár na stránke.",
        cardPhoneTitle: "Telefonicky",
        cardPhoneText: "Zavolaj do salónu a termín dohodneme najrýchlejšie.",
        cardSocialTitle: "Cez sociálne siete",
        cardSocialText: "Napíš správu cez Instagram alebo Facebook.",
        cardFormTitle: "Formulárom",
        cardFormText: "Vyplň meno, e-mail a telefón. Ozvem sa ti s potvrdením termínu.",
        cardFormCta: "Rezervovať na stránke",
        contactHeading: "Kontakt na salón",
        quickLinksHeading: "Rýchle odkazy",
        mapHeading: "Kde nájdeš salón",
        mapExternalButton: "Otvoriť v Google Maps",
        ctaHeading: "Chceš si najprv pozrieť služby alebo ceny?",
        ctaText: "Prejdi si ponuku a cenník pred odoslaním rezervácie.",
        ctaServices: "Pozrieť služby",
        ctaPricing: "Pozrieť cenník",
        formFallback: "Načítavam rezervačný formulár...",
        mapPlaceholder:
          "Mapa Google Maps sa načíta až po kliknutí. Pri načítaní mapy môže Google spracúvať technické údaje podľa svojich pravidiel.",
        mapButton: "Načítať mapu",
        mapIframeTitle: "Mapa salónu Timea Skincare",
        instagramAria: "Instagram Timea Skincare (otvorí sa v novom okne)",
        facebookAria: "Facebook Timea Skincare (otvorí sa v novom okne)",
      }}
    />
  );
}
