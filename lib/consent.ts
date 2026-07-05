/**
 * Client-side cookie-consent + Google Consent Mode v2 helpers.
 *
 * Privacy model:
 * - Necessary storage only (the consent choice itself) is always allowed.
 * - Analytics (GA4) and Marketing (Google Ads) are opt-in.
 * - Consent Mode v2 defaults everything to "denied" before any Google tag can
 *   run; it is updated to "granted" only after an explicit user choice.
 * - No personal data is ever sent to Google (see trackEvent contract below).
 */

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = ConsentState & { ts: number };

export const CONSENT_STORAGE_KEY = "timea_cookie_consent";

/** ~6 months. After this the banner is shown again so consent stays fresh. */
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;

/** Public (build-time inlined) Google IDs. Absent ⇒ the related tag never loads. */
export const googleConfig = {
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  adsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  bookingLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_BOOKING || "",
  voucherLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL_VOUCHER || "",
} as const;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  return typeof window.gtag === "function" ? window.gtag : null;
}

/** Reads a stored, non-expired consent choice. Returns null if none/expired. */
export function readStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (typeof parsed?.ts !== "number") return null;
    if (Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return { analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) };
  } catch {
    return null;
  }
}

/** Persists the consent choice (only categories + timestamp, no personal data). */
export function writeStoredConsent(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    const value: StoredConsent = { ...state, ts: Date.now() };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); consent simply won't persist.
  }
}

/** Pushes a Consent Mode v2 update reflecting the user's choice. */
export function applyConsentUpdate(state: ConsentState) {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("consent", "update", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  });
}

/**
 * Sends a GA4 event — ONLY when analytics consent is stored and GA is present.
 * Callers must pass non-personal parameters only (locale, page_path, counts,
 * voucher amount). Never pass name/email/phone/notes/recipient.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const consent = readStoredConsent();
  if (!consent?.analytics) return;
  const gtag = getGtag();
  if (!gtag || !googleConfig.gaId) return;
  gtag("event", name, { page_path: window.location.pathname, ...params });
}

/**
 * Fires a Google Ads conversion — ONLY when marketing consent is stored and the
 * Ads ID + the relevant conversion label are configured.
 */
export function fireAdsConversion(
  kind: "booking" | "voucher",
  params: { value?: number; currency?: string } = {},
) {
  if (typeof window === "undefined") return;
  const consent = readStoredConsent();
  if (!consent?.marketing) return;
  const gtag = getGtag();
  const { adsId, bookingLabel, voucherLabel } = googleConfig;
  const label = kind === "booking" ? bookingLabel : voucherLabel;
  if (!gtag || !adsId || !label) return;
  gtag("event", "conversion", {
    send_to: `${adsId}/${label}`,
    ...(typeof params.value === "number"
      ? { value: params.value, currency: params.currency ?? "EUR" }
      : {}),
  });
}
