import type { Metadata } from "next";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { bookableServices, serviceDetails, serviceGroups } from "@/data/site";
import { formatDuration } from "@/lib/booking";

function getServiceDuration(serviceName: string) {
  const normalizedServiceName = serviceName.toLowerCase();
  const service = bookableServices.find((item) => {
    const normalizedItemName = item.name.toLowerCase();

    return (
      normalizedItemName === normalizedServiceName ||
      normalizedItemName.includes(normalizedServiceName) ||
      normalizedServiceName.includes(normalizedItemName)
    );
  });

  if (!service || service.durationMinutes == null) {
    return null;
  }

  return service.durationLabel ?? formatDuration(service.durationMinutes);
}

export const metadata: Metadata = {
  title: "Kozmetické služby, obočie a mihalnice",
  description:
    "Pozrite si kozmetické služby Timea Skincare v Novej Bani - ošetrenia pleti, obočie, mihalnice, laminácia a depilácia tváre.",
  alternates: {
    canonical: "/sluzby",
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Služby"
            title="Kozmetické služby v Novej Bani"
            text="Prehľad služieb Timea Skincare. Detailné trvanie, vhodnosť a odporúčania po procedúre budú doplnené podľa finálnych podkladov."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 sm:gap-5 sm:px-6 sm:pb-20 md:grid-cols-2 lg:px-8">
        {serviceGroups.map((group, index) => (
          <ScrollReveal key={group.title} staggerIndex={index} className="min-w-0">
            <article className="interactive-card h-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
            <div className="mb-4 grid size-10 place-items-center rounded-full bg-[var(--color-blush)] text-[var(--color-powder)] sm:mb-5 sm:size-11">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-charcoal)] sm:text-xl">
              {group.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
              {group.description}
            </p>
            <ul className="mt-5 grid gap-3">
              {group.services.map((service) => {
                const duration = getServiceDuration(service);
                const details = serviceDetails[service];
                const isGiftVoucherService = service
                  .toLocaleLowerCase("sk-SK")
                  .includes("darčekový poukaz");

                return (
                  <li
                    key={service}
                    className="grid gap-3 border-t border-[var(--color-line)] pt-3 text-sm text-[var(--color-charcoal)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {isGiftVoucherService ? (
                        <Link
                          href="/kontakt?service=Dar%C4%8Dekov%C3%BD%20poukaz#rezervacia"
                          className="font-medium text-[var(--color-powder)] underline-offset-4 transition hover:underline"
                        >
                          {service}
                        </Link>
                      ) : (
                        <span className="font-medium">{service}</span>
                      )}
                      {!isGiftVoucherService && duration ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1 text-xs font-semibold text-[var(--color-stone)]">
                          <Clock size={14} aria-hidden="true" />
                          {duration}
                        </span>
                      ) : null}
                    </div>
                    {details ? (
                      <p className="text-xs leading-5 text-[var(--color-stone)]">
                        Obsahuje: {details.join(", ")}.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            </article>
          </ScrollReveal>
        ))}
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[var(--color-powder)]">
              Rezervácia
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
              Nie si si istá výberom služby?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Napíš mi a odporučím ti vhodný postup podľa potrieb tvojej pleti.
            </p>
          </div>
          <ButtonLink href="/kontakt#rezervacia" className="gap-2">
            Rezervovať termín
            <ArrowRight size={17} aria-hidden="true" />
          </ButtonLink>
        </div>
        </ScrollReveal>
      </section>
    </>
  );
}
