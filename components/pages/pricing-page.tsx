import type { ReactNode } from "react";

import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";

export type PriceItemView = {
  name: string;
  price: string;
  highlight?: string;
};

export type PriceGroupView = {
  title: string;
  items: PriceItemView[];
};

type PricingPageProps = {
  intro: { eyebrow: string; title: string; text: string };
  groups: PriceGroupView[];
  /** Locale-specific bottom section (note / CTA) rendered after the price grid. */
  footer: ReactNode;
};

/**
 * Shared pricing page layout used by both the Slovak (`/cennik`) and English
 * (`/en/pricing`) routes. The intro and price grid are identical; only the
 * resolved content and the bottom section differ by locale.
 */
export function PricingPage({ intro, groups, footer }: PricingPageProps) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal>
          <SectionHeading eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
        </ScrollReveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:gap-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        {groups.map((group, index) => (
          <ScrollReveal key={group.title} staggerIndex={index} className="min-w-0">
            <article className="interactive-card h-full rounded-lg border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-surface),var(--color-surface-elevated))] p-4 shadow-[0_22px_55px_rgba(0,0,0,0.16)] sm:p-6">
              <div className="border-b border-[var(--color-line)] pb-4 sm:pb-5">
                <h2 className="text-lg font-semibold text-[var(--color-charcoal)] sm:text-xl">
                  {group.title}
                </h2>
              </div>
              <div className="mt-2 divide-y divide-[var(--color-line)]">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:py-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium leading-6 text-[var(--color-charcoal)]">
                          {item.name}
                        </p>
                        {item.highlight ? (
                          <span className="rounded-full bg-[rgba(226,138,180,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-powder)]">
                            {item.highlight}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-left text-base font-semibold text-[var(--color-powder)] sm:text-right">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      {footer}
    </>
  );
}
