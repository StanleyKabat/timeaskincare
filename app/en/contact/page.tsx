import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Timea Skincare to book a skincare, brow or lash appointment. Find the salon address, phone number, email and social links.",
  alternates: {
    canonical: "/en/contact",
    languages: {
      sk: "/kontakt",
      en: "/en/contact",
      "x-default": "/kontakt",
    },
  },
  openGraph: {
    title: "Contact | Timea Skincare",
    description:
      "Contact Timea Skincare to book a skincare, brow or lash appointment. Find the salon address, phone number, email and social links.",
    url: "https://timeaskincare.sk/en/contact",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishContactPage() {
  return (
    <ContactPage
      locale="en"
      bookingAnchorId="booking"
      hrefs={{ services: "/en/services", pricing: "/en/pricing" }}
      text={{
        eyebrow: "Contact",
        title: "Book an appointment",
        intro:
          "You can arrange an appointment by phone, through social media or directly through the short form on the website.",
        cardPhoneTitle: "By phone",
        cardPhoneText: "Call the salon and we will arrange an appointment as quickly as possible.",
        cardSocialTitle: "Through social media",
        cardSocialText: "Send me a message on Instagram or Facebook.",
        cardFormTitle: "Using the form",
        cardFormText:
          "Fill in your name, email and phone number. I will get back to you with appointment confirmation.",
        cardFormCta: "Book on the website",
        contactHeading: "Salon contact",
        quickLinksHeading: "Quick links",
        mapHeading: "Where to find the salon",
        mapExternalButton: "Open in Google Maps",
        ctaHeading: "Would you like to see the services or prices first?",
        ctaText: "Browse the services and pricing before sending your booking.",
        ctaServices: "View services",
        ctaPricing: "View pricing",
        formFallback: "Loading the booking form...",
        mapPlaceholder:
          "Google Maps will load only after you click. When the map loads, Google may process technical data according to its own policies.",
        mapButton: "Load map",
        mapIframeTitle: "Timea Skincare salon map",
        instagramAria: "Timea Skincare on Instagram (opens in a new window)",
        facebookAria: "Timea Skincare on Facebook (opens in a new window)",
      }}
    />
  );
}
