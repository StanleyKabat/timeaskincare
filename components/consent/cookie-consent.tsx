"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useConsent } from "@/components/consent/consent-provider";
import { getLocaleFromPathname } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
        checked
          ? "border-[var(--color-powder)] bg-[var(--color-powder)]"
          : "border-[var(--color-line)] bg-[var(--color-surface-elevated)]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow transition ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export function CookieConsent() {
  const {
    mounted,
    decided,
    consent,
    settingsOpen,
    openSettings,
    closeSettings,
    save,
    acceptAll,
    rejectOptional,
  } = useConsent();

  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? "/");
  const t = getDictionary(locale).cookies;

  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  useEffect(() => {
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
  }, [consent, settingsOpen]);

  if (!mounted) return null;

  const showBanner = !decided && !settingsOpen;

  if (!showBanner && !settingsOpen) return null;

  return (
    <>
      {showBanner ? (
        <div
          role="region"
          aria-label={t.bannerAriaLabel}
          className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <p className="min-w-0 text-xs leading-5 text-[var(--color-stone)] sm:text-sm sm:leading-6">
              {t.bannerText}
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={rejectOptional}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                {t.rejectOptional}
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                {t.settings}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-powder)] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                {t.acceptAll}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.modalTitle}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeSettings();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
                {t.modalTitle}
              </h2>
              <button
                type="button"
                onClick={closeSettings}
                aria-label={t.close}
                className="rounded-full px-2 py-1 text-sm text-[var(--color-stone)] transition hover:text-[var(--color-powder)]"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">{t.modalIntro}</p>

            <div className="mt-5 grid gap-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--color-line)] p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    {t.necessaryTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">
                    {t.necessaryText}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Toggle checked disabled label={t.necessaryTitle} />
                  <span className="text-[10px] uppercase tracking-wide text-[var(--color-stone)]">
                    {t.alwaysOn}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--color-line)] p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    {t.analyticsTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">
                    {t.analyticsText}
                  </p>
                </div>
                <Toggle
                  checked={analytics}
                  onChange={setAnalytics}
                  label={`${t.toggleAriaLabel}: ${t.analyticsTitle}`}
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--color-line)] p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                    {t.marketingTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">
                    {t.marketingText}
                  </p>
                </div>
                <Toggle
                  checked={marketing}
                  onChange={setMarketing}
                  label={`${t.toggleAriaLabel}: ${t.marketingTitle}`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectOptional}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
              >
                {t.rejectOptional}
              </button>
              <button
                type="button"
                onClick={() => save({ analytics, marketing })}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-powder)] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
