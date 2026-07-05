"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useConsent } from "@/components/consent/consent-provider";
import { googleConfig } from "@/lib/consent";

/** IDs already sent to gtag `config` (module-scoped so it survives re-renders). */
const configured = new Set<string>();

/**
 * Loads Google's gtag.js only after the relevant consent is granted and the
 * matching IDs exist. GA4 loads on analytics consent; Google Ads on marketing
 * consent. A single gtag.js library serves both; each ID is configured once.
 */
export function GoogleTags() {
  const { consent } = useConsent();

  const loadGa = consent.analytics && Boolean(googleConfig.gaId);
  const loadAds = consent.marketing && Boolean(googleConfig.adsId);
  const primaryId = loadGa ? googleConfig.gaId : googleConfig.adsId;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    if (loadGa && googleConfig.gaId && !configured.has(googleConfig.gaId)) {
      configured.add(googleConfig.gaId);
      window.gtag("config", googleConfig.gaId, { anonymize_ip: true });
    }
    if (loadAds && googleConfig.adsId && !configured.has(googleConfig.adsId)) {
      configured.add(googleConfig.adsId);
      window.gtag("config", googleConfig.adsId);
    }
  }, [loadGa, loadAds]);

  if (!primaryId) return null;

  return (
    <Script
      id="gtag-js"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
    />
  );
}
