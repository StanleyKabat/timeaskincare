import type { ReactNode } from "react";

import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHeading } from "@/components/section-heading";

export type PrivacySection = { heading: string; body: ReactNode };

type PrivacyPolicyPageProps = {
  intro: { eyebrow: string; title: string; text: string };
  sections: PrivacySection[];
};

/**
 * Shared privacy/GDPR page layout used by both the Slovak
 * (`/ochrana-osobnych-udajov`) and English (`/en/privacy-policy`) routes.
 * Structure and styling are identical; only the localized text differs.
 */
export function PrivacyPolicyPage({ intro, sections }: PrivacyPolicyPageProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <ScrollReveal>
        <SectionHeading eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
      </ScrollReveal>

      <ScrollReveal className="mt-8 block">
        <div className="space-y-6 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-sm leading-6 text-[var(--color-stone)] sm:p-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-base font-semibold text-[var(--color-charcoal)]">
                {section.heading}
              </h2>
              <p className="mt-2">{section.body}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
