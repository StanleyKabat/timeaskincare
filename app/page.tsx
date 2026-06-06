import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Gem,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
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

const homeGallery = [
  {
    src: "/images/salon/salon-interier-lehatko.jpg",
    alt: "Police s kozmetickými produktmi v salóne Timea Skincare",
  },
  {
    src: "/images/salon/salon-zrkadlo-policky.jpg",
    alt: "Okrúhle zrkadlo a kozmetický kútik v salóne Timea Skincare",
  },
  {
    src: "/images/salon/certifikat-pristroj.jpg",
    alt: "Certifikát Timey Polcovej v salóne Timea Skincare",
  },
  {
    src: "/images/salon/karticky-na-dalsi-termin.jpg",
    alt: "Brandové kartičky a jemné detaily salónu Timea Skincare",
  },
  {
    src: "/images/salon/cakaci-priestor-vizitky.jpg",
    alt: "Čakací kútik so sviečkami a jemnými detailmi v salóne Timea Skincare",
  },
  {
    src: "/images/salon/salon-cakaci-kutik.jpg",
    alt: "Kvetinové zrkadlo a atmosféra salónu Timea Skincare",
  },
];

export default function Home() {
  return (
    <>
      <section className="soft-grid reveal-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:min-h-[calc(100vh-73px)] sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8">
          <div className="relative">
            <Sparkles
              aria-hidden="true"
              size={26}
              className="mb-4 text-[var(--color-powder)] opacity-70 sm:mb-5"
            />
            <h1 className="font-serif text-[2.4rem] font-medium leading-[1.12] tracking-[-0.005em] text-[var(--color-charcoal)] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              Starostlivosť, ktorá
              <br className="hidden sm:block" /> nechá vyniknúť tvoju
              <br className="hidden sm:block" /> prirodzenosť
            </h1>
            <span
              aria-hidden="true"
              className="mt-6 block h-px w-16 rounded-full bg-[linear-gradient(90deg,var(--color-powder),transparent)] sm:mt-7"
            />
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-stone)] sm:mt-6 sm:text-base sm:leading-7">
              Profesionálna starostlivosť o pleť, obočie a mihalnice v príjemnom
              prostredí, kde sa krása stáva rituálom.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <ButtonLink href="/kontakt#rezervacia" className="gap-2">
                <CalendarDays size={17} aria-hidden="true" />
                Rezervovať termín
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/sluzby" variant="secondary" className="gap-2">
                Pozrieť služby
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
            <ul
              aria-label="Prečo Timea Skincare"
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-[var(--color-stone)] sm:mt-9 sm:text-sm"
            >
              {[
                { icon: Sparkles, label: "Prírodné výsledky" },
                { icon: Heart, label: "Individuálny prístup" },
                { icon: Gem, label: "Prémiové produkty" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--color-powder)]"
                  />
                  <span className="leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:aspect-[16/10] sm:rounded-[2rem] lg:aspect-auto lg:h-[540px]">
              <Image
                src="/images/salon/salon-lehatko-detail.jpg"
                alt="Ošetrovacia miestnosť kozmetického salónu Timea Skincare v Novej Bani"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,16,15,0.55),transparent_42%)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 hidden bg-[linear-gradient(90deg,#11100f_0%,rgba(17,16,15,0.45)_16%,transparent_46%)] lg:block"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:px-6 sm:pb-16 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-medium text-[var(--color-charcoal)] sm:text-3xl">
                Galéria salónu
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-stone)]">
                Priestor, atmosféra a detaily salónu Timea Skincare.
              </p>
            </div>
            <Link
              href="/galeria"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-powder)] transition hover:gap-2.5"
            >
              Zobraziť celú galériu
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {homeGallery.map((item, index) => (
            <ScrollReveal key={item.src} staggerIndex={index} className="min-w-0">
              <Link
                href="/galeria"
                aria-label="Otvoriť galériu salónu Timea Skincare"
                className="interactive-card group block overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(0deg,rgba(16,16,15,0.3),transparent_55%)]"
                  />
                </div>
              </Link>
            </ScrollReveal>
          ))}
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

      <section className="border-y border-[var(--color-line)] bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-elevated))] text-[var(--color-charcoal)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(226,138,180,0.24)] bg-[linear-gradient(150deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.26)] sm:rounded-[2rem] sm:p-10 lg:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(226,138,180,0.18),transparent_70%)]"
            />
            <div className="relative grid gap-6 sm:gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
              <ScrollReveal className="min-w-0">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-powder)] sm:text-sm sm:tracking-[0.18em]">
                    O salóne
                  </p>
                  <h2 className="mt-3 max-w-xl font-serif text-2xl font-semibold leading-tight text-[var(--color-charcoal)] sm:mt-4 sm:text-4xl">
                    Pokojné miesto pre jemnú a profesionálnu starostlivosť
                  </h2>
                </div>
              </ScrollReveal>
              <ScrollReveal staggerIndex={1} className="min-w-0">
                <div className="text-sm leading-7 text-[rgba(247,241,235,0.82)] sm:text-base sm:leading-8">
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
          </div>
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
