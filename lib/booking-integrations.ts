import crypto from "node:crypto";

import { toEnglishServiceNames } from "@/data/booking-en";
import { bookableServices, siteConfig } from "@/data/site";
import {
  bookingConfig,
  getDateWindowUtc,
  getSlotsForDate,
  isWithinBookingRules,
  type BusyInterval,
} from "@/lib/booking";
import { createBookingToken } from "@/lib/booking-token";
import { buildGoogleCalendarLink, buildIcsFile } from "@/lib/calendar";
import { getSiteUrl } from "@/lib/site-url";

export type BookingLocale = "sk" | "en";

export type BookingRequest = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  date: string;
  time: string;
  durationMinutes: number;
  note?: string;
  /**
   * Language the customer used when booking. Drives customer-facing e-mail and
   * calendar language. Defaults to "sk" for backwards compatibility (missing
   * value, old signed tokens, direct API calls).
   */
  locale?: BookingLocale;
  /**
   * Token issued-at timestamp (ms). Present on tokens; used only to strengthen
   * the idempotency key so re-clicking the same confirm link is a no-op.
   */
  iat?: number;
};

type GoogleBusyItem = {
  start?: string;
  end?: string;
};

type GoogleEvent = {
  id: string;
  htmlLink?: string;
};

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  calendarId: process.env.GOOGLE_CALENDAR_ID,
};

function hasGoogleCalendarConfig() {
  return Boolean(
    googleConfig.clientId &&
      googleConfig.clientSecret &&
      googleConfig.refreshToken &&
      googleConfig.calendarId,
  );
}

type SmsProviderConfig = {
  sid?: string;
  token?: string;
  from?: string;
  messagingServiceSid?: string;
};

// Reads SMS credentials. New SMS_PROVIDER_* names take priority; the
// legacy TWILIO_* names stay supported as a fallback.
function getSmsConfig(): SmsProviderConfig {
  return {
    sid: process.env.SMS_PROVIDER_ACCOUNT_ID || process.env.TWILIO_ACCOUNT_SID,
    token: process.env.SMS_PROVIDER_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN,
    from: process.env.SMS_PROVIDER_FROM_NUMBER || process.env.TWILIO_FROM,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  };
}

function hasSmsConfig() {
  const config = getSmsConfig();
  return Boolean(config.sid && config.token && (config.from || config.messagingServiceSid));
}

function getOwnerPhone() {
  return (
    process.env.SALON_OWNER_PHONE ||
    process.env.TIMEA_NOTIFICATION_PHONE ||
    siteConfig.phone
  );
}

export function getBookingIntegrationStatus() {
  return {
    calendarConfigured: hasGoogleCalendarConfig(),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM_EMAIL),
    smsConfigured: hasSmsConfig(),
  };
}

function normalizePhone(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) {
    return compact;
  }

  if (compact.startsWith("0")) {
    return `+421${compact.slice(1)}`;
  }

  if (compact.startsWith("421")) {
    return `+${compact}`;
  }

  return compact;
}

function cleanText(value: string, maxLength = 160) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function validateBookingRequest(input: unknown): BookingRequest {
  if (!input || typeof input !== "object") {
    throw new Error("Rezervácia nemá správny formát.");
  }

  const data = input as Partial<BookingRequest>;
  const locale: BookingLocale = data.locale === "en" ? "en" : "sk";
  const name = cleanText(String(data.name || ""), 120);
  const email = cleanText(String(data.email || ""), 180);
  const phone = cleanText(String(data.phone || ""), 40);
  const date = cleanText(String(data.date || ""), 20);
  const time = cleanText(String(data.time || ""), 20);
  const note = cleanText(String(data.note || ""), 600);
  const services = Array.isArray(data.services)
    ? data.services.map((service) => cleanText(String(service), 160)).filter(Boolean)
    : [];

  const availableServiceNames = new Set(
    bookableServices
      .filter((service) => typeof service.durationMinutes === "number")
      .map((service) => service.name),
  );
  const invalidServices = services.filter((service) => !availableServiceNames.has(service));
  const durationMinutes = services.reduce((total, serviceName) => {
    const service = bookableServices.find((item) => item.name === serviceName);
    return total + (typeof service?.durationMinutes === "number" ? service.durationMinutes : 0);
  }, 0);

  if (!name) {
    throw new Error("Doplň meno a priezvisko.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Doplň platný e-mail.");
  }

  if (!/^[+0-9 ()-]{7,20}$/.test(phone)) {
    throw new Error("Doplň platný telefón.");
  }

  if (!services.length || invalidServices.length > 0 || durationMinutes <= 0) {
    throw new Error("Vyber jednu alebo viac dostupných služieb.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Vyber dátum a čas.");
  }

  if (!isWithinBookingRules(date, time, durationMinutes)) {
    throw new Error(
      "Tento termín už nie je možné rezervovať online. Vyber prosím iný čas.",
    );
  }

  return {
    name,
    email,
    phone: normalizePhone(phone),
    services,
    date,
    time,
    durationMinutes,
    note,
    locale,
  };
}

