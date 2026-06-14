import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Gem,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { AboutMe } from "@/components/about-me";
import { ButtonLink } from "@/components/button-link";
import { ReviewCard } from "@/components/review-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { reviews } from "@/data/reviews";
import { homeGalleryPreview, heroSalonPhoto } from "@/data/gallery";
import { serviceGroups, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const homeGallery = homeGalleryPreview;

export default function Home() {
  return (
    <>
      <section className="hero-section soft-grid reveal-soft relative min-h-[calc(100vh-58px)] overflow-hidden lg:min-h-[calc(100vh-68px)]">
        <div className="hero-media pointer-events-none hidden md:block" aria-hidden="true">
          <div className="relative h-full w-full">
            <Image
              src={heroSalonPhoto.src}
              alt=""
              fill
              priority
              quality={90}
              sizes="(min-width: 1280px) 50vw, (min-width: 768px) 55vw, 100vw"
              className="object-cover object-[50%_42%]"
            />
            <div className="hero-media-overlay absolute inset-0" />
          </div>
        </div>

        <div className="hero-inner relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-stretch px-6 py-10 sm:px-8 sm:py-14 lg:min-h-[calc(100vh-68px)] lg:px-10 lg:py-16 xl:px-14 2xl:px-16">
          <div className="hero-content sparkle-field w-full max-w-2xl lg:max-w-[44rem] xl:max-w-[48rem]">
            <Sparkles
              aria-hidden="true"
              size={28}
              strokeWidth={1.15}
              className="hero-heading-sparkle -ml-0.5 mb-4 sm:mb-5"
            />
            <h1 className="font-serif text-[2.35rem] font-medium leading-[1.14] tracking-[-0.01em] text-[var(--color-charcoal)] sm:text-[2.75rem] sm:leading-[1.12] lg:text-[3.55rem] lg:leading-[1.1] xl:text-[3.85rem]">
              Starostlivosť, ktorá
              <br />
              nechá vyniknúť tvoju
              <br />
              prirodzenosť
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-stone)] sm:mt-6 sm:text-[15px] sm:leading-7">
              Profesionálna starostlivosť o pleť, obočie a mihalnice
              <br className="hidden sm:block" />
              v príjemnom prostredí, kde sa krása stáva rituálom.
            </p>
            <div className="mt-7 flex flex-col gap-3 px-1 sm:mt-8 sm:flex-row sm:items-center">
              <ButtonLink href="/kontakt#rezervacia" className="gap-2 px-6">
                <CalendarDays size={17} aria-hidden="true" />
                Rezervovať termín
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/sluzby" variant="secondary" className="gap-2 px-6">
                Pozrieť služby
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
            <ul
              aria-label="Prečo Timea Skincare"
              className="hero-benefits mt-8 text-xs text-[var(--color-stone)] sm:mt-10 sm:text-sm"
            >
              {[
                { icon: Leaf, label: "Prirodzené výsledky" },
                { icon: Heart, label: "Individuálny prístup" },
                { icon: Gem, label: "Prémiové produkty" },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
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

          <div className="hero-mobile-image relative mt-8 aspect-[3/4] shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:mt-10 md:hidden">
            <Image
              src={heroSalonPhoto.src}
              alt={heroSalonPhoto.alt}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-5 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-6 lg:px-10 xl:px-14 2xl:px-16">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span
              aria-hidden="true"
              className="mx-auto block h-px w-14 rounded-full bg-[linear-gradient(90deg,transparent,var(--color-powder),transparent)]"
            />
            <h2 className="mt-5 font-serif text-[2rem] font-medium text-[var(--color-charcoal)] sm:text-[2.35rem]">
              Galéria salónu
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-stone)] sm:text-[15px]">
              Priestor, atmosféra a detaily salónu Timea Skincare.
            </p>
          </div>
        </ScrollReveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {homeGallery.map((item, index) => (
            <ScrollReveal key={item.src} staggerIndex={index} className="min-w-0">
              <Link
                href="/galeria"
                aria-label="Otvoriť galériu salónu Timea Skincare"
                className="gallery-home-card group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    quality={88}
                    sizes="(min-width: 1280px) 240px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
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

      <section
        id="o-salone"
        className="border-y border-[var(--color-line)] bg-[linear-gradient(160deg,var(--color-surface),var(--color-surface-elevated))] text-[var(--color-charcoal)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(226,138,180,0.24)] bg-[linear-gradient(150deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.26)] sm:rounded-[2rem] sm:p-10 lg:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(226,138,180,0.18),transparent_70%)]"
            />
            <div className="relative grid gap-6 sm:gap-10 md:grid-cols-[1fr_0.9fr] md:items-start">
              <ScrollReveal className="min-w-0">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-powder)] sm:text-sm sm:tracking-[0.18em]">
                    O mne
                  </p>
                  <h2 className="mt-3 max-w-xl font-serif text-2xl font-semibold leading-tight text-[var(--color-charcoal)] sm:mt-4 sm:text-4xl">
                    Kozmetika v Novej Bani s osobným prístupom
                  </h2>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-powder)] sm:text-base">
                    Precízny. Prirodzený. Osobný. Pokojný.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal staggerIndex={1} className="min-w-0">
                <AboutMe />
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
