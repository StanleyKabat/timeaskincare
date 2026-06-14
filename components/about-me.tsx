"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { ButtonLink } from "@/components/button-link";

/**
 * Personal intro with an elegant expand/collapse: the first paragraph is the
 * preview, the rest expands with a smooth grid-rows height transition.
 */
export function AboutMe() {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  return (
    <div className="text-sm leading-7 text-[rgba(247,241,235,0.82)] sm:text-base sm:leading-8">
      <p>
        Volám sa Tímea a kozmetike sa venujem už viac ako dva a pol roka. Je to pre mňa
        vášeň, radosť a práca, ktorá ma napĺňa každý deň.
      </p>

      <div
        id={regionId}
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-4">
            <p>
              Vždy som mala blízko ku kreatívnej a tvorivej práci, no zároveň ma prirodzene
              bavila starostlivosť o druhých. Práve kozmetika pre mňa spája cit pre detail,
              estetiku, jemnosť a osobný prístup ku každej zákazníčke.
            </p>
            <p>
              Pri práci je pre mňa najdôležitejšia precíznosť, prirodzený výsledok a
              spokojnosť zákazníčky. Každej venujem svoj čas a pozornosť, pretože chcem, aby
              návšteva u mňa bola nielen o výsledku, ale aj o príjemnom pocite, oddychu a
              dôvere.
            </p>
            <p>
              U mňa sa nemusíš hanbiť za svoju pleť ani za to, že prichádzaš s problémom. Som
              tu na to, aby som ti pomohla nájsť vhodné riešenie jemne, precízne a s rešpektom
              k tomu, čo si praješ.
            </p>
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
        {expanded ? "Zobraziť menej" : "Prečítať si viac"}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div>
        <ButtonLink href="/kontakt#rezervacia" variant="secondary" className="mt-6">
          Kontaktovať salón
        </ButtonLink>
      </div>
    </div>
  );
}
