"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { toEnglishServiceName } from "@/data/booking-en";
import {
  bookableServices,
  giftVoucherPaymentConfig,
  giftVoucherTreatments,
  siteConfig,
} from "@/data/site";
import { formatDuration, getLocalTodayISO, getSlotsForDate } from "@/lib/booking";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const GIFT_VOUCHER_SERVICE_NAME = "Darčekový poukaz";

/**
 * Display-layer translations for the booking form UI.
 *
 * Only the visible labels/messages are localized. The booking backend is
 * untouched: canonical Slovak service and gift-voucher names, the API payload,
 * and the owner-facing e-mail/QR text remain unchanged for both locales.
 */
const bookingText = {
  sk: {
    servicesLabel: "Služby",
    selectedPrefix: "Vybrané:",
    totalPrefix: "Spolu:",
    zeroMin: "0 min",
    selectedBadge: "Vybraté",
    standaloneHeading: "Samostatný nákup",
    voucherNoSlot: "Nie je viazaný na časový slot",
    voucherEyebrow: "Zakúpenie poukážky",
    normalEyebrow: "Rezervácia na stránke",
    voucherTitle: "Obdarovanie",
    normalTitle: "Požiadať o termín",
    voucherIntro:
      "Vyber typ ošetrenia na poukážku a doplň údaje o darcovi a obdarovanom.",
    normalIntro:
      "Vyber jednu alebo viac služieb, dátum a vyhovujúci čas. Odošleš nezáväznú požiadavku o termín, ktorú salón potvrdí osobne.",
    voucherTypeLabel: "Typ ošetrenia na poukážku",
    voucherTypePlaceholder: "Vyber typ ošetrenia",
    voucherFromLabel: "Od koho je poukážka",
    voucherForLabel: "Pre koho je poukážka",
    voucherFromPlaceholder: "Napr. Martina",
    voucherForPlaceholder: "Napr. Lucia",
    nameLabel: "Meno a priezvisko",
    namePlaceholder: "Tvoje meno a priezvisko",
    emailLabel: "E-mail",
    emailPlaceholder: "tvoj@email.sk",
    phoneLabel: "Telefón",
    phonePlaceholder: "+421 900 000 000",
    phoneTitle: "Povolené znaky: čísla, +, medzera, zátvorky a pomlčka",
    dateLabel: "Dátum",
    slotsLegend: "Dostupné časy",
    slotsHelp:
      "Online rezervácia je dostupná minimálne 12 hodín dopredu. Termín na nasledujúci deň je možné odoslať najneskôr do 20:00.",
    slotsLoading: "Načítavam dostupné časy z kalendára...",
    slotsNone:
      "V tento deň nie sú dostupné online termíny. Salón prijíma online žiadosti od pondelka do piatka medzi 08:00 a 18:00.",
    slotsPickServices:
      "Najprv vyber jednu alebo viac služieb, aby sme vedeli vypočítať dostupné časy.",
    slotsPickDate:
      "Najprv vyber jednu alebo viac služieb a dátum, následne sa zobrazia možné časy.",
    noteLabel: "Poznámka",
    notePlaceholder: "Voliteľné: alergie, preferencia, otázka k termínu...",
    voucherNoSlotNotice:
      "Pri darčekovej poukážke sa termín teraz nevyberá. Po výbere typu ošetrenia ťa presmerujeme na QR platbu.",
    consentText:
      "Súhlasím so spracovaním osobných údajov za účelom vybavenia rezervácie, odoslania potvrdenia a pripomienky termínu e-mailom alebo SMS.",
    privacyLinkText: "Zásady ochrany osobných údajov",
    submitting: "Odosielam...",
    submitVoucher: "Pokračovať na QR platbu",
    submitNormal: "Odoslať požiadavku o termín",
    footerVoucher:
      "Po odoslaní ťa presmerujeme na QR kód pre bankový prevod darčekovej poukážky.",
    footerNormal:
      "Po odoslaní ti na e-mail príde potvrdenie o prijatí žiadosti. Termín nie je automaticky potvrdený – po kontrole dostupnosti ti pošlem potvrdenie e-mailom.",
    successInfo:
      "Ďakujem, tvoju žiadosť o rezerváciu som prijala. Na e-mail ti prišlo potvrdenie o prijatí – po kontrole dostupnosti ti pošlem potvrdenie termínu.",
    networkFallback:
      "Spojenie sa nepodarilo nadviazať, preto sa otvoril e-mail s predvyplnenou žiadosťou. Text sme skopírovali aj do schránky.",
    errPickService: "Najprv vyber jednu alebo viac služieb.",
    errPhone: "Zadaj prosím telefón v správnom formáte.",
    errVoucherType: "Vyber typ ošetrenia pre darčekový poukaz.",
    errVoucherFrom: "Doplň, od koho je darčeková poukážka.",
    errVoucherFor: "Doplň, pre koho je darčeková poukážka.",
    errVoucherUnavailable: "Vybraný typ ošetrenia nie je dostupný pre poukážku.",
    errIban: "Najprv doplň IBAN pre QR platbu darčekovej poukážky.",
    errSlotTaken: "Vybraný čas už nie je dostupný. Prosím, zvoľ iný čas.",
    errSend: "Požiadavku sa nepodarilo odoslať.",
    errSlotsLoad: "Nepodarilo sa načítať dostupné časy.",
    errSlotsLoadGeneric: "Dostupné časy sa nepodarilo načítať.",
    calendarNotConnected:
      "Kalendár ešte nie je napojený, preto sú časy zatiaľ orientačné.",
  },
  en: {
    servicesLabel: "Services",
    selectedPrefix: "Selected:",
    totalPrefix: "Total:",
    zeroMin: "0 min",
    selectedBadge: "Selected",
    standaloneHeading: "Separate purchase",
    voucherNoSlot: "Not tied to a time slot",
    voucherEyebrow: "Buying a voucher",
    normalEyebrow: "Book on the website",
    voucherTitle: "Gift someone",
    normalTitle: "Request an appointment",
    voucherIntro:
      "Choose the treatment for the voucher and fill in the giver and recipient details.",
    normalIntro:
      "Choose one or more services, a date and a suitable time. You send a non-binding appointment request, which the salon confirms personally.",
    voucherTypeLabel: "Treatment for the voucher",
    voucherTypePlaceholder: "Choose a treatment",
    voucherFromLabel: "Voucher from",
    voucherForLabel: "Voucher for",
    voucherFromPlaceholder: "E.g. Martina",
    voucherForPlaceholder: "E.g. Lucia",
    nameLabel: "First and last name",
    namePlaceholder: "Your first and last name",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    phoneLabel: "Phone",
    phonePlaceholder: "+421 900 000 000",
    phoneTitle: "Allowed characters: digits, +, space, brackets and hyphen",
    dateLabel: "Date",
    slotsLegend: "Available times",
    slotsHelp:
      "Online booking is available at least 12 hours in advance. An appointment for the next day can be sent no later than 20:00.",
    slotsLoading: "Loading available times from the calendar...",
    slotsNone:
      "There are no online appointments available on this day. The salon accepts online requests Monday to Friday between 08:00 and 18:00.",
    slotsPickServices:
      "First choose one or more services so we can calculate the available times.",
    slotsPickDate:
      "First choose one or more services and a date, then the possible times will appear.",
    noteLabel: "Note",
    notePlaceholder: "Optional: allergies, preferences, a question about the appointment...",
    voucherNoSlotNotice:
      "For a gift voucher no appointment time is selected now. After you choose the treatment, we will redirect you to the QR payment.",
    consentText:
      "I agree to the processing of my personal data for the purpose of handling the booking, sending a confirmation and an appointment reminder by email or SMS.",
    privacyLinkText: "Privacy Policy",
    submitting: "Sending...",
    submitVoucher: "Continue to QR payment",
    submitNormal: "Send appointment request",
    footerVoucher:
      "After sending, we will redirect you to a QR code for the bank transfer of the gift voucher.",
    footerNormal:
      "After sending, you will receive a confirmation of receipt by email. The appointment is not confirmed automatically – after checking availability I will send you a confirmation by email.",
    successInfo:
      "Thank you, I have received your booking request. A confirmation of receipt has been sent to your email – after checking availability I will send you the appointment confirmation.",
    networkFallback:
      "The connection could not be established, so an email with a pre-filled request was opened. We also copied the text to your clipboard.",
    errPickService: "First choose one or more services.",
    errPhone: "Please enter the phone number in a valid format.",
    errVoucherType: "Choose the treatment type for the gift voucher.",
    errVoucherFrom: "Please fill in who the gift voucher is from.",
    errVoucherFor: "Please fill in who the gift voucher is for.",
    errVoucherUnavailable: "The selected treatment type is not available for a voucher.",
    errIban: "Please add the IBAN for the gift voucher QR payment first.",
    errSlotTaken: "The selected time is no longer available. Please choose another time.",
    errSend: "The request could not be sent.",
    errSlotsLoad: "Available times could not be loaded.",
    errSlotsLoadGeneric: "Available times could not be loaded.",
    calendarNotConnected:
      "The calendar is not connected yet, so the times are approximate for now.",
  },
} as const;

