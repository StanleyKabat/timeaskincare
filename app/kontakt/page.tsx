import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

import { BookingForm } from "@/components/booking-form";
import { ButtonLink } from "@/components/button-link";
import { MapEmbed } from "@/components/map-embed";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site";

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

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Kontakt"
            title="Rezervácia termínu"
            text="Termín si môžeš dohodnúť telefonicky, cez sociálne siete alebo priamo cez krátky formulár na stránke."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-2.5 px-4 pb-5 sm:gap-4 sm:px-6 sm:pb-10 md:grid-cols-3 lg:px-8">
        <ScrollReveal staggerIndex={0} className="min-w-0">
          <a
            href={siteConfig.phoneHref}
            className="interactive-card block h-full min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 transition hover:border-[var(--color-powder)] sm:p-6"
          >
            <Phone className="text-[var(--color-powder)]" size={21} aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-[var(--color-charcoal)] sm:mt-5 sm:text-lg">
              Telefonicky
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:leading-6">
              Zavolaj do salónu a termín dohodneme najrýchlejšie.
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-charcoal)] sm:mt-4">
              {siteConfig.phone}
            </p>
          </a>
        </ScrollReveal>

        <ScrollReveal staggerIndex={1} className="min-w-0">
          <div className="interactive-card h-full min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 sm:p-6">
            <MessageCircle className="text-[var(--color-powder)]" size={21} aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-[var(--color-charcoal)] sm:mt-5 sm:text-lg">
              Cez sociálne siete
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:leading-6">
              Napíš správu cez Instagram alebo Facebook.
            </p>
          <div className="mt-3 flex flex-wrap gap-2.5 sm:mt-4">
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Timea Skincare (otvorí sa v novom okne)"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)] sm:min-h-10 sm:px-4 sm:py-2"
            >
              Instagram
            </a>
            <a
              href={siteConfig.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Timea Skincare (otvorí sa v novom okne)"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)] sm:min-h-10 sm:px-4 sm:py-2"
            >
              Facebook
            </a>
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal staggerIndex={2} className="min-w-0">
          <a
            href="#rezervacia"
            className="interactive-card block h-full min-w-0 rounded-lg border border-[rgba(226,138,180,0.42)] bg-[linear-gradient(145deg,rgba(226,138,180,0.12),var(--color-surface))] p-3.5 transition hover:border-[var(--color-powder)] sm:p-6"
          >
            <CalendarDays className="text-[var(--color-powder)]" size={21} aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-[var(--color-charcoal)] sm:mt-5 sm:text-lg">
              Formulárom
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-charcoal)] sm:leading-6">
              Vyplň meno, e-mail a telefón. Ozvem sa ti s potvrdením termínu.
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-charcoal)] sm:mt-4">
              Rezervovať na stránke
            </p>
          </a>
        </ScrollReveal>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-12 sm:gap-8 sm:px-6 sm:pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="order-1 min-w-0 lg:order-2">
          <div
            aria-hidden="true"
            className="mb-3 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(226,138,180,0.48),transparent)] lg:hidden"
          />
          <ScrollReveal className="min-w-0">
            <Suspense
            fallback={
              <div className="w-full min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-stone)]">
                Načítavam rezervačný formulár...
              </div>
            }
          >
            <BookingForm />
          </Suspense>
          </ScrollReveal>
        </div>

        <aside className="order-2 min-w-0 space-y-3 sm:space-y-5 lg:order-1">
          <ScrollReveal staggerIndex={0} className="min-w-0">
            <div className="min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-charcoal)] sm:text-xl">
              Kontakt na salón
            </h2>
            <div className="mt-4 grid gap-3 text-sm text-[var(--color-stone)] sm:mt-5 sm:gap-4">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                <span className="min-w-0 break-words">{siteConfig.address}</span>
              </p>
              <a
                href={siteConfig.phoneHref}
                className="flex gap-3 transition hover:text-[var(--color-powder)]"
              >
                <Phone className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                <span className="min-w-0 break-words">{siteConfig.phone}</span>
              </a>
              <a
                href={siteConfig.emailHref}
                className="flex gap-3 transition hover:text-[var(--color-powder)]"
              >
                <Mail className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                <span className="min-w-0 break-all">{siteConfig.email}</span>
              </a>
            </div>
          </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={1} className="min-w-0">
            <div className="min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-charcoal)] sm:text-lg">
              Rýchle odkazy
            </h2>
            <div className="mt-5 grid gap-2">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Timea Skincare (otvorí sa v novom okne)"
                className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[rgba(226,138,180,0.06)]"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full border border-[rgba(226,138,180,0.32)] text-xs font-bold text-[var(--color-powder)]">
                    <FaInstagram size={16} aria-hidden="true" />
                  </span>
                  Instagram
                </span>
                <ExternalLink
                  size={15}
                  className="text-[var(--color-stone)] transition group-hover:text-[var(--color-powder)]"
                  aria-hidden="true"
                />
              </a>
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Timea Skincare (otvorí sa v novom okne)"
                className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[rgba(226,138,180,0.06)]"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full border border-[rgba(226,138,180,0.32)] font-serif text-lg font-bold leading-none text-[var(--color-powder)]">
                    <FaFacebookF size={14} aria-hidden="true" />
                  </span>
                  Facebook
                </span>
                <ExternalLink
                  size={15}
                  className="text-[var(--color-stone)] transition group-hover:text-[var(--color-powder)]"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={2} className="min-w-0">
            <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={22} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    Kde nájdeš salón
                  </p>
                  <p className="mt-2 break-words text-xs leading-5 text-[var(--color-stone)]">
                    {siteConfig.address}
                  </p>
                </div>
              </div>
            </div>
            <MapEmbed />
            <div className="border-t border-[var(--color-line)] p-4 text-center">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                Otvoriť v Google Maps
              </a>
            </div>
          </div>
          </ScrollReveal>
        </aside>
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
              Chceš si najprv pozrieť služby alebo ceny?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              Prejdi si ponuku a cenník pred odoslaním rezervácie.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/sluzby" variant="secondary">
              Pozrieť služby
            </ButtonLink>
            <ButtonLink href="/cennik">Pozrieť cenník</ButtonLink>
          </div>
        </div>
        </ScrollReveal>
      </section>
    </>
  );
}
