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
import type { Locale } from "@/lib/i18n/config";

export type ContactPageText = {
  eyebrow: string;
  title: string;
  intro: string;
  cardPhoneTitle: string;
  cardPhoneText: string;
  cardSocialTitle: string;
  cardSocialText: string;
  cardFormTitle: string;
  cardFormText: string;
  cardFormCta: string;
  contactHeading: string;
  quickLinksHeading: string;
  mapHeading: string;
  mapExternalButton: string;
  ctaHeading: string;
  ctaText: string;
  ctaServices: string;
  ctaPricing: string;
  formFallback: string;
  mapPlaceholder: string;
  mapButton: string;
  mapIframeTitle: string;
  instagramAria: string;
  facebookAria: string;
};

type ContactPageProps = {
  locale: Locale;
  /** Anchor/id for the booking form (`rezervacia` on Slovak, `booking` on English). */
  bookingAnchorId: string;
  text: ContactPageText;
  hrefs: {
    services: string;
    pricing: string;
  };
};

/**
 * Shared contact + booking page used by both the Slovak (`/kontakt`) and English
 * (`/en/contact`) routes. The markup, layout, spacing and responsive behavior
 * are identical for both locales; only the visible text and a few locale-aware
 * links (booking anchor, services/pricing) differ.
 */
export function ContactPage({ locale, bookingAnchorId, text, hrefs }: ContactPageProps) {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <ScrollReveal>
          <SectionHeading eyebrow={text.eyebrow} title={text.title} text={text.intro} />
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
              {text.cardPhoneTitle}
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:leading-6">
              {text.cardPhoneText}
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
              {text.cardSocialTitle}
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:leading-6">
              {text.cardSocialText}
            </p>
          <div className="mt-3 flex flex-wrap gap-2.5 sm:mt-4">
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={text.instagramAria}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)] sm:min-h-10 sm:px-4 sm:py-2"
            >
              Instagram
            </a>
            <a
              href={siteConfig.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={text.facebookAria}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)] sm:min-h-10 sm:px-4 sm:py-2"
            >
              Facebook
            </a>
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal staggerIndex={2} className="min-w-0">
          <a
            href={`#${bookingAnchorId}`}
            className="interactive-card block h-full min-w-0 rounded-lg border border-[rgba(226,138,180,0.42)] bg-[linear-gradient(145deg,rgba(226,138,180,0.12),var(--color-surface))] p-3.5 transition hover:border-[var(--color-powder)] sm:p-6"
          >
            <CalendarDays className="text-[var(--color-powder)]" size={21} aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-[var(--color-charcoal)] sm:mt-5 sm:text-lg">
              {text.cardFormTitle}
            </h2>
            <p className="mt-2 text-sm leading-5 text-[var(--color-charcoal)] sm:leading-6">
              {text.cardFormText}
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-charcoal)] sm:mt-4">
              {text.cardFormCta}
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
                {text.formFallback}
              </div>
            }
          >
            <BookingForm locale={locale} anchorId={bookingAnchorId} />
          </Suspense>
          </ScrollReveal>
        </div>

        <aside className="order-2 min-w-0 space-y-3 sm:space-y-5 lg:order-1">
          <ScrollReveal staggerIndex={0} className="min-w-0">
            <div className="min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-charcoal)] sm:text-xl">
              {text.contactHeading}
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
              {text.quickLinksHeading}
            </h2>
            <div className="mt-5 grid gap-2">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={text.instagramAria}
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
                aria-label={text.facebookAria}
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
                    {text.mapHeading}
                  </p>
                  <p className="mt-2 break-words text-xs leading-5 text-[var(--color-stone)]">
                    {siteConfig.address}
                  </p>
                </div>
              </div>
            </div>
            <MapEmbed
              placeholderText={text.mapPlaceholder}
              buttonLabel={text.mapButton}
              iframeTitle={text.mapIframeTitle}
            />
            <div className="border-t border-[var(--color-line)] p-4 text-center">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                {text.mapExternalButton}
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
              {text.ctaHeading}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-stone)]">
              {text.ctaText}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={hrefs.services} variant="secondary">
              {text.ctaServices}
            </ButtonLink>
            <ButtonLink href={hrefs.pricing}>{text.ctaPricing}</ButtonLink>
          </div>
        </div>
        </ScrollReveal>
      </section>
    </>
  );
}