function resolveServiceName(serviceName?: string | null) {
  if (!serviceName) {
    return "";
  }

  const decodedServiceName = serviceName.trim();
  const matchedService = bookableServices.find(
    (service) =>
      service.name.toLocaleLowerCase("sk-SK") ===
      decodedServiceName.toLocaleLowerCase("sk-SK"),
  );

  return matchedService?.name ?? "";
}

function formatSelectedServicesLabel(count: number, locale: Locale) {
  if (locale === "en") {
    return count === 1 ? "1 service" : `${count} services`;
  }

  if (count === 1) {
    return "1 služba";
  }

  if (count >= 2 && count <= 4) {
    return `${count} služby`;
  }

  return `${count} služieb`;
}

export function BookingForm({
  locale = "sk",
  anchorId = "rezervacia",
}: {
  locale?: Locale;
  anchorId?: string;
} = {}) {
  const t = bookingText[locale] ?? bookingText.sk;
  const privacyHref = locale === "en" ? "/en/privacy-policy" : "/ochrana-osobnych-udajov";
  // Display-only: English name for the UI while the canonical Slovak name is
  // still used for state, the API payload and duration lookups.
  const displayServiceName = (canonicalName: string) =>
    locale === "en" ? toEnglishServiceName(canonicalName) : canonicalName;
  const searchParams = useSearchParams();
  const preselectedServiceName = useMemo(
    () => resolveServiceName(searchParams.get("service")),
    [searchParams],
  );

  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>(() => {
    if (!preselectedServiceName) {
      return [];
    }

    return [preselectedServiceName];
  });
  const [selectedVoucherTreatment, setSelectedVoucherTreatment] = useState("");
  const [voucherFrom, setVoucherFrom] = useState("");
  const [voucherFor, setVoucherFor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotInfo, setSlotInfo] = useState("");
  const [submitInfo, setSubmitInfo] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedServices = useMemo(
    () =>
      selectedServiceNames
        .map((name) => bookableServices.find((service) => service.name === name))
        .filter((service): service is (typeof bookableServices)[number] => Boolean(service)),
    [selectedServiceNames],
  );
  const hasVoucherSelected = selectedServiceNames.includes(GIFT_VOUCHER_SERVICE_NAME);
  const isGiftVoucherFlow = hasVoucherSelected;

  const totalDurationMinutes = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + (typeof service.durationMinutes === "number" ? service.durationMinutes : 0),
        0,
      ),
    [selectedServices],
  );

  const selectedNormalServicesCount = useMemo(
    () => selectedServices.filter((service) => service.name !== GIFT_VOUCHER_SERVICE_NAME).length,
    [selectedServices],
  );
  const normalBookableServices = useMemo(
    () => bookableServices.filter((service) => service.name !== GIFT_VOUCHER_SERVICE_NAME),
    [],
  );
  const voucherService = useMemo(
    () => bookableServices.find((service) => service.name === GIFT_VOUCHER_SERVICE_NAME),
    [],
  );

  useEffect(() => {
    if (isGiftVoucherFlow || !selectedDate || totalDurationMinutes <= 0) {
      return;
    }

    const controller = new AbortController();

    async function loadSlots() {
      setIsLoadingSlots(true);
      setAvailableSlots([]);
      setSlotInfo("");
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          duration: String(totalDurationMinutes),
        });
        const response = await fetch(`/api/booking/slots?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          slots?: string[];
          calendarConfigured?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(locale === "en" ? t.errSlotsLoad : data.error || t.errSlotsLoad);
        }

        setAvailableSlots(data.slots ?? []);
        setSlotInfo(data.calendarConfigured === false ? t.calendarNotConnected : "");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setAvailableSlots(getSlotsForDate(selectedDate, totalDurationMinutes));
        setSlotInfo(error instanceof Error ? error.message : t.errSlotsLoadGeneric);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [isGiftVoucherFlow, selectedDate, totalDurationMinutes, t, locale]);

  function toggleService(serviceName: string) {
    setSelectedTime("");
    setSelectedDate("");
    setSelectedVoucherTreatment("");
    setVoucherFrom("");
    setVoucherFor("");

    setSelectedServiceNames((current) => {
      const isAlreadySelected = current.includes(serviceName);
      const isVoucherService = serviceName === GIFT_VOUCHER_SERVICE_NAME;

      if (isVoucherService) {
        return isAlreadySelected ? [] : [GIFT_VOUCHER_SERVICE_NAME];
      }

      const withoutVoucher = current.filter((item) => item !== GIFT_VOUCHER_SERVICE_NAME);
      if (isAlreadySelected) {
        return withoutVoucher.filter((item) => item !== serviceName);
      }

      return [...withoutVoucher, serviceName];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitInfo("");
    setSubmitError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const note = String(formData.get("note") || "");
    const company = String(formData.get("company") || "");
    const voucherTreatment = String(formData.get("voucherTreatment") || "");
    const voucherFromName = String(formData.get("voucherFrom") || "").trim();
    const voucherForName = String(formData.get("voucherFor") || "").trim();
    const date = String(formData.get("date") || "");
    const time = String(formData.get("time") || "");

    if (!selectedServices.length) {
      setSubmitError(t.errPickService);
      setIsSubmitting(false);
      return;
    }

    if (!/^[+0-9 ()-]{7,20}$/.test(phone)) {
      setSubmitError(t.errPhone);
      setIsSubmitting(false);
      return;
    }

    if (isGiftVoucherFlow) {
      if (!voucherTreatment) {
        setSubmitError(t.errVoucherType);
        setIsSubmitting(false);
        return;
      }

      if (!voucherFromName) {
        setSubmitError(t.errVoucherFrom);
        setIsSubmitting(false);
        return;
      }

      if (!voucherForName) {
        setSubmitError(t.errVoucherFor);
        setIsSubmitting(false);
        return;
      }

      const selectedTreatment = giftVoucherTreatments.find(
        (item) => item.name === voucherTreatment,
      );

      if (!selectedTreatment) {
        setSubmitError(t.errVoucherUnavailable);
        setIsSubmitting(false);
        return;
      }

      if (giftVoucherPaymentConfig.iban.includes("[DOPLNIŤ_IBAN]")) {
        setSubmitError(t.errIban);
        setIsSubmitting(false);
        return;
      }

      const amount = selectedTreatment.amount.toFixed(2);
      const paymentMessage = `${giftVoucherPaymentConfig.notePrefix} - ${voucherTreatment} - od ${voucherFromName} pre ${voucherForName}`;
      const qrPayload = `SPD*1.0*ACC:${giftVoucherPaymentConfig.iban}*AM:${amount}*CC:${giftVoucherPaymentConfig.currency}*MSG:${paymentMessage}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(qrPayload)}`;

      void navigator.clipboard
        ?.writeText(
          [
            "Platba darčekovej poukážky",
            `Meno: ${name}`,
            `E-mail: ${email}`,
            `Telefón: ${phone}`,
            `Typ ošetrenia: ${voucherTreatment}`,
            `Od koho je poukážka: ${voucherFromName}`,
            `Pre koho je poukážka: ${voucherForName}`,
            `Suma: ${amount} €`,
            `IBAN: ${giftVoucherPaymentConfig.iban}`,
            `Poznámka: ${paymentMessage}`,
          ].join("\n"),
        )
        .catch(() => undefined);

      window.location.href = qrUrl;
      return;
    }

    if (totalDurationMinutes <= 0) {
      setSubmitError(t.errPickService);
      setIsSubmitting(false);
      return;
    }

    if (!availableSlots.includes(time)) {
      setSubmitError(t.errSlotTaken);
      setIsSubmitting(false);
      return;
    }

    const normalServiceNames = selectedServices
      .filter((service) => service.name !== GIFT_VOUCHER_SERVICE_NAME)
      .map((service) => service.name);

    const subject = `Rezervácia termínu - ${name}`;
    const body = [
      "Dobrý deň,",
      "",
      "prosím o rezerváciu termínu v Timea Skincare.",
      "",
      `Meno a priezvisko: ${name}`,
      `E-mail: ${email}`,
      `Telefón: ${phone}`,
      "Služby:",
      ...normalServiceNames.map((service) => `- ${service}`),
      `Celkové orientačné trvanie: ${formatDuration(totalDurationMinutes)}`,
      `Preferovaný dátum: ${date}`,
      `Preferovaný čas: ${time}`,
      note ? `Poznámka: ${note}` : "",
      "",
      "Ďakujem.",
    ]
      .filter((line) => line !== "")
      .join("\n");

    const mailtoUrl = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          services: normalServiceNames,
          date,
          time,
          durationMinutes: totalDurationMinutes,
          note,
          company,
          locale,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        error?: string;
        smsConfigured?: boolean;
        customerSms?: "sent" | "failed" | "skipped";
      };

      if (!response.ok || !data.ok) {
        // The backend returns Slovak error strings. For the English form show a
        // generic English message so no Slovak text leaks into the EN experience.
        throw new Error(locale === "en" ? t.errSend : data.error || t.errSend);
      }

      form.reset();
      setSelectedServiceNames([]);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);

      setSubmitInfo(t.successInfo);
    } catch (error) {
      // Network-level failure: offer the e-mail fallback so the request is not lost.
      if (error instanceof TypeError) {
        void navigator.clipboard?.writeText(body).catch(() => undefined);
        window.location.href = mailtoUrl;
        setSubmitInfo(t.networkFallback);
      } else {
        setSubmitError(error instanceof Error ? error.message : t.errSend);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id={anchorId}
      onSubmit={handleSubmit}
      className="w-full min-w-0 scroll-mt-28 rounded-lg border border-[var(--color-line)] border-t-[rgba(226,138,180,0.58)] bg-[var(--color-surface)] p-4 shadow-[0_22px_55px_rgba(0,0,0,0.14)] sm:p-6"
    >
      <div className="grid min-w-0 gap-4 sm:gap-5">
        {/* Honeypot proti spamu – reálni návštevníci toto pole nevidia ani nevypĺňajú. */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Firma
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-powder)] sm:text-sm sm:tracking-[0.18em]">
            {isGiftVoucherFlow ? t.voucherEyebrow : t.normalEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-[var(--color-charcoal)] sm:text-2xl">
            {isGiftVoucherFlow ? t.voucherTitle : t.normalTitle}
          </h2>
          <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:mt-3 sm:leading-6">
            {isGiftVoucherFlow ? t.voucherIntro : t.normalIntro}
          </p>
        </div>

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
          {t.servicesLabel}
          {!isGiftVoucherFlow ? (
            <div
              className={cn(
                "inline-flex min-h-8 w-full items-center justify-between gap-3 rounded-full border px-3 py-1.5 text-[11px]",
                selectedNormalServicesCount > 0
                  ? "border-[rgba(226,138,180,0.4)] bg-[rgba(226,138,180,0.07)] text-[var(--color-charcoal)]"
                  : "border-[var(--color-line)] bg-[rgba(255,255,255,0.015)] text-[var(--color-stone)]",
              )}
            >
              <span>
                {t.selectedPrefix}{" "}
                <span className="font-semibold">
                  {formatSelectedServicesLabel(selectedNormalServicesCount, locale)}
                </span>
              </span>
              <span aria-hidden="true" className="text-[var(--color-stone)]">
                ·
              </span>
              <span>
                {t.totalPrefix}{" "}
                <span className="font-semibold">
                  {selectedNormalServicesCount > 0 ? formatDuration(totalDurationMinutes) : t.zeroMin}
                </span>
              </span>
            </div>
          ) : null}
          <div className="grid gap-1.5 md:grid-cols-2">
            {normalBookableServices.map((service) => {
              const isSelected = selectedServiceNames.includes(service.name);

              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => toggleService(service.name)}
                  className={cn(
                    "min-h-9 rounded-lg border px-2.5 py-1.5 text-left transition sm:px-3 sm:py-2",
                    isSelected
                      ? "border-[rgba(226,138,180,0.5)] bg-[rgba(226,138,180,0.055)] text-[var(--color-charcoal)]"
                      : "border-[var(--color-line)] bg-[rgba(255,255,255,0.015)] text-[var(--color-stone)] hover:border-[rgba(226,138,180,0.38)]",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium leading-5">{displayServiceName(service.name)}</span>
                      <span className="block text-[11px] text-[var(--color-stone)]">
                        {service.durationMinutes != null
                          ? service.durationLabel ?? formatDuration(service.durationMinutes)
                          : ""}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(226,138,180,0.52)] bg-[rgba(226,138,180,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-powder)]">
                        <Check size={10} aria-hidden="true" />
                        {t.selectedBadge}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          {voucherService ? (
            <div className="mt-1 grid gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-stone)]">
                {t.standaloneHeading}
              </p>
              <button
                type="button"
                onClick={() => toggleService(voucherService.name)}
                className={cn(
                  "min-h-9 rounded-lg border px-2.5 py-1.5 text-left transition sm:px-3 sm:py-2",
                  selectedServiceNames.includes(voucherService.name)
                    ? "border-[rgba(226,138,180,0.5)] bg-[rgba(226,138,180,0.055)] text-[var(--color-charcoal)]"
                    : "border-[var(--color-line)] bg-[rgba(255,255,255,0.015)] text-[var(--color-stone)] hover:border-[rgba(226,138,180,0.38)]",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-5">{displayServiceName(voucherService.name)}</span>
                    <span className="block text-[11px] text-[var(--color-stone)]">
                      {t.voucherNoSlot}
                    </span>
                  </span>
                  {selectedServiceNames.includes(voucherService.name) ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(226,138,180,0.52)] bg-[rgba(226,138,180,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-powder)]">
                      <Check size={10} aria-hidden="true" />
                      {t.selectedBadge}
                    </span>
                  ) : null}
                </span>
              </button>
            </div>
          ) : null}
        </label>

        {isGiftVoucherFlow ? (
          <>
            <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
              {t.voucherTypeLabel}
              <select
                className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
                name="voucherTreatment"
                value={selectedVoucherTreatment}
                onChange={(event) => setSelectedVoucherTreatment(event.target.value)}
                required
              >
                <option value="">{t.voucherTypePlaceholder}</option>
                {giftVoucherTreatments.map((item) => (
                  <option key={item.name} value={item.name}>
                    {displayServiceName(item.name)} - {item.amount} €
                  </option>
                ))}
              </select>
            </label>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
              <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
                {t.voucherFromLabel}
                <input
                  className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
                  name="voucherFrom"
                  value={voucherFrom}
                  onChange={(event) => setVoucherFrom(event.target.value)}
                  placeholder={t.voucherFromPlaceholder}
                  required
                />
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
                {t.voucherForLabel}
                <input
                  className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
                  name="voucherFor"
                  value={voucherFor}
                  onChange={(event) => setVoucherFor(event.target.value)}
                  placeholder={t.voucherForPlaceholder}
                  required
                />
              </label>
            </div>
          </>
        ) : null}

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
          {t.nameLabel}
          <input
            className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
            name="name"
            placeholder={t.namePlaceholder}
            required
          />
        </label>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            {t.emailLabel}
            <input
              type="email"
              className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
              name="email"
              placeholder={t.emailPlaceholder}
              required
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            {t.phoneLabel}
            <input
              type="tel"
              className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
              name="phone"
              placeholder={t.phonePlaceholder}
              pattern="[+0-9 ()-]{7,20}"
              title={t.phoneTitle}
              required
            />
          </label>
        </div>

        {!isGiftVoucherFlow ? (
          <>
            <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
              {t.dateLabel}
              <input
                type="date"
                min={getLocalTodayISO()}
                className="min-h-11 w-full rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
                name="date"
                value={selectedDate}
                onClick={(event) => {
                  if ("showPicker" in event.currentTarget) {
                    try {
                      event.currentTarget.showPicker();
                    } catch {
                      // Some browsers may block programmatic picker opening.
                    }
                  }
                }}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setSelectedTime("");
                }}
                required
              />
            </label>

            <fieldset className="grid min-w-0 gap-3">
              <legend className="text-sm font-medium text-[var(--color-charcoal)]">
                {t.slotsLegend}
              </legend>
              <p className="text-xs leading-5 text-[var(--color-stone)]">
                {t.slotsHelp}
              </p>
              {selectedDate ? (
                selectedServices.length > 0 ? (
                  isLoadingSlots ? (
                    <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                      {t.slotsLoading}
                    </p>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableSlots.map((slot) => (
                        <label key={slot}>
                          <input
                            className="peer sr-only"
                            type="radio"
                            name="time"
                            value={slot}
                            checked={selectedTime === slot}
                            onChange={() => setSelectedTime(slot)}
                            required
                          />
                          <span
                            className={cn(
                              "flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-line)] px-3 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:border-[var(--color-powder)] sm:min-h-11 sm:px-4",
                              selectedTime === slot &&
                                "border-[var(--color-powder)] bg-[rgba(226,138,180,0.13)] text-[var(--color-powder)]",
                            )}
                          >
                            {slot}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                      {t.slotsNone}
                    </p>
                  )
                ) : (
                  <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                    {t.slotsPickServices}
                  </p>
                )
              ) : (
                <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                  {t.slotsPickDate}
                </p>
              )}
              {slotInfo ? (
                <p className="text-xs leading-5 text-[var(--color-stone)]">{slotInfo}</p>
              ) : null}
            </fieldset>
          </>
        ) : (
          <p className="rounded-lg border border-[rgba(226,138,180,0.35)] bg-[rgba(226,138,180,0.08)] px-4 py-3 text-sm leading-6 text-[var(--color-charcoal)]">
            {t.voucherNoSlotNotice}
          </p>
        )}

        {!isGiftVoucherFlow ? (
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            {t.noteLabel}
            <textarea
              className="min-h-24 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 py-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
              name="note"
              placeholder={t.notePlaceholder}
            />
          </label>
        ) : null}

        <label className="flex gap-3 text-sm leading-6 text-[var(--color-stone)]">
          <input
            className="mt-1 size-4 rounded border-[var(--color-line)]"
            type="checkbox"
            required
          />
          <span>
            {t.consentText}{" "}
            <a className="underline hover:text-[var(--color-powder)]" href={privacyHref}>
              {t.privacyLinkText}
            </a>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingSlots}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-powder)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_12px_34px_rgba(226,138,180,0.24)] transition hover:bg-[var(--color-charcoal)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? t.submitting
            : isGiftVoucherFlow
              ? t.submitVoucher
              : t.submitNormal}
        </button>

        <p className="text-xs leading-5 text-[var(--color-stone)]">
          {isGiftVoucherFlow ? t.footerVoucher : t.footerNormal}
        </p>
        {submitInfo ? <p className="text-xs leading-5 text-[var(--color-stone)]">{submitInfo}</p> : null}
        {submitError ? <p className="text-xs leading-5 text-red-300">{submitError}</p> : null}
      </div>
    </form>
  );
}
