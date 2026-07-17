import crypto from "node:crypto";

import { toEnglishServiceNames } from "@/data/booking-en";
import { siteConfig } from "@/data/site";
import { bookingConfig } from "@/lib/booking";
import type { BookingRequest } from "@/lib/booking-integrations";

/** Fallback length used when a booking has no resolved service duration. */
export const FALLBACK_DURATION_MINUTES = 60;

export type CalendarOptions = {
  /** When false, the calendar event omits the salon address (owner calendar). */
  includeLocation?: boolean;
  /**
   * Locale for the customer-facing summary/description text. Defaults to "sk".
   * Timezone handling is identical regardless of locale.
   */
  locale?: "sk" | "en";
};

const TIME_ZONE = bookingConfig.timeZone; // "Europe/Bratislava"

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Formats a UTC timestamp as an iCalendar UTC stamp: YYYYMMDDTHHMMSSZ (used for DTSTAMP). */
function formatUtcStamp(ms: number) {
  const date = new Date(ms);
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export type BookingWallClock = {
  /** Local Europe/Bratislava values; never converted to UTC here. */
  start: { date: string; time: string };
  end: { date: string; time: string };
};

/**
 * THE single source of truth for a booking's appointment interval.
 *
 * Returns the selected start exactly as submitted (immutable local wall-clock
 * `YYYY-MM-DD` + `HH:mm` in Europe/Bratislava) and an end derived ONLY by
 * adding the service duration. Every output — Google Calendar event payload,
 * .ics DTSTART/DTEND, the Google Calendar URL and e-mail display — must derive
 * its times from this helper so the start can never be rounded, buffered or
 * shifted after selection.
 */
export function getBookingWallClock(
  booking: Pick<BookingRequest, "date" | "time" | "durationMinutes">,
): BookingWallClock | null {
  const duration =
    booking.durationMinutes > 0 ? booking.durationMinutes : FALLBACK_DURATION_MINUTES;

  const [year, month, day] = booking.date.split("-").map(Number);
  const [hour, minute] = booking.time.split(":").map(Number);

  if (![year, month, day, hour, minute].every((value) => Number.isFinite(value))) {
    return null;
  }

  // Start is immutable: never round, buffer or shift after selection.
  const startDate = `${year}-${pad(month)}-${pad(day)}`;
  const startTime = `${pad(hour)}:${pad(minute)}`;

  const endTotalMinutes = hour * 60 + minute + duration;
  const dayCarry = Math.floor(endTotalMinutes / 1440);
  const endMinutesOfDay = endTotalMinutes - dayCarry * 1440;
  const endHour = Math.floor(endMinutesOfDay / 60);
  const endMinute = endMinutesOfDay % 60;
  // Only used to roll the date forward if an appointment crosses midnight.
  const endDate = new Date(Date.UTC(year, month - 1, day + dayCarry));

  return {
    start: {
      date: startDate,
      time: startTime,
    },
    end: {
      date: `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth() + 1)}-${pad(
        endDate.getUTCDate(),
      )}`,
      time: `${pad(endHour)}:${pad(endMinute)}`,
    },
  };
}

/**
 * Google Calendar API local dateTime strings (no offset, no "Z") derived from
 * the immutable wall-clock helper. Pair with timeZone: Europe/Bratislava.
 */
export function buildConfirmedCalendarDateTimes(
  booking: Pick<BookingRequest, "date" | "time" | "durationMinutes">,
): { start: string; end: string } | null {
  const wallClock = getBookingWallClock(booking);
  if (!wallClock) {
    return null;
  }

  return {
    start: `${wallClock.start.date}T${wallClock.start.time}:00`,
    end: `${wallClock.end.date}T${wallClock.end.time}:00`,
  };
}

/**
 * Local wall-clock stamps (no "Z") for the appointment. These are interpreted
 * as Europe/Bratislava time via TZID (.ics) and ctz (Google), so DST is handled
 * by the calendar client and there is no accidental UTC/server-timezone shift.
 */
function getLocalStamps(booking: BookingRequest) {
  const wallClock = getBookingWallClock(booking);
  if (!wallClock) {
    return null;
  }

  const toStamp = (value: { date: string; time: string }) =>
    `${value.date.replace(/-/g, "")}T${value.time.replace(":", "")}00`;

  return {
    startStamp: toStamp(wallClock.start),
    endStamp: toStamp(wallClock.end),
  };
}

export function eventTitle(booking: BookingRequest, locale: "sk" | "en" = "sk") {
  if (locale === "en") {
    return "Timea Skincare appointment";
  }

  return `Timea Skincare – ${booking.services.join(", ")}`;
}

function eventDescription(booking: BookingRequest, locale: "sk" | "en" = "sk") {
  if (locale === "en") {
    return [
      "Confirmed appointment at Timea Skincare.",
      `Services: ${toEnglishServiceNames(booking.services).join(", ")}`,
      "",
      "Timea Skincare",
      siteConfig.phone,
      siteConfig.email,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Služby: ${booking.services.join(", ")}`,
    `Zákazníčka: ${booking.name}`,
    `Telefón: ${booking.phone}`,
    booking.note ? `Poznámka: ${booking.note}` : "",
    "",
    "Timea Skincare",
    siteConfig.phone,
    siteConfig.email,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Google Calendar "add event" template URL.
 * Uses local wall-clock times (no "Z") together with ctz=Europe/Bratislava.
 * Mixing UTC "Z" times with ctz makes Google double-apply the offset, which is
 * what previously shifted the event by an hour.
 */
export function buildGoogleCalendarLink(
  booking: BookingRequest,
  options: CalendarOptions = {},
): string | null {
  const stamps = getLocalStamps(booking);
  if (!stamps) {
    return null;
  }

  const includeLocation = options.includeLocation !== false;
  const locale = options.locale ?? "sk";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(booking, locale),
    dates: `${stamps.startStamp}/${stamps.endStamp}`,
    details: eventDescription(booking, locale),
    ctz: TIME_ZONE,
  });

  if (includeLocation) {
    params.set("location", siteConfig.address);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// EU DST rules for Europe/Bratislava (CET/CEST) so the pinned local times
// resolve to the correct absolute instant in every calendar client.
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TIME_ZONE}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** Builds a valid single-event .ics file pinned to Europe/Bratislava. */
export function buildIcsFile(
  booking: BookingRequest,
  options: CalendarOptions = {},
): string | null {
  const stamps = getLocalStamps(booking);
  if (!stamps) {
    return null;
  }

  const includeLocation = options.includeLocation !== false;
  const locale = options.locale ?? "sk";
  const uid = `${stamps.startStamp}-${crypto.randomUUID()}@timeaskincare.sk`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Timea Skincare//Rezervacia//SK",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtcStamp(Date.now())}`,
    `DTSTART;TZID=${TIME_ZONE}:${stamps.startStamp}`,
    `DTEND;TZID=${TIME_ZONE}:${stamps.endStamp}`,
    `SUMMARY:${escapeIcs(eventTitle(booking, locale))}`,
    ...(includeLocation ? [`LOCATION:${escapeIcs(siteConfig.address)}`] : []),
    `DESCRIPTION:${escapeIcs(eventDescription(booking, locale))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
