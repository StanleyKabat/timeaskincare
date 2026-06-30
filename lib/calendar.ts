import crypto from "node:crypto";

import { siteConfig } from "@/data/site";
import { bookingConfig, zonedDateTimeToUtcMs } from "@/lib/booking";
import type { BookingRequest } from "@/lib/booking-integrations";

/** Fallback length used when a booking has no resolved service duration. */
export const FALLBACK_DURATION_MINUTES = 60;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Formats a UTC timestamp as an iCalendar/Google UTC stamp: YYYYMMDDTHHMMSSZ. */
function formatUtcStamp(ms: number) {
  const date = new Date(ms);
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function getEventTimes(booking: BookingRequest) {
  const duration =
    booking.durationMinutes > 0 ? booking.durationMinutes : FALLBACK_DURATION_MINUTES;
  const startMs = zonedDateTimeToUtcMs(booking.date, booking.time, bookingConfig.timeZone);

  if (startMs === null) {
    return null;
  }

  return { startMs, endMs: startMs + duration * 60_000 };
}

export function eventTitle(booking: BookingRequest) {
  return `Timea Skincare – ${booking.services.join(", ")}`;
}

function eventDescription(booking: BookingRequest) {
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

/** Google Calendar "add event" template URL. */
export function buildGoogleCalendarLink(booking: BookingRequest): string | null {
  const times = getEventTimes(booking);
  if (!times) {
    return null;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(booking),
    dates: `${formatUtcStamp(times.startMs)}/${formatUtcStamp(times.endMs)}`,
    details: eventDescription(booking),
    location: siteConfig.address,
    ctz: bookingConfig.timeZone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Builds a valid single-event .ics file for the confirmed appointment. */
export function buildIcsFile(booking: BookingRequest): string | null {
  const times = getEventTimes(booking);
  if (!times) {
    return null;
  }

  const uid = `${formatUtcStamp(times.startMs)}-${crypto.randomUUID()}@timeaskincare.sk`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Timea Skincare//Rezervacia//SK",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtcStamp(Date.now())}`,
    `DTSTART:${formatUtcStamp(times.startMs)}`,
    `DTEND:${formatUtcStamp(times.endMs)}`,
    `SUMMARY:${escapeIcs(eventTitle(booking))}`,
    `LOCATION:${escapeIcs(siteConfig.address)}`,
    `DESCRIPTION:${escapeIcs(eventDescription(booking))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
