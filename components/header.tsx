"use client";

import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

function Brand({
  onNavigate,
  size = "default",
}: {
  onNavigate?: () => void;
  size?: "default" | "compact";
}) {
  return (
    <Link
      href="/"
      aria-label="Timea Skincare - domov"
      className="flex w-fit shrink-0 flex-col items-start leading-none"
      onClick={onNavigate}
    >
      <span
        className={cn(
          "whitespace-nowrap font-[family-name:var(--font-brand)] leading-none tracking-[0.01em] text-[var(--color-charcoal)]",
          size === "compact" ? "text-[22px]" : "text-[26px] sm:text-[28px]",
        )}
      >
        Timea Skincare
      </span>
      <span
        className={cn(
          "mt-1 whitespace-nowrap font-medium uppercase text-[var(--color-stone)]",
          size === "compact"
            ? "text-[7px] tracking-[0.18em]"
            : "text-[8px] tracking-[0.26em] sm:text-[9px] sm:tracking-[0.32em]",
        )}
      >
        Krása, ktorá vyžaruje teba
      </span>
    </Link>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

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

  // Scroll-spy: on the homepage, track which in-page section (nav hash links)
  // is currently crossing the middle of the viewport so only one nav item is
  // active at a time.
  useEffect(() => {
    if (pathname !== "/") return;

    const ids = navigation
      .filter((item) => item.href.startsWith("/#"))
      .map((item) => item.href.slice(2));

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        const next = ids.find((id) => visible.has(id)) ?? null;
        setActiveSection(next);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      setActiveSection(null);
    };
  }, [pathname]);

  const headerHidden = isHidden && !isOpen;

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && activeSection === href.slice(2);
    }
    if (href === "/") {
      return pathname === "/" && activeSection === null;
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(14,10,14,0.86)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        headerHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto grid h-[58px] w-full max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-8 lg:h-[68px] lg:px-10 xl:px-14 2xl:px-16">
        <Brand onNavigate={() => setIsOpen(false)} />

        <nav
          className="col-start-2 hidden items-center justify-center gap-1 lg:flex xl:gap-1.5"
          aria-label="Hlavná navigácia"
        >
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[15px] font-medium tracking-[0.02em] transition xl:px-4 xl:text-[16px]",
                  active
                    ? "text-[var(--color-powder)]"
                    : "text-[rgba(247,241,235,0.88)] hover:text-[var(--color-charcoal)]",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3.5 bottom-0.5 h-px rounded-full bg-[var(--color-powder)] opacity-80 xl:inset-x-4"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-1.5 sm:gap-2">
          <Link
            href="/kontakt#rezervacia"
            className="hidden min-h-9 items-center gap-2 rounded-full border border-[rgba(226,138,180,0.36)] px-4 py-1.5 text-[14px] font-medium text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[var(--color-blush)] md:inline-flex xl:min-h-10 xl:px-5 xl:text-[15px]"
            onClick={() => setIsOpen(false)}
          >
            <CalendarDays size={15} aria-hidden="true" className="text-[var(--color-powder)]" />
            Online rezervácia
          </Link>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Timea Skincare (otvorí sa v novom okne)"
            className="hidden size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-stone)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-charcoal)] sm:inline-flex"
          >
            <FaInstagram size={15} aria-hidden="true" />
          </a>
          <a
            href={siteConfig.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Timea Skincare (otvorí sa v novom okne)"
            className="hidden size-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-stone)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-charcoal)] sm:inline-flex"
          >
            <FaFacebookF size={14} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(250,248,246,0.06)] text-[var(--color-charcoal)] transition duration-300 hover:border-[rgba(226,138,180,0.55)] hover:bg-[rgba(226,138,180,0.14)] active:scale-95 lg:hidden"
            aria-label={isOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X size={17} aria-hidden="true" className="transition-transform duration-300 ease-out" />
            ) : (
              <Menu size={17} aria-hidden="true" className="transition-transform duration-300 ease-out" />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-40 border-t border-[rgba(255,255,255,0.1)] bg-[linear-gradient(175deg,rgba(16,16,15,0.98)_0%,rgba(23,22,21,0.98)_64%,rgba(26,22,25,0.98)_100%)] px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-2 lg:hidden mobile-menu-overlay">
          <div className="mobile-menu-panel mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(152deg,rgba(250,248,246,0.1)_0%,rgba(250,248,246,0.04)_100%)] px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <Brand size="compact" onNavigate={() => setIsOpen(false)} />
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
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "mobile-menu-item group flex min-h-10 items-center justify-between rounded-xl border-b border-[rgba(250,248,246,0.12)] px-2 py-2 text-sm font-medium transition duration-300 hover:bg-[rgba(250,248,246,0.08)] active:bg-[rgba(217,121,168,0.14)]",
                    isActive(item.href) ? "text-[var(--color-powder)]" : "text-[rgba(247,241,235,0.92)]",
                  )}
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
                Online rezervácia
              </Link>
              <div
                className="mobile-menu-item mt-2 flex items-center justify-center gap-3"
                style={{ animationDelay: `${(navigation.length + 1) * 70}ms` }}
              >
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Timea Skincare (otvorí sa v novom okne)"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-[rgba(247,241,235,0.9)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-powder)]"
                  onClick={() => setIsOpen(false)}
                >
                  <FaInstagram size={18} aria-hidden="true" />
                </a>
                <a
                  href={siteConfig.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Timea Skincare (otvorí sa v novom okne)"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-[rgba(247,241,235,0.9)] transition hover:border-[var(--color-powder)] hover:text-[var(--color-powder)]"
                  onClick={() => setIsOpen(false)}
                >
                  <FaFacebookF size={16} aria-hidden="true" />
                </a>
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
