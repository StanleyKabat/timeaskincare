"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

import { siteConfig } from "@/data/site";

type MapEmbedProps = {
  /** Visible placeholder text shown before the map is loaded. */
  placeholderText?: string;
  /** Label of the button that loads the map. */
  buttonLabel?: string;
  /** Accessible title of the loaded map iframe. */
  iframeTitle?: string;
};

/**
 * Two-click Google Maps embed: the iframe is not present in the DOM until
 * the visitor explicitly clicks the button, so Google sets no cookies
 * before that interaction. Text defaults to Slovak; other locales can pass
 * translated labels without changing the loading behavior.
 */
export function MapEmbed({
  placeholderText = "Mapa Google Maps sa načíta až po kliknutí. Pri načítaní mapy môže Google spracúvať technické údaje podľa svojich pravidiel.",
  buttonLabel = "Načítať mapu",
  iframeTitle = "Mapa salónu Timea Skincare",
}: MapEmbedProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        src={siteConfig.mapsEmbedUrl}
        title={iframeTitle}
        className="h-52 w-full border-0 grayscale invert-[0.9] hue-rotate-180 saturate-[0.65] sm:h-72"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="flex h-52 w-full flex-col items-center justify-center gap-4 bg-[rgba(255,255,255,0.03)] px-6 text-center sm:h-72">
      <span className="grid size-10 place-items-center rounded-full border border-[rgba(226,138,180,0.32)]">
        <MapPin size={18} aria-hidden="true" className="text-[var(--color-powder)]" />
      </span>
      <p className="max-w-xs text-xs leading-5 text-[var(--color-stone)]">{placeholderText}</p>
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(226,138,180,0.36)] px-5 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] hover:bg-[var(--color-blush)]"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
