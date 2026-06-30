"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

import {
  bookableServices,
  giftVoucherPaymentConfig,
  giftVoucherTreatments,
  siteConfig,
} from "@/data/site";
import { formatDuration, getLocalTodayISO, getSlotsForDate } from "@/lib/booking";
import { cn } from "@/lib/utils";

const GIFT_VOUCHER_SERVICE_NAME = "Darčekový poukaz";

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

function formatSelectedServicesLabel(count: number) {
  if (count === 1) {
    return "1 služba";
  }

  if (count >= 2 && count <= 4) {
    return `${count} služby`;
  }

  return `${count} služieb`;
}

export function BookingForm() {
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
          throw new Error(data.error || "Nepodarilo sa načítať dostupné časy.");
        }

        setAvailableSlots(data.slots ?? []);
        setSlotInfo(
          data.calendarConfigured === false
            ? "Kalendár ešte nie je napojený, preto sú časy zatiaľ orientačné."
            : "",
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setAvailableSlots(getSlotsForDate(selectedDate, totalDurationMinutes));
        setSlotInfo(
          error instanceof Error
            ? error.message
            : "Dostupné časy sa nepodarilo načítať.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
  }, [isGiftVoucherFlow, selectedDate, totalDurationMinutes]);

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
      setSubmitError("Najprv vyber jednu alebo viac služieb.");
      setIsSubmitting(false);
      return;
    }

    if (!/^[+0-9 ()-]{7,20}$/.test(phone)) {
      setSubmitError("Zadaj prosím telefón v správnom formáte.");
      setIsSubmitting(false);
      return;
    }

    if (isGiftVoucherFlow) {
      if (!voucherTreatment) {
        setSubmitError("Vyber typ ošetrenia pre darčekový poukaz.");
        setIsSubmitting(false);
        return;
      }

      if (!voucherFromName) {
        setSubmitError("Doplň, od koho je darčeková poukážka.");
        setIsSubmitting(false);
        return;
      }

      if (!voucherForName) {
        setSubmitError("Doplň, pre koho je darčeková poukážka.");
        setIsSubmitting(false);
        return;
      }

      const selectedTreatment = giftVoucherTreatments.find(
        (item) => item.name === voucherTreatment,
      );

      if (!selectedTreatment) {
        setSubmitError("Vybraný typ ošetrenia nie je dostupný pre poukážku.");
        setIsSubmitting(false);
        return;
      }

      if (giftVoucherPaymentConfig.iban.includes("[DOPLNIŤ_IBAN]")) {
        setSubmitError("Najprv doplň IBAN pre QR platbu darčekovej poukážky.");
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
      setSubmitError("Najprv vyber jednu alebo viac služieb.");
      setIsSubmitting(false);
      return;
    }

    if (!availableSlots.includes(time)) {
      setSubmitError("Vybraný čas už nie je dostupný. Prosím, zvoľ iný čas.");
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
        throw new Error(data.error || "Požiadavku sa nepodarilo odoslať.");
      }

      form.reset();
      setSelectedServiceNames([]);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);

      setSubmitInfo(
        "Ďakujem, tvoju žiadosť o rezerváciu som prijala. Na e-mail ti prišlo potvrdenie o prijatí – po kontrole dostupnosti ti pošlem potvrdenie termínu.",
      );
    } catch (error) {
      // Network-level failure: offer the e-mail fallback so the request is not lost.
      if (error instanceof TypeError) {
        void navigator.clipboard?.writeText(body).catch(() => undefined);
        window.location.href = mailtoUrl;
        setSubmitInfo(
          "Spojenie sa nepodarilo nadviazať, preto sa otvoril e-mail s predvyplnenou žiadosťou. Text sme skopírovali aj do schránky.",
        );
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Požiadavku sa nepodarilo odoslať.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="rezervacia"
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
            {isGiftVoucherFlow ? "Zakúpenie poukážky" : "Rezervácia na stránke"}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-[var(--color-charcoal)] sm:text-2xl">
            {isGiftVoucherFlow ? "Obdarovanie" : "Požiadať o termín"}
          </h2>
          <p className="mt-2 text-sm leading-5 text-[var(--color-stone)] sm:mt-3 sm:leading-6">
            {isGiftVoucherFlow
              ? "Vyber typ ošetrenia na poukážku a doplň údaje o darcovi a obdarovanom."
              : "Vyber jednu alebo viac služieb, dátum a vyhovujúci čas. Odošleš nezáväznú požiadavku o termín, ktorú salón potvrdí osobne."}
          </p>
        </div>

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
          Služby
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
                Vybrané:{" "}
                <span className="font-semibold">
                  {formatSelectedServicesLabel(selectedNormalServicesCount)}
                </span>
              </span>
              <span aria-hidden="true" className="text-[var(--color-stone)]">
                ·
              </span>
              <span>
                Spolu:{" "}
                <span className="font-semibold">
                  {selectedNormalServicesCount > 0 ? formatDuration(totalDurationMinutes) : "0 min"}
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
                      <span className="block text-[13px] font-medium leading-5">{service.name}</span>
                      <span className="block text-[11px] text-[var(--color-stone)]">
                        {service.durationMinutes != null
                          ? service.durationLabel ?? formatDuration(service.durationMinutes)
                          : ""}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(226,138,180,0.52)] bg-[rgba(226,138,180,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-powder)]">
                        <Check size={10} aria-hidden="true" />
                        Vybraté
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
                Samostatný nákup
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
                    <span className="block text-[13px] font-medium leading-5">{voucherService.name}</span>
                    <span className="block text-[11px] text-[var(--color-stone)]">
                      Nie je viazaný na časový slot
                    </span>
                  </span>
                  {selectedServiceNames.includes(voucherService.name) ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(226,138,180,0.52)] bg-[rgba(226,138,180,0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-powder)]">
                      <Check size={10} aria-hidden="true" />
                      Vybraté
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
              Typ ošetrenia na poukážku
              <select
                className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
                name="voucherTreatment"
                value={selectedVoucherTreatment}
                onChange={(event) => setSelectedVoucherTreatment(event.target.value)}
                required
              >
                <option value="">Vyber typ ošetrenia</option>
                {giftVoucherTreatments.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} - {item.amount} €
                  </option>
                ))}
              </select>
            </label>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
              <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
                Od koho je poukážka
                <input
                  className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
                  name="voucherFrom"
                  value={voucherFrom}
                  onChange={(event) => setVoucherFrom(event.target.value)}
                  placeholder="Napr. Martina"
                  required
                />
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
                Pre koho je poukážka
                <input
                  className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
                  name="voucherFor"
                  value={voucherFor}
                  onChange={(event) => setVoucherFor(event.target.value)}
                  placeholder="Napr. Lucia"
                  required
                />
              </label>
            </div>
          </>
        ) : null}

        <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
          Meno a priezvisko
          <input
            className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
            name="name"
            placeholder="Tvoje meno a priezvisko"
            required
          />
        </label>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            E-mail
            <input
              type="email"
              className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
              name="email"
              placeholder="tvoj@email.sk"
              required
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            Telefón
            <input
              type="tel"
              className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:min-h-11 sm:px-4"
              name="phone"
              placeholder="+421 900 000 000"
              pattern="[+0-9 ()-]{7,20}"
              title="Povolené znaky: čísla, +, medzera, zátvorky a pomlčka"
              required
            />
          </label>
        </div>

        {!isGiftVoucherFlow ? (
          <>
            <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
              Dátum
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
                Dostupné časy
              </legend>
              <p className="text-xs leading-5 text-[var(--color-stone)]">
                Online rezervácia je dostupná minimálne 12 hodín dopredu. Termín na nasledujúci deň
                je možné odoslať najneskôr do 20:00.
              </p>
              {selectedDate ? (
                selectedServices.length > 0 ? (
                  isLoadingSlots ? (
                    <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                      Načítavam dostupné časy z kalendára...
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
                      V tento deň nie sú dostupné online termíny. Salón prijíma online
                      žiadosti od pondelka do piatka medzi 08:00 a 18:00.
                    </p>
                  )
                ) : (
                  <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                    Najprv vyber jednu alebo viac služieb, aby sme vedeli vypočítať dostupné časy.
                  </p>
                )
              ) : (
                <p className="rounded-lg border border-[var(--color-line)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
                  Najprv vyber jednu alebo viac služieb a dátum, následne sa zobrazia možné časy.
                </p>
              )}
              {slotInfo ? (
                <p className="text-xs leading-5 text-[var(--color-stone)]">{slotInfo}</p>
              ) : null}
            </fieldset>
          </>
        ) : (
          <p className="rounded-lg border border-[rgba(226,138,180,0.35)] bg-[rgba(226,138,180,0.08)] px-4 py-3 text-sm leading-6 text-[var(--color-charcoal)]">
            Pri darčekovej poukážke sa termín teraz nevyberá. Po výbere typu
            ošetrenia ťa presmerujeme na QR platbu.
          </p>
        )}

        {!isGiftVoucherFlow ? (
          <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-charcoal)]">
            Poznámka
            <textarea
              className="min-h-24 w-full min-w-0 rounded-lg border border-[var(--color-line)] px-3 py-3 text-sm outline-none transition focus:border-[var(--color-powder)] sm:px-4"
              name="note"
              placeholder="Voliteľné: alergie, preferencia, otázka k termínu..."
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
            Súhlasím so spracovaním osobných údajov za účelom vybavenia
            rezervácie, odoslania potvrdenia a pripomienky termínu e-mailom alebo SMS.{" "}
            <a className="underline hover:text-[var(--color-powder)]" href="/ochrana-osobnych-udajov">
              Zásady ochrany osobných údajov
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
            ? "Odosielam..."
            : isGiftVoucherFlow
              ? "Pokračovať na QR platbu"
              : "Odoslať požiadavku o termín"}
        </button>

        <p className="text-xs leading-5 text-[var(--color-stone)]">
          {isGiftVoucherFlow
            ? "Po odoslaní ťa presmerujeme na QR kód pre bankový prevod darčekovej poukážky."
            : "Po odoslaní ti na e-mail príde potvrdenie o prijatí žiadosti. Termín nie je automaticky potvrdený – po kontrole dostupnosti ti pošlem potvrdenie e-mailom."}
        </p>
        {submitInfo ? <p className="text-xs leading-5 text-[var(--color-stone)]">{submitInfo}</p> : null}
        {submitError ? <p className="text-xs leading-5 text-red-300">{submitError}</p> : null}
      </div>
    </form>
  );
}
