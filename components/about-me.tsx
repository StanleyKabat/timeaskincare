"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { ButtonLink } from "@/components/button-link";

type AboutMeProps = {
  intro: string;
  paragraphs: readonly string[];
  moreLabel: string;
  lessLabel: string;
  ctaHref: string;
  ctaLabel: string;
};

/**
 * Personal intro with an elegant expand/collapse: the first paragraph is the
 * preview, the rest expands with a smooth grid-rows height transition.
 */
export function AboutMe({
  intro,
  paragraphs,
  moreLabel,
  lessLabel,
  ctaHref,
  ctaLabel,
}: AboutMeProps) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  return (
    <div className="text-sm leading-7 text-[rgba(247,241,235,0.82)] sm:text-base sm:leading-8">
      <p>{intro}</p>

      <div
        id={regionId}
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-4">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls={regionId}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-powder)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:underline"
      >
        {expanded ? lessLabel : moreLabel}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div>
        <ButtonLink href={ctaHref} variant="secondary" className="mt-6">
          {ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
