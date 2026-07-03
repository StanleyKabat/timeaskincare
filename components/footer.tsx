"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

import { navigation, navigationEn, siteConfig } from "@/data/site";
import { getLocaleFromPathname } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? "/");
  const navItems = locale === "en" ? navigationEn : navigation;
  const dictionary = getDictionary(locale);

  const privacyHref = locale === "en" ? "/en/privacy-policy" : "/ochrana-osobnych-udajov";

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[rgba(226,138,180,0.32)] bg-[#d979a8] shadow-[0_10px_28px_rgba(217,121,168,0.14)]">
              <Image
                src="/images/timea-skincare-logo.jpg"
                alt="Timea Skincare logo"
                fill
                sizes="44px"
                className="object-contain p-1.5"
              />
            </span>
            <p className="text-lg font-semibold text-[var(--color-charcoal)]">
              {siteConfig.name}
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-stone)]">
            {dictionary.footer.tagline}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">
            {dictionary.footer.navHeading}
          </p>
          <div className="mt-3 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--color-stone)] hover:text-[var(--color-powder)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={privacyHref}
              className="text-sm text-[var(--color-stone)] hover:text-[var(--color-powder)]"
            >
              {dictionary.nav.privacy}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">
            {dictionary.footer.contactHeading}
          </p>
          <div className="mt-3 grid gap-3 text-sm text-[var(--color-stone)]">
            <p className="flex gap-2.5">
              <MapPin className="mt-0.5 shrink-0 text-[var(--color-powder)]" size={16} aria-hidden="true" />
              <span className="min-w-0 break-words">{siteConfig.address}</span>
            </p>
            <a
              href={siteConfig.phoneHref}
              className="flex min-h-10 items-center gap-2.5 transition hover:text-[var(--color-powder)]"
            >
              <Phone className="shrink-0 text-[var(--color-powder)]" size={16} aria-hidden="true" />
              <span className="min-w-0 break-words">{siteConfig.phone}</span>
            </a>
            <a
              href={siteConfig.emailHref}
              className="flex min-h-10 items-center gap-2.5 transition hover:text-[var(--color-powder)]"
            >
              <Mail className="shrink-0 text-[var(--color-powder)]" size={16} aria-hidden="true" />
              <span className="min-w-0 break-all">{siteConfig.email}</span>
            </a>
          </div>

          <p className="mt-5 text-sm font-semibold text-[var(--color-charcoal)]">
            {dictionary.footer.socialHeading}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dictionary.social.instagram}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[var(--color-blush)]"
            >
              <FaInstagram size={16} aria-hidden="true" className="text-[var(--color-powder)]" />
              Instagram
            </a>
            <a
              href={siteConfig.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dictionary.social.facebook}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[var(--color-blush)]"
            >
              <FaFacebookF size={14} aria-hidden="true" className="text-[var(--color-powder)]" />
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)] px-4 py-4 text-center text-xs text-[var(--color-stone)]">
        © {new Date().getFullYear()} {siteConfig.name}. {dictionary.footer.rights}
      </div>
    </footer>
  );
}
