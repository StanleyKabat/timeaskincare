import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  HandHeart,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { ReviewCard } from "@/components/review-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { reviews } from "@/data/reviews";
import { serviceGroups, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <section className="soft-grid reveal-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:min-h-[calc(100vh-73px)] sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-stone)] sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
              Kozmetický salón v Novej Bani
            </p>
            <h1 className="max-w-2xl text-balance font-serif text-[1.95rem] font-semibold leading-[1.12] text-[var(--color-charcoal)] sm:text-5xl sm:leading-[1.08] lg:text-6xl">
              Kozmetika v Novej Bani pre pleť, ktorá potrebuje pokoj
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--color-stone)] sm:mt-6 sm:text-lg sm:leading-8">
              Osobné ošetrenia pleti, úprava obočia a laminácia mihalníc v
              pokojnom salóne Timea Skincare. Bez zhonu, s dôrazom na čistú
              pleť, prirodzený výsledok a starostlivosť, ktorá dáva zmysel tvojej
              pokožke.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <ButtonLink href="/kontakt#rezervacia" className="gap-2">
                Rezervovať termín
                <ArrowRight size={17} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/sluzby" variant="secondary">
                Pozrieť služby
              </ButtonLink>
            </div>
            <ul
              aria-label="Prečo Timea Skincare"
              className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-[var(--color-stone)] sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:text-sm"
            >
              {[
                { icon: MapPin, label: "Nová Baňa" },
                { icon: HandHeart, label: "Individuálny prístup" },
                { icon: Star, label: "Reálne recenzie" },
                { icon: CalendarCheck, label: "Online rezervácia" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--color-powder)]"
                  />
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-60 overflow-hidden rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:h-auto sm:min-h-[460px] sm:rounded-[2rem]">
            <Image
              src="/images/salon/salon-lehatko-detail.jpg"
              alt="Pokojné prostredie kozmetického salónu Timea Skincare v Novej Bani"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,17,17,0)_55%,rgba(18,17,17,0.32))]"
            />
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-[rgba(255,255,255,0.22)] bg-[rgba(16,16,15,0.55)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[var(--color-charcoal)] backdrop-blur-sm sm:left-6 sm:top-6 sm:text-xs">
              Pleť · obočie · mihalnice
            </span>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:gap-8 sm:px-6 sm:py-16 md:grid-cols-3 lg:px-8">
          {[
            "Individuálny prístup podľa potrieb pleti",
            "Jemný, čistý a profesionálny štýl ošetrenia",
            "Služby pre pleť, obočie, mihalnice aj depiláciu tváre",
          ].map((item, index) => (
            <ScrollReveal key={item} staggerIndex={index} className="min-w-0">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-[var(--color-leaf)]" size={20} />
                <p className="text-sm leading-6 text-[var(--color-charcoal)]">{item}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-7 sm:gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal className="min-w-0">
            <SectionHeading
              eyebrow="Služby"
              title="Starostlivosť, ktorá rešpektuje tvoju pleť"
              text="Vybrané služby sú postavené na prirodzenom výsledku, pokojnom priebehu a jasnej komunikácii pred ošetrením."
            />
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {serviceGroups.slice(0, 4).map((group, index) => (
              <ScrollReveal key={group.title} staggerIndex={index} className="min-w-0">
                <article className="interactive-card h-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                    {group.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
                    {group.description}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-charcoal)]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[1fr_0.9fr] lg:px-8">
          <ScrollReveal className="min-w-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-blush)] sm:text-sm sm:tracking-[0.18em]">
                O salóne
              </p>
              <h2 className="mt-3 max-w-xl font-serif text-2xl font-semibold leading-tight sm:mt-4 sm:text-4xl">
                Pokojné miesto pre jemnú a profesionálnu starostlivosť
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal staggerIndex={1} className="min-w-0">
            <div className="text-sm leading-7 text-[var(--color-stone)] sm:text-base sm:leading-8">
              <p>
                V Timea Skincare veríme, že kozmetické ošetrenie nemá byť len
                procedúra, ale chvíľa pokoja, starostlivosti a dôvery. Každé
                ošetrenie je prispôsobené typu a potrebám pleti, aby bol výsledok
                prirodzený, jemný a viditeľný.
              </p>
              <ButtonLink href="/kontakt#rezervacia" variant="secondary" className="mt-7">
                Kontaktovať salón
              </ButtonLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <ScrollReveal className="min-w-0">
            <div>
              <SectionHeading
                eyebrow="Recenzie"
                title="Skúsenosti zákazníčok"
                text="Reálne spätné väzby od zákazníčok, ktoré ocenili precíznu prácu, príjemný prístup a pokojné prostredie salónu."
              />
              <ButtonLink href="/recenzie" variant="secondary" className="mt-6">
                Pozrieť všetky recenzie
              </ButtonLink>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 2).map((review, index) => (
              <ScrollReveal key={`${review.service}-${review.text}`} staggerIndex={index} className="min-w-0">
                <ReviewCard service={review.service} text={review.text} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold text-[var(--color-powder)]">
                {siteConfig.location}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)]">
                Dohodnime si termín, ktorý ti bude vyhovovať.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/kontakt#rezervacia" className="gap-2">
                <MapPin size={17} aria-hidden="true" />
                Rezervovať
              </ButtonLink>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Timea Skincare (otvorí sa v novom okne)"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                <MessageCircle size={17} aria-hidden="true" />
                Instagram
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
