import Link from "next/link";
import Image from "next/image";

import { navigation, siteConfig } from "@/data/site";

export function Footer() {
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
            Jemná a profesionálna starostlivosť o pleť v Novej Bani.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">
            Navigácia
          </p>
          <div className="mt-3 grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--color-stone)] hover:text-[var(--color-powder)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/ochrana-osobnych-udajov"
              className="text-sm text-[var(--color-stone)] hover:text-[var(--color-powder)]"
            >
              Ochrana osobných údajov
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">
            Kontakt
          </p>
          <div className="mt-3 grid gap-2 text-sm text-[var(--color-stone)]">
            <p>{siteConfig.address}</p>
            <a href={siteConfig.phoneHref} className="hover:text-[var(--color-powder)]">
              {siteConfig.phone}
            </a>
            <a href={siteConfig.emailHref} className="hover:text-[var(--color-powder)]">
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)] px-4 py-4 text-center text-xs text-[var(--color-stone)]">
        © {new Date().getFullYear()} {siteConfig.name}. Všetky práva vyhradené.
      </div>
    </footer>
  );
}