async function getGoogleAccessToken() {
  if (!hasGoogleCalendarConfig()) {
    throw new Error("Google kalendár ešte nie je nakonfigurovaný.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: googleConfig.clientId!,
      client_secret: googleConfig.clientSecret!,
      refresh_token: googleConfig.refreshToken!,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa prihlásiť do Google kalendára.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google nevrátil prístupový token.");
  }

  return data.access_token;
}

export async function getBusyIntervalsForDate(date: string): Promise<BusyInterval[]> {
  if (!hasGoogleCalendarConfig()) {
    return [];
  }

  const window = getDateWindowUtc(date);
  if (!window) {
    return [];
  }

  const accessToken = await getGoogleAccessToken();
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: window.start.toISOString(),
      timeMax: window.end.toISOString(),
      timeZone: bookingConfig.timeZone,
      items: [{ id: googleConfig.calendarId }],
    }),
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa načítať obsadené časy z Google kalendára.");
  }

  const data = (await response.json()) as {
    calendars?: Record<string, { busy?: GoogleBusyItem[] }>;
  };

  const busy = data.calendars?.[googleConfig.calendarId!]?.busy ?? [];
  return busy
    .map((item) => ({
      start: new Date(item.start || ""),
      end: new Date(item.end || ""),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.start.getTime()) && Number.isFinite(item.end.getTime()),
    );
}

export async function getAvailableSlotsFromCalendar(
  date: string,
  durationMinutes: number,
) {
  const busyIntervals = await getBusyIntervalsForDate(date);

  return getSlotsForDate(date, durationMinutes, busyIntervals);
}

function bookingText(booking: BookingRequest) {
  return [
    `Meno: ${booking.name}`,
    `E-mail: ${booking.email}`,
    `Telefón: ${booking.phone}`,
    `Dátum a čas: ${booking.date} ${booking.time}`,
    `Služby: ${booking.services.join(", ")}`,
    `Trvanie: ${booking.durationMinutes} min`,
    booking.note ? `Poznámka: ${booking.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Deterministic idempotency key derived from stable, signed token fields.
 * Two clicks of the same confirm link produce the same key, so we never create
 * a duplicate calendar event. No database required.
 */
export function getBookingKey(booking: BookingRequest): string {
  const parts = [
    booking.email.trim().toLowerCase(),
    booking.date,
    booking.time,
    [...booking.services].map((service) => service.trim()).sort().join("|"),
    typeof booking.iat === "number" ? String(booking.iat) : "",
  ];

  return crypto.createHash("sha256").update(parts.join("::")).digest("hex");
}

/** Owner-facing (Slovak) description for a confirmed calendar event. */
function confirmedEventDescription(booking: BookingRequest) {
  return [
    bookingText(booking),
    booking.locale === "en" ? "Jazyk zákazníčky: angličtina" : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Looks up an existing confirmed event for this booking via its private
 * extended property. Returns the event if found, otherwise null. Any Google
 * API error propagates so the caller can abort safely.
 */
async function findConfirmedEventByKey(
  bookingKey: string,
  date: string,
): Promise<GoogleEvent | null> {
  const accessToken = await getGoogleAccessToken();
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      googleConfig.calendarId!,
    )}/events`,
  );

  const window = getDateWindowUtc(date);
  if (window) {
    url.searchParams.set("timeMin", window.start.toISOString());
    url.searchParams.set("timeMax", window.end.toISOString());
  }
  url.searchParams.set("privateExtendedProperty", `bookingKey=${bookingKey}`);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("maxResults", "5");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa overiť existujúci termín v Google kalendári.");
  }

  const data = (await response.json()) as { items?: GoogleEvent[] };
  return data.items && data.items.length > 0 ? data.items[0] : null;
}

