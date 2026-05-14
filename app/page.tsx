import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  HandHeart,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { ReviewCard } from "@/components/review-card";
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
        <div className="mx-auto grid max-w-6xl items-center gap-7 px-4 py-8 sm:min-h-[calc(100vh-73px)] sm:gap-12 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-stone)] sm:mb-5 sm:px-4 sm:py-2 sm:text-sm">
              Kozmetický salón v Novej Bani
            </p>
            <h1 className="max-w-3xl font-serif text-[2.15rem] font-semibold leading-[1.08] text-[var(--color-charcoal)] sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              Jemná a profesionálna starostlivosť o pleť v Novej Bani
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-stone)] sm:mt-6 sm:text-lg sm:leading-8">
              Timea Skincare je kozmetický salón zameraný na individuálne
              ošetrenia pleti, úpravu obočia, mihalnice a jemnú starostlivosť,
              ktorá rešpektuje potreby tvojej pokožky.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
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
              className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-[var(--color-stone)] sm:mt-7 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:text-sm"
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
          <div className="sparkle-field relative hidden min-h-[420px] overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(226,138,180,0.24),transparent_18rem),linear-gradient(140deg,#121111,#27221f_48%,rgba(226,138,180,0.18))]" />
            <div className="absolute right-4 top-4 rounded-full border border-[var(--color-line)] bg-[rgba(25,24,23,0.78)] px-3 py-1.5 text-xs font-medium text-[var(--color-stone)] sm:right-6 sm:top-6 sm:px-4 sm:py-2 sm:text-sm">
              Timea Skincare
            </div>
            <div className="absolute inset-x-5 bottom-5 sm:inset-x-8 sm:bottom-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[rgba(25,24,23,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--color-powder)] sm:mb-5 sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
                <Sparkles size={17} aria-hidden="true" />
                Jemná starostlivosť
              </div>
              <p className="max-w-sm text-lg font-semibold leading-tight text-[var(--color-charcoal)] sm:text-2xl">
                Priestor pre pokoj, čistú pleť a prirodzene upravené detaily.
              </p>
              <p className="mt-3 text-xs leading-5 text-[var(--color-stone)] sm:mt-4 sm:text-sm sm:leading-6">
                Salón Timea Skincare ponúka čisté, pokojné prostredie a individuálny prístup ku každej zákazníčke.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-soft border-y border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:gap-8 sm:px-6 sm:py-16 md:grid-cols-3 lg:px-8">
          {[
            "Individuálny prístup podľa potrieb pleti",
            "Jemný, čistý a profesionálny štýl ošetrenia",
            "Služby pre pleť, obočie, mihalnice aj depiláciu tváre",
          ].map((item) => (
            <div key={item} className="flex gap-3">
              <CheckCircle2 className="mt-1 shrink-0 text-[var(--color-leaf)]" size={20} />
              <p className="text-sm leading-6 text-[var(--color-charcoal)]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal-soft mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-7 sm:gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Služby"
            title="Starostlivosť, ktorá rešpektuje tvoju pleť"
            text="Vybrané služby sú postavené na prirodzenom výsledku, pokojnom priebehu a jasnej komunikácii pred ošetrením."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {serviceGroups.slice(0, 4).map((group) => (
              <article
                key={group.title}
                className="interactive-card rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                  {group.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
                  {group.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal-soft border-y border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-charcoal)]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-blush)] sm:text-sm sm:tracking-[0.18em]">
              O salóne
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-2xl font-semibold leading-tight sm:mt-4 sm:text-4xl">
              Pokojné miesto pre jemnú a profesionálnu starostlivosť
            </h2>
          </div>
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
        </div>
      </section>

      <section className="reveal-soft mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
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
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 2).map((review) => (
              <ReviewCard
                key={`${review.service}-${review.text}`}
                service={review.service}
                text={review.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="reveal-soft border-t border-[var(--color-line)] bg-[var(--color-surface)]">
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
