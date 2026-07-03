import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

import { ButtonLink } from "@/components/button-link";
import { MapEmbed } from "@/components/map-embed";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/data/site";

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
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Contact"
            title="Contact and booking"
            text="Would you like to book an appointment or ask which treatment is right for you? Feel free to contact me — I will gladly help you choose the best option."
          />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-12 sm:gap-8 sm:px-6 sm:pb-14 lg:grid-cols-2 lg:px-8">
        <aside className="min-w-0 space-y-3 sm:space-y-5">
          <ScrollReveal staggerIndex={0} className="min-w-0">
            <div className="min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
              <h2 className="text-base font-semibold text-[var(--color-charcoal)] sm:text-xl">
                Contact
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-[var(--color-stone)] sm:mt-5 sm:gap-4">
                <p className="flex gap-3">
                  <MapPin className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                  <span className="min-w-0 break-words">
                    <span className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-charcoal)]">
                      Address
                    </span>
                    {siteConfig.address}
                  </span>
                </p>
                <a
                  href={siteConfig.phoneHref}
                  className="flex gap-3 transition hover:text-[var(--color-powder)]"
                >
                  <Phone className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                  <span className="min-w-0 break-words">
                    <span className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-charcoal)]">
                      Phone
                    </span>
                    {siteConfig.phone}
                  </span>
                </a>
                <a
                  href={siteConfig.emailHref}
                  className="flex gap-3 transition hover:text-[var(--color-powder)]"
                >
                  <Mail className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={18} />
                  <span className="min-w-0 break-all">
                    <span className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-charcoal)]">
                      Email
                    </span>
                    {siteConfig.email}
                  </span>
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerIndex={1} className="min-w-0">
            <div className="min-w-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-6">
              <h2 className="text-base font-semibold text-[var(--color-charcoal)] sm:text-lg">
                Social media
              </h2>
              <div className="mt-5 grid gap-2">
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Timea Skincare (opens in a new window)"
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
                  aria-label="Facebook Timea Skincare (opens in a new window)"
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
        </aside>

        <ScrollReveal staggerIndex={2} className="min-w-0">
          <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={22} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    Where to find the salon
                  </p>
                  <p className="mt-2 break-words text-xs leading-5 text-[var(--color-stone)]">
                    {siteConfig.address}
                  </p>
                </div>
              </div>
            </div>
            <MapEmbed
              placeholderText="Google Maps will load only after you click. When the map loads, Google may process technical data according to its own policies."
              buttonLabel="Load map"
              iframeTitle="Timea Skincare salon map"
            />
            <div className="border-t border-[var(--color-line)] p-4 text-center">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-charcoal)] sm:text-2xl">
                Would you like to book an appointment?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--color-stone)]">
                The booking form is currently available in Slovak. If you are not sure which service
                to choose, you can still send a request or contact me directly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/en/services" variant="secondary">
                View services
              </ButtonLink>
              <ButtonLink href="/kontakt#rezervacia">Book an appointment</ButtonLink>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
