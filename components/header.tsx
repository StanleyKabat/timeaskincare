"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { navigation } from "@/data/site";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;

        if (currentY < 80) {
          setIsHidden(false);
        } else if (Math.abs(delta) > 6) {
          setIsHidden(delta > 0);
        }

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHidden = isHidden && !isOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-[var(--color-line)] bg-[rgba(16,16,15,0.9)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none ${
        headerHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          aria-label="Timea Skincare - domov"
          className="flex min-w-0 items-center"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/images/timea-skincare-logo-white.png"
            alt="Timea Skincare"
            width={728}
            height={165}
            sizes="(min-width: 640px) 200px, 165px"
            className="h-8 w-auto shrink-0 sm:h-9"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hlavná navigácia">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-stone)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-charcoal)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/kontakt#rezervacia"
            className="hidden min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-powder)] px-5 py-2 text-sm font-semibold text-[var(--color-ink)] shadow-[0_12px_34px_rgba(226,138,180,0.22)] transition hover:bg-[var(--color-charcoal)] sm:inline-flex"
            onClick={() => setIsOpen(false)}
          >
            <CalendarDays size={17} aria-hidden="true" />
            Rezervovať
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(250,248,246,0.06)] text-[var(--color-charcoal)] transition duration-300 hover:border-[rgba(226,138,180,0.55)] hover:bg-[rgba(226,138,180,0.14)] active:scale-95 md:hidden"
            aria-label={isOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out"
              />
            ) : (
              <Menu
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out"
              />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-40 border-t border-[rgba(255,255,255,0.1)] bg-[linear-gradient(175deg,rgba(16,16,15,0.98)_0%,rgba(23,22,21,0.98)_64%,rgba(26,22,25,0.98)_100%)] px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-2 md:hidden mobile-menu-overlay">
          <div className="mobile-menu-panel mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(152deg,rgba(250,248,246,0.1)_0%,rgba(250,248,246,0.04)_100%)] px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="inline-flex min-w-0 items-center gap-2.5">
                <Image
                  src="/images/timea-skincare-logo-white.png"
                  alt="Timea Skincare"
                  width={728}
                  height={165}
                  sizes="160px"
                  className="h-8 w-auto shrink-0"
                  priority
                />
              </div>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(250,248,246,0.08)] text-[var(--color-charcoal)] transition duration-300 hover:border-[rgba(217,121,168,0.5)] hover:bg-[rgba(217,121,168,0.14)] active:scale-95"
                aria-label="Zavrieť menu"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} aria-hidden="true" className="transition-transform duration-300 hover:rotate-90" />
              </button>
            </div>

            <nav className="grid gap-1 pb-0.5" aria-label="Mobilná navigácia">
              {navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mobile-menu-item group flex min-h-10 items-center justify-between rounded-xl border-b border-[rgba(250,248,246,0.12)] px-2 py-2 text-sm font-medium text-[rgba(247,241,235,0.92)] transition duration-300 hover:bg-[rgba(250,248,246,0.08)] active:bg-[rgba(217,121,168,0.14)]"
                  style={{ animationDelay: `${index * 70}ms` }}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[rgba(217,121,168,0.82)] transition group-hover:scale-110" />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[rgba(250,248,246,0.44)] transition group-hover:text-[rgba(250,248,246,0.72)]">
                    ✦
                  </span>
                </Link>
              ))}
              <Link
                href="/kontakt#rezervacia"
                className="mobile-menu-item mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(250,248,246,0.5)] bg-[linear-gradient(135deg,#d979a8_0%,#f6dce7_100%)] px-4 py-2.5 text-[15px] font-semibold text-[#242629] shadow-[0_14px_34px_rgba(217,121,168,0.4)] transition duration-300 hover:brightness-105 active:scale-[0.99]"
                style={{ animationDelay: `${navigation.length * 70}ms` }}
                onClick={() => setIsOpen(false)}
              >
                <CalendarDays size={18} aria-hidden="true" />
                Rezervovať termín
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