/**
 * Creates the confirmed calendar event. Timezone handling matches the previous
 * request-time logic: local wall-clock dateTimes are sent together with the
 * Europe/Bratislava timeZone, so Google resolves the correct instant.
 */
async function createConfirmedCalendarEvent(
  booking: BookingRequest,
  bookingKey: string,
): Promise<GoogleEvent> {
  const accessToken = await getGoogleAccessToken();
  const [hours, minutes] = booking.time.split(":").map(Number);
  const start = `${booking.date}T${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}:00`;
  const endDate = new Date(
    Date.UTC(2000, 0, 1, hours, minutes + booking.durationMinutes),
  );
  const end = `${booking.date}T${String(endDate.getUTCHours()).padStart(
    2,
    "0",
  )}:${String(endDate.getUTCMinutes()).padStart(2, "0")}:00`;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      googleConfig.calendarId!,
    )}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `POTVRDENÁ REZERVÁCIA - ${booking.name}`,
        description: confirmedEventDescription(booking),
        start: { dateTime: start, timeZone: bookingConfig.timeZone },
        end: { dateTime: end, timeZone: bookingConfig.timeZone },
        attendees: [{ email: booking.email, displayName: booking.name }],
        extendedProperties: {
          private: {
            source: "timeaskincare-web",
            bookingKey,
            customerName: booking.name,
            customerEmail: booking.email,
            customerPhone: booking.phone,
            services: booking.services.join(" | "),
            durationMinutes: String(booking.durationMinutes),
            locale: booking.locale === "en" ? "en" : "sk",
            smsReminderSent: "false",
          },
        },
        reminders: { useDefault: true },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Nepodarilo sa vytvoriť termín v Google kalendári.");
  }

  return (await response.json()) as GoogleEvent;
}

/**
 * Idempotently ensures a confirmed calendar event exists for this booking.
 * If one already exists (e.g. the confirm link was opened twice), no new event
 * is created. Any Google API error propagates so the caller aborts safely and
 * never sends a false confirmation e-mail.
 */
async function ensureConfirmedCalendarEvent(
  booking: BookingRequest,
): Promise<GoogleEvent> {
  const bookingKey = getBookingKey(booking);
  const existing = await findConfirmedEventByKey(bookingKey, booking.date);
  if (existing) {
    return existing;
  }

  return createConfirmedCalendarEvent(booking, bookingKey);
}

