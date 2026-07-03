import type { Metadata } from "next";

import {
  ServicesPage,
  getServiceDuration,
  type ServiceGroupView,
} from "@/components/pages/services-page";
import { serviceDetails, serviceGroups } from "@/data/site";

const GIFT_VOUCHER_HREF = "/kontakt?service=Dar%C4%8Dekov%C3%BD%20poukaz#rezervacia";

function isGiftVoucher(serviceName: string) {
  return serviceName.toLocaleLowerCase("sk-SK").includes("darčekový poukaz");
}

const groups: ServiceGroupView[] = serviceGroups.map((group) => ({
  title: group.title,
  description: group.description,
  services: group.services.map((service) => {
    const gift = isGiftVoucher(service);
    return {
      name: service,
      duration: gift ? null : getServiceDuration(service),
      details: serviceDetails[service] ?? null,
      href: gift ? GIFT_VOUCHER_HREF : undefined,
    };
  }),
}));

export const metadata: Metadata = {
  title: "Kozmetické služby, obočie a mihalnice",
  description:
    "Pozrite si kozmetické služby Timea Skincare v Novej Bani - ošetrenia pleti, obočie, mihalnice, laminácia a depilácia tváre.",
  alternates: {
    canonical: "/sluzby",
    languages: {
      sk: "/sluzby",
      en: "/en/services",
      "x-default": "/sluzby",
    },
  },
};

export default function SlovakServicesPage() {
  return (
    <ServicesPage
      intro={{
        eyebrow: "Služby",
        title: "Kozmetické služby v Novej Bani",
        text: "Prehľad služieb Timea Skincare. Každé ošetrenie prispôsobím aktuálnemu stavu tvojej pleti a tomu, čo práve potrebuješ. Ak si nie si istá výberom služby, rada ti poradím pri rezervácii.",
      }}
      groups={groups}
      includesLabel="Obsahuje"
      cta={{
        eyebrow: "Rezervácia",
        title: "Nie si si istá výberom služby?",
        text: "Ak si nie si istá výberom služby, pokojne mi napíš. Rada ti odporučím vhodný postup podľa potrieb tvojej pleti.",
        button: "Rezervovať termín",
      }}
      bookHref="/kontakt#rezervacia"
    />
  );
}
