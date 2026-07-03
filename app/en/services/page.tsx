import type { Metadata } from "next";

import {
  ServicesPage,
  getServiceDuration,
  type ServiceGroupView,
} from "@/components/pages/services-page";
import {
  enServiceGroups,
  enServicesCta,
  enServicesIncludesLabel,
  enServicesIntro,
} from "@/data/services-en";

// Stays on the English contact page; keeps the canonical Slovak service name
// (as a query param) that the booking form expects for vouchers.
const GIFT_VOUCHER_HREF = "/en/contact?service=Dar%C4%8Dekov%C3%BD%20poukaz#booking";

function isGiftVoucher(canonicalName: string) {
  return canonicalName.toLocaleLowerCase("sk-SK").includes("darčekový poukaz");
}

const groups: ServiceGroupView[] = enServiceGroups.map((group) => ({
  title: group.title,
  description: group.description,
  services: group.services.map((service) => {
    const gift = isGiftVoucher(service.canonical);
    return {
      name: service.name,
      duration: gift ? null : getServiceDuration(service.canonical),
      details: service.details ?? null,
      href: gift ? GIFT_VOUCHER_HREF : undefined,
    };
  }),
}));

export const metadata: Metadata = {
  title: "Services",
  description:
    "Skincare treatments, brow and lash services, facial waxing and gift vouchers with a gentle, personal approach.",
  alternates: {
    canonical: "/en/services",
    languages: {
      sk: "/sluzby",
      en: "/en/services",
      "x-default": "/sluzby",
    },
  },
  openGraph: {
    title: "Services | Timea Skincare",
    description:
      "Skincare treatments, brow and lash services, facial waxing and gift vouchers with a gentle, personal approach.",
    url: "https://timeaskincare.sk/en/services",
    siteName: "Timea Skincare",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishServicesPage() {
  return (
    <ServicesPage
      intro={enServicesIntro}
      groups={groups}
      includesLabel={enServicesIncludesLabel}
      cta={enServicesCta}
      bookHref="/en/contact#booking"
    />
  );
}
