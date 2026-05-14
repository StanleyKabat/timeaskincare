import { bookableServices, siteConfig } from "@/data/site";
import {
  bookingConfig,
  getDateWindowUtc,
  getSlotsForDate,
  isWithinBookingRules,
  type BusyInterval,
} from "@/lib/booking";

export type BookingRequest = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  date: string;
  time: string;
  durationMinutes: number;
  note?: string;
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

export function getBookingIntegrationStatus() {
  return {
    calendarConfigured: hasGoogleCalendarConfig(),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM_EMAIL),
    smsConfigured: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID),
    ),
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

export async function createCalendarBooking(input: unknown) {
  const booking = validateBookingRequest(input);

  if (!hasGoogleCalendarConfig()) {
    const error = new Error("Kalendár ešte nie je napojený.");
    error.name = "CALENDAR_NOT_CONFIGURED";
    throw error;
  }

  const slots = await getAvailableSlotsFromCalendar(booking.date, booking.durationMinutes);
  if (!slots.includes(booking.time)) {
    throw new Error("Vybraný čas už nie je dostupný. Prosím, vyber iný čas.");
  }

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
        summary: `ONLINE REZERVÁCIA - ${booking.name} - čaká na potvrdenie`,
        description: bookingText(booking),
        start: {
          dateTime: start,
          timeZone: bookingConfig.timeZone,
        },
        end: {
          dateTime: end,
          timeZone: bookingConfig.timeZone,
        },
        attendees: [{ email: booking.email, displayName: booking.name }],
        extendedProperties: {
          private: {
            source: "timeaskincare-web",
            customerName: booking.name,
            customerEmail: booking.email,
            customerPhone: booking.phone,
            services: booking.services.join(" | "),
            durationMinutes: String(booking.durationMinutes),
            smsReminderSent: "false",
          },
        },
        reminders: {
          useDefault: true,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Nepodarilo sa vytvoriť termín v Google kalendári.");
  }

  const event = (await response.json()) as GoogleEvent;
  await Promise.allSettled([
    sendBookingEmails(booking, event),
    sendOwnerSmsNotification(booking),
  ]);

  return { booking, event };
}

async function sendEmail(to: string | string[], subject: string, text: string) {
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
    }),
  });

  if (!response.ok) {
    throw new Error("Nepodarilo sa odoslať e-mail.");
  }

  return { skipped: false };
}

async function sendBookingEmails(booking: BookingRequest, event: GoogleEvent) {
  const customerText = [
    `Dobrý deň, ${booking.name},`,
    "",
    "ďakujeme za rezerváciu v Timea Skincare.",
    "Termín je predbežne rezervovaný a platí po potvrdení salónom.",
    "",
    bookingText(booking),
    "",
    "V prípade zmeny nás kontaktujte telefonicky alebo správou.",
    siteConfig.phone,
  ].join("\n");

  const ownerText = [
    "Nová online rezervácia:",
    "",
    bookingText(booking),
    event.htmlLink ? `Kalendár: ${event.htmlLink}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await Promise.all([
    sendEmail(booking.email, "Timea Skincare - predbežná rezervácia termínu", customerText),
    sendEmail(siteConfig.email, `Nová rezervácia - ${booking.name}`, ownerText),
  ]);
}

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

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

async function sendOwnerSmsNotification(booking: BookingRequest) {
  const ownerPhone = process.env.TIMEA_NOTIFICATION_PHONE || siteConfig.phone;
  return sendSms(
    ownerPhone,
    `Timea Skincare: nová rezervácia ${booking.date} ${booking.time}, ${booking.name}, ${booking.services.join(", ")}. Tel: ${booking.phone}`,
  );
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