// Simple honeypot: a hidden "company" field that humans never fill in.
function isHoneypotTripped(input: unknown) {
  if (!input || typeof input !== "object") {
    return false;
  }

  const value = (input as Record<string, unknown>).company;
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Main reservation entry point. Always works as a reservation REQUEST:
 * - validates the input,
 * - (optionally) creates a calendar event when Google Calendar is set up,
 * - sends an SMS to the salon owner and a confirmation SMS to the customer,
 * - sends a "request received" e-mail to the customer and a confirm/decline
 *   e-mail to Timea when Resend is configured.
 * The appointment is NOT auto-confirmed; Timea confirms manually via e-mail.
 */
export async function submitReservation(input: unknown, origin?: string) {
  // Bots that fill the honeypot get a silent success; nothing is sent.
  if (isHoneypotTripped(input)) {
    return { spam: true as const };
  }

  const booking = validateBookingRequest(input);
  const baseUrl = origin || getSiteUrl();

  // Availability re-check only. Phase 1: a pending request no longer writes to
  // Google Calendar. The confirmed event is created later, when Timea confirms
  // the request (see confirmReservation), so the slot is not held prematurely.
  if (hasGoogleCalendarConfig()) {
    const slots = await getAvailableSlotsFromCalendar(booking.date, booking.durationMinutes);
    if (!slots.includes(booking.time)) {
      throw new Error("Vybraný čas už nie je dostupný. Prosím, vyber iný čas.");
    }
  }

  const sms = await sendReservationNotifications(booking);

  // E-mails are best-effort and must never block the reservation request.
  await Promise.allSettled([sendReservationRequestEmails(booking, baseUrl)]);

  // The owner notification is critical: if SMS is configured but the
  // owner message failed, surface a friendly error to the customer.
  if (hasSmsConfig() && sms.owner === "failed") {
    const error = new Error(
      "Požiadavku sa momentálne nepodarilo odoslať. Skús to prosím znova alebo ma kontaktuj telefonicky.",
    );
    error.name = "SMS_FAILED";
    throw error;
  }

  // `event` stays undefined by design (no request-time calendar write). The
  // field is kept so the /api/booking response shape is unchanged.
  return { booking, event: undefined as GoogleEvent | undefined, sms, spam: false as const };
}

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

type EmailOptions = {
  html?: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
  options: EmailOptions = {},
) {
  if (!process.env.RESEND_API_KEY || !process.env.BOOKING_FROM_EMAIL) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL,
      to,
      subject,
      text,
      ...(options.html ? { html: options.html } : {}),
      ...(options.attachments ? { attachments: options.attachments } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa odoslať e-mail.");
  }

  return { skipped: false };
}

function formatDateHuman(date: string, locale: BookingLocale = "sk") {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  if (locale === "en") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  return `${day}. ${month}. ${year}`;
}

/** Slovak appointment lines. Used by owner (Slovak) e-mails and Slovak customers. */
function appointmentSummaryLines(booking: BookingRequest) {
  return [
    `Služby: ${booking.services.join(", ")}`,
    `Dátum: ${formatDateHuman(booking.date)}`,
    `Čas: ${booking.time}`,
    `Trvanie: ${booking.durationMinutes} min`,
  ];
}

/**
 * Customer-facing appointment lines. English uses English service names and an
 * English date format; Slovak keeps the exact original wording.
 */
function customerAppointmentLines(booking: BookingRequest) {
  if (booking.locale === "en") {
    return [
      `Services: ${toEnglishServiceNames(booking.services).join(", ")}`,
      `Date: ${formatDateHuman(booking.date, "en")}`,
      `Time: ${booking.time}`,
      `Duration: ${booking.durationMinutes} min`,
    ];
  }

  return appointmentSummaryLines(booking);
}

/** English detail block for the "request received" customer e-mail. */
function customerRequestDetailLines(booking: BookingRequest) {
  return [
    `Services: ${toEnglishServiceNames(booking.services).join(", ")}`,
    `Date: ${formatDateHuman(booking.date, "en")}`,
    `Time: ${booking.time}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    booking.note ? `Note: ${booking.note}` : "",
  ].filter(Boolean);
}

// Owner e-mails always stay Slovak. Service names remain canonical Slovak.
function customerSummaryLines(booking: BookingRequest) {
  return [
    `Meno: ${booking.name}`,
    `E-mail: ${booking.email}`,
    `Telefón: ${booking.phone}`,
    ...appointmentSummaryLines(booking),
    booking.note ? `Poznámka: ${booking.note}` : "",
  ].filter(Boolean);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailLayout(title: string, bodyHtml: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#faf8f6;padding:24px;color:#242629;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e8e5;border-radius:16px;overflow:hidden;">
      <div style="padding:18px 28px;border-bottom:1px solid #f1e7ec;">
        <span style="font-size:18px;font-weight:700;color:#d979a8;letter-spacing:0.02em;">Timea Skincare</span>
      </div>
      <div style="padding:24px 28px;font-size:15px;line-height:1.6;">
        <h1 style="font-size:18px;margin:0 0 14px;color:#242629;">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </div>
    </div>
  </div>`;
}

export function emailButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#d979a8;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${escapeHtml(
    label,
  )}</a>`;
}

export function summaryHtml(lines: string[]) {
  return `<div style="background:#faf8f6;border:1px solid #f1e7ec;border-radius:12px;padding:14px 18px;margin:8px 0 18px;">${lines
    .map((line) => `<div style="margin:2px 0;">${escapeHtml(line)}</div>`)
    .join("")}</div>`;
}

function icsAttachment(
  booking: BookingRequest,
  options?: Parameters<typeof buildIcsFile>[1],
): EmailAttachment[] | undefined {
  const ics = buildIcsFile(booking, options);
  if (!ics) {
    return undefined;
  }

  return [
    {
      filename: "timea-skincare.ics",
      content: Buffer.from(ics, "utf8").toString("base64"),
      contentType: "text/calendar",
    },
  ];
}

// Sent right after the form is submitted: customer gets a "request received"
// e-mail (no calendar link yet), Timea gets the request with confirm/decline links.
async function sendReservationRequestEmails(
  booking: BookingRequest,
  baseUrl: string,
  event?: GoogleEvent,
) {
  const token = createBookingToken(booking);
  const manageUrl = `${baseUrl}/rezervacia/sprava?token=${encodeURIComponent(token)}`;
  const confirmUrl = `${manageUrl}&intent=confirm`;
  const declineUrl = `${manageUrl}&intent=decline`;
  const isEnglish = booking.locale === "en";

  const customerSubject = isEnglish
    ? "We received your appointment request | Timea Skincare"
    : "Žiadosť o rezerváciu bola prijatá";

  const customerText = isEnglish
    ? [
        `Hello ${booking.name},`,
        "",
        "thank you for your appointment request at Timea Skincare. Your request has been received and is not confirmed yet. I will review the selected services and time and get back to you with confirmation as soon as possible.",
        "",
        "Requested appointment:",
        ...customerRequestDetailLines(booking),
        "",
        "Thank you,",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n")
    : [
        `Dobrý deň, ${booking.name},`,
        "",
        "ďakujem za tvoju rezerváciu. Tvoj termín zatiaľ nie je potvrdený.",
        "Po kontrole dostupnosti ti pošlem potvrdenie e-mailom.",
        "",
        ...appointmentSummaryLines(booking),
        "",
        "Teším sa na tvoju návštevu.",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n");

  const customerHtml = isEnglish
    ? emailLayout(
        "We received your appointment request",
        `<p>Hello ${escapeHtml(booking.name)},</p>
     <p>thank you for your appointment request at Timea Skincare. Your request has been received and is <strong>not confirmed yet</strong>. I will review the selected services and time and get back to you with confirmation as soon as possible.</p>
     ${summaryHtml(customerRequestDetailLines(booking))}
     <p style="margin:0;">Thank you,<br/>Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      )
    : emailLayout(
        "Žiadosť o rezerváciu bola prijatá",
        `<p>Dobrý deň, ${escapeHtml(booking.name)},</p>
     <p>ďakujem za tvoju rezerváciu. Tvoj termín <strong>zatiaľ nie je potvrdený</strong>. Po kontrole dostupnosti ti pošlem potvrdenie e-mailom.</p>
     ${summaryHtml(appointmentSummaryLines(booking))}
     <p style="margin:0;">Teším sa na tvoju návštevu.<br/>Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      );

  // Owner e-mail stays Slovak; only a small language indicator is added for EN.
  const ownerLanguageLine = isEnglish ? "Jazyk zákazníčky: angličtina" : "";

  const ownerText = [
    "Nová žiadosť o rezerváciu (zatiaľ nepotvrdená):",
    "",
    ...customerSummaryLines(booking),
    ownerLanguageLine,
    event?.htmlLink ? `Kalendár: ${event.htmlLink}` : "",
    "",
    `Potvrdiť rezerváciu: ${confirmUrl}`,
    `Odmietnuť rezerváciu: ${declineUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ownerHtml = emailLayout(
    "Nová žiadosť o rezerváciu",
    `<p>Máš novú <strong>žiadosť o rezerváciu</strong> (zatiaľ nepotvrdenú).</p>
     ${summaryHtml(customerSummaryLines(booking))}
     ${isEnglish ? `<p style="font-size:13px;color:#8b8d88;margin:0 0 12px;">Jazyk zákazníčky: angličtina</p>` : ""}
     <p style="margin:0 0 16px;">${emailButton(confirmUrl, "Potvrdiť rezerváciu")}
       &nbsp;&nbsp;
       <a href="${declineUrl}" style="display:inline-block;color:#8b8d88;text-decoration:underline;font-weight:600;padding:12px 4px;">Odmietnuť rezerváciu</a>
     </p>
     <p style="font-size:13px;color:#8b8d88;margin:0;">Po kliknutí sa otvorí stránka, kde rezerváciu finálne potvrdíš alebo odmietneš.</p>`,
  );

  await Promise.all([
    sendEmail(booking.email, customerSubject, customerText, {
      html: customerHtml,
    }),
    sendEmail(siteConfig.email, `Nová žiadosť o rezerváciu – ${booking.name}`, ownerText, {
      html: ownerHtml,
    }),
  ]);
}

/** Sends the confirmed-booking e-mails (customer + owner) with .ics + Google link. */
export async function confirmReservation(booking: BookingRequest) {
  // Phase 1: create the confirmed Google Calendar event BEFORE any customer
  // e-mail. When Google is configured and this fails, the error propagates to
  // the confirm route, which redirects Timea to a safe error state — so the
  // customer never receives a false "confirmed" e-mail. Idempotent: a repeated
  // confirm click reuses the existing event instead of creating a duplicate.
  // When Google is not configured, behavior is unchanged (e-mails only).
  if (hasGoogleCalendarConfig()) {
    await ensureConfirmedCalendarEvent(booking);
  }

  const isEnglish = booking.locale === "en";
  const customerAttachments = icsAttachment(booking, {
    includeLocation: true,
    locale: booking.locale,
  });
  const ownerAttachments = icsAttachment(booking, { includeLocation: false });
  const customerCalendarLink = buildGoogleCalendarLink(booking, {
    includeLocation: true,
    locale: booking.locale,
  });
  const ownerCalendarLink = buildGoogleCalendarLink(booking, { includeLocation: false });

  const customerSubject = isEnglish
    ? "Your appointment is confirmed | Timea Skincare"
    : "Rezervácia potvrdená – Timea Skincare";

  const customerText = isEnglish
    ? [
        `Hello ${booking.name},`,
        "",
        "your appointment at Timea Skincare has been confirmed.",
        "",
        "Appointment details:",
        ...customerAppointmentLines(booking),
        `Address: ${siteConfig.address}`,
        "",
        customerCalendarLink ? `Add to calendar: ${customerCalendarLink}` : "",
        "",
        "I look forward to seeing you.",
        "Timea Skincare",
        siteConfig.phone,
        siteConfig.email,
      ]
        .filter(Boolean)
        .join("\n")
    : [
        `Dobrý deň, ${booking.name},`,
        "",
        "tvoj termín je potvrdený. Teším sa na tvoju návštevu.",
        "",
        ...appointmentSummaryLines(booking),
        `Adresa: ${siteConfig.address}`,
        "",
        customerCalendarLink ? `Pridať do kalendára: ${customerCalendarLink}` : "",
        "",
        "Timea Skincare",
        siteConfig.phone,
        siteConfig.email,
      ]
        .filter(Boolean)
        .join("\n");

  const customerHtml = isEnglish
    ? emailLayout(
        "Your appointment is confirmed",
        `<p>Hello ${escapeHtml(booking.name)},</p>
     <p>your appointment at Timea Skincare has been <strong>confirmed</strong>.</p>
     ${summaryHtml([...customerAppointmentLines(booking), `Address: ${siteConfig.address}`])}
     ${customerCalendarLink ? `<p style="margin:0 0 16px;">${emailButton(customerCalendarLink, "Add to Google Calendar")}</p>` : ""}
     <p style="font-size:13px;color:#8b8d88;margin:0 0 16px;">A .ics file is also attached, which adds the appointment to any calendar.</p>
     <p style="margin:0;">I look forward to seeing you.<br/>Timea Skincare<br/>${escapeHtml(siteConfig.phone)}<br/>${escapeHtml(siteConfig.email)}</p>`,
      )
    : emailLayout(
        "Rezervácia potvrdená",
        `<p>Dobrý deň, ${escapeHtml(booking.name)},</p>
     <p>tvoj termín je <strong>potvrdený</strong>. Teším sa na tvoju návštevu.</p>
     ${summaryHtml([...appointmentSummaryLines(booking), `Adresa: ${siteConfig.address}`])}
     ${customerCalendarLink ? `<p style="margin:0 0 16px;">${emailButton(customerCalendarLink, "Pridať do Google kalendára")}</p>` : ""}
     <p style="font-size:13px;color:#8b8d88;margin:0 0 16px;">V prílohe je aj súbor .ics, ktorý pridá termín do akéhokoľvek kalendára.</p>
     <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}<br/>${escapeHtml(siteConfig.email)}</p>`,
      );

  const ownerText = [
    "Potvrdená rezervácia:",
    "",
    ...customerSummaryLines(booking),
    ownerCalendarLink ? `Pridať do kalendára: ${ownerCalendarLink}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ownerHtml = emailLayout(
    "Potvrdená rezervácia",
    `<p>Táto rezervácia bola <strong>potvrdená</strong>.</p>
     ${summaryHtml(customerSummaryLines(booking))}
     ${ownerCalendarLink ? `<p style="margin:0;">${emailButton(ownerCalendarLink, "Pridať do Google kalendára")}</p>` : ""}`,
  );

  await Promise.all([
    sendEmail(booking.email, customerSubject, customerText, {
      html: customerHtml,
      attachments: customerAttachments,
    }),
    sendEmail(siteConfig.email, `Potvrdená rezervácia – ${booking.name}`, ownerText, {
      html: ownerHtml,
      attachments: ownerAttachments,
    }),
  ]);
}

/** Sends the declined-booking e-mail to the customer (and a copy to Timea). */
export async function declineReservation(booking: BookingRequest) {
  const isEnglish = booking.locale === "en";

  const customerSubject = isEnglish
    ? "Your appointment request could not be confirmed | Timea Skincare"
    : "Rezervácia – Timea Skincare";

  const customerText = isEnglish
    ? [
        `Hello ${booking.name},`,
        "",
        "unfortunately, the requested appointment time could not be confirmed.",
        "Please choose another time using the booking form, or contact the salon.",
        "",
        ...customerAppointmentLines(booking),
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n")
    : [
        `Dobrý deň, ${booking.name},`,
        "",
        "mrzí ma to, ale vybraný termín sa mi nepodarilo potvrdiť.",
        "Ozvem sa ti, prípadne si môžeš zvoliť iný čas cez rezervačný formulár.",
        "",
        ...appointmentSummaryLines(booking),
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n");

  const customerHtml = isEnglish
    ? emailLayout(
        "Your appointment request could not be confirmed",
        `<p>Hello ${escapeHtml(booking.name)},</p>
     <p>unfortunately, the requested appointment time <strong>could not be confirmed</strong>. Please choose another time using the booking form, or contact the salon.</p>
     ${summaryHtml(customerAppointmentLines(booking))}
     <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      )
    : emailLayout(
        "Rezervácia – Timea Skincare",
        `<p>Dobrý deň, ${escapeHtml(booking.name)},</p>
     <p>mrzí ma to, ale vybraný termín sa mi <strong>nepodarilo potvrdiť</strong>. Ozvem sa ti, prípadne si môžeš zvoliť iný čas cez rezervačný formulár.</p>
     ${summaryHtml(appointmentSummaryLines(booking))}
     <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      );

  await Promise.all([
    sendEmail(booking.email, customerSubject, customerText, {
      html: customerHtml,
    }),
    sendEmail(
      siteConfig.email,
      `Odmietnutá rezervácia – ${booking.name}`,
      ["Táto rezervácia bola odmietnutá:", "", ...customerSummaryLines(booking)].join("\n"),
    ),
  ]);
}

async function sendSms(to: string, body: string) {
  const { sid, token, from, messagingServiceSid } = getSmsConfig();

  if (!sid || !token || (!from && !messagingServiceSid)) {
    return { skipped: true };
  }

  const params = new URLSearchParams({
    To: normalizePhone(to),
    Body: body,
  });

  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else {
    params.set("From", from!);
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );

  if (!response.ok) {
    throw new Error("Nepodarilo sa odoslať SMS.");
  }

  return { skipped: false };
}

type SmsStatus = "sent" | "failed" | "skipped";

function ownerSmsBody(booking: BookingRequest) {
  return [
    "Nová rezervácia – Timea Skincare:",
    `Meno: ${booking.name}`,
    `Telefón: ${booking.phone}`,
    `Služba: ${booking.services.join(", ")}`,
    `Dátum: ${booking.date}`,
    `Čas: ${booking.time}`,
    `Poznámka: ${booking.note ? booking.note : "-"}`,
  ].join("\n");
}

const CUSTOMER_SMS_BODY =
  "Ďakujeme za rezerváciu v Timea Skincare. Vašu požiadavku sme prijali a čoskoro vás budeme kontaktovať s potvrdením termínu.";

async function trySendSms(to: string, body: string): Promise<SmsStatus> {
  if (!hasSmsConfig()) {
    return "skipped";
  }

  try {
    const result = await sendSms(to, body);
    return result.skipped ? "skipped" : "sent";
  } catch (error) {
    // Log safely without exposing customer data or provider secrets.
    console.error(
      "[reservation] SMS send failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return "failed";
  }
}

async function sendReservationNotifications(booking: BookingRequest) {
  const owner = await trySendSms(getOwnerPhone(), ownerSmsBody(booking));
  const customer = await trySendSms(booking.phone, CUSTOMER_SMS_BODY);
  return { owner, customer };
}

export async function sendTomorrowSmsReminders() {
  if (!hasGoogleCalendarConfig()) {
    return { processed: 0, sent: 0, skipped: "calendar" };
  }

  const now = new Date();
  const tomorrow = new Intl.DateTimeFormat("en-CA", {
    timeZone: bookingConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const window = getDateWindowUtc(tomorrow);
  if (!window) {
    return { processed: 0, sent: 0, skipped: "date" };
  }

  const accessToken = await getGoogleAccessToken();
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      googleConfig.calendarId!,
    )}/events`,
  );
  url.searchParams.set("timeMin", window.start.toISOString());
  url.searchParams.set("timeMax", window.end.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa načítať zajtrajšie rezervácie.");
  }

  const data = (await response.json()) as {
    items?: Array<{
      id: string;
      start?: { dateTime?: string };
      extendedProperties?: { private?: Record<string, string> };
    }>;
  };
  const events = data.items ?? [];
  let sent = 0;

  for (const event of events) {
    const privateData = event.extendedProperties?.private ?? {};
    if (
      privateData.source !== "timeaskincare-web" ||
      privateData.smsReminderSent === "true" ||
      !privateData.customerPhone ||
      !event.start?.dateTime
    ) {
      continue;
    }

    const time = new Intl.DateTimeFormat("sk-SK", {
      timeZone: bookingConfig.timeZone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(event.start.dateTime));

    await sendSms(
      privateData.customerPhone,
      `Timea Skincare: pripomíname termín zajtra o ${time}. Tešíme sa na vás. Zmena termínu: ${siteConfig.phone}`,
    );

    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        googleConfig.calendarId!,
      )}/events/${encodeURIComponent(event.id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extendedProperties: {
            private: {
              ...privateData,
              smsReminderSent: "true",
            },
          },
        }),
      },
    );

    sent += 1;
  }

  return { processed: events.length, sent };
}

export { validateBookingRequest };
