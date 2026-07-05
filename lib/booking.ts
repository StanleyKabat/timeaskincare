export const bookingConfig = {
  openingHour: 8,
  closingHour: 18,
  breakMinutes: 10,
  slotStepMinutes: 30,
  minLeadMinutes: 12 * 60,
  nextDayCutoffHour: 20,
  timeZone: "Europe/Bratislava",
} as const;

export type BookingConfig = typeof bookingConfig;

export function getLocalTodayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDuration(minutes: number) {
  return `${minutes} min`;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getZonedParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
}

function formatZonedDateISO(now: Date, timeZone: string) {
  const parts = getZonedParts(now, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

function addDaysToISO(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days, 12));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

function getTimeZoneOffsetMs(utcMs: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcMs));

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const zonedAsUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );

  return zonedAsUtc - utcMs;
}

export function zonedDateTimeToUtcMs(
  date: string,
  time: string,
  timeZone = bookingConfig.timeZone,
) {
  const [year, month, day] = date.split("-").map(Number);
  const minutes = timeToMinutes(time);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    minutes === null
  ) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const utcGuess = Date.UTC(year, month - 1, day, hours, mins);
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);

  return utcGuess - offset;
}

export function getDateWindowUtc(
  date: string,
  timeZone = bookingConfig.timeZone,
) {
  const start = zonedDateTimeToUtcMs(date, "00:00", timeZone);
  const nextDay = addDaysToISO(date, 1);
  const end = zonedDateTimeToUtcMs(nextDay, "00:00", timeZone);

  if (start === null || end === null) {
    return null;
  }

  return {
    start: new Date(start),
    end: new Date(end),
  };
}

export function isBusinessDay(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day !== 0 && day !== 6;
}

export function isWithinBookingRules(
  date: string,
  time: string,
  durationMinutes: number,
  now = new Date(),
  config = bookingConfig,
) {
  if (!date || durationMinutes <= 0 || !isBusinessDay(date)) {
    return false;
  }

  const startMinutes = timeToMinutes(time);
  if (startMinutes === null) {
    return false;
  }

  const appointmentEnd = startMinutes + durationMinutes;
  const opening = config.openingHour * 60;
  const closing = config.closingHour * 60;

  if (startMinutes < opening || appointmentEnd > closing) {
    return false;
  }

  const startUtcMs = zonedDateTimeToUtcMs(date, time, config.timeZone);
  if (startUtcMs === null) {
    return false;
  }

  if (startUtcMs - now.getTime() < config.minLeadMinutes * 60_000) {
    return false;
  }

  const today = formatZonedDateISO(now, config.timeZone);
  const tomorrow = addDaysToISO(today, 1);
  const zonedNow = getZonedParts(now, config.timeZone);

  if (date === tomorrow && zonedNow.hour >= config.nextDayCutoffHour) {
    return false;
  }

  return true;
}

export type BusyInterval = {
  start: Date;
  end: Date;
};

/** Minimal shape of a Google Calendar all-day event (only fields we inspect). */
export type GoogleAllDayEvent = {
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  /** "transparent" = Free; "opaque"/undefined = Busy (Google's default). */
  transparency?: string;
};

/**
 * Converts an all-day Google Calendar event into a busy interval that covers the
 * booking workday (openingHour–closingHour, Europe/Bratislava) for `date`.
 *
 * Why this exists: the FreeBusy API does not reliably expose all-day events
 * (e.g. a single-day absence that is not explicitly marked "Busy"), so slots for
 * whole-day absences could stay bookable. This runs on top of FreeBusy for
 * all-day events only; timed events keep coming from FreeBusy unchanged.
 *
 * Returns null (does NOT block) when:
 * - the event is not all-day (`start.date` missing → it's a timed event),
 * - the event is explicitly Free (`transparency === "transparent"`) — this
 *   preserves intentional all-day notes/reminders that must not block booking,
 * - `date` is outside the event's covered range.
 *
 * Google's all-day `end.date` is EXCLUSIVE:
 * - start.date 2026-07-06, end.date 2026-07-07 → blocks only 2026-07-06,
 * - start.date 2026-07-06, end.date 2026-07-13 → blocks 2026-07-06 … 2026-07-12.
 *
 * All-day dates are compared as local `YYYY-MM-DD` calendar strings (lexical
 * ISO compare), never as UTC timestamps, to avoid off-by-one-day shifts.
 */
export function allDayEventBusyIntervalForDate(
  event: GoogleAllDayEvent,
  date: string,
  config = bookingConfig,
): BusyInterval | null {
  const startDate = event.start?.date;
  if (!startDate) {
    return null; // Timed event (start.dateTime) — handled by FreeBusy.
  }

  if (event.transparency === "transparent") {
    return null; // Explicitly Free (e.g. an all-day note) — must not block.
  }

  // end.date is exclusive. Guard against missing/degenerate end dates by
  // treating them as a single-day event (start.date .. start.date + 1).
  const rawEnd = event.end?.date;
  const exclusiveEnd = rawEnd && rawEnd > startDate ? rawEnd : addDaysToISO(startDate, 1);

  // Covered iff startDate <= date < exclusiveEnd (ISO date strings sort lexically).
  if (date < startDate || date >= exclusiveEnd) {
    return null;
  }

  const openTime = `${String(config.openingHour).padStart(2, "0")}:00`;
  const closeTime = `${String(config.closingHour).padStart(2, "0")}:00`;
  const startMs = zonedDateTimeToUtcMs(date, openTime, config.timeZone);
  const endMs = zonedDateTimeToUtcMs(date, closeTime, config.timeZone);

  if (startMs === null || endMs === null) {
    return null;
  }

  return { start: new Date(startMs), end: new Date(endMs) };
}

function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
) {
  return startA < endB && startB < endA;
}

export function getSlotsForDate(
  date: string,
  durationMinutes: number,
  busyIntervals: BusyInterval[] = [],
  config = bookingConfig,
  now = new Date(),
) {
  if (!date || durationMinutes <= 0) {
    return [];
  }

  if (!isBusinessDay(date)) {
    return [];
  }

  const start = config.openingHour * 60;
  const end = config.closingHour * 60;
  const slots: string[] = [];

  for (let time = start; time + durationMinutes <= end; time += config.slotStepMinutes) {
    const slot = minutesToTime(time);

    if (!isWithinBookingRules(date, slot, durationMinutes, now, config)) {
      continue;
    }

    const startUtcMs = zonedDateTimeToUtcMs(date, slot, config.timeZone);
    if (startUtcMs === null) {
      continue;
    }

    const appointmentEndUtcMs = startUtcMs + durationMinutes * 60_000;
    const candidateEndWithBreakUtcMs =
      appointmentEndUtcMs + config.breakMinutes * 60_000;
    const hasConflict = busyIntervals.some((busy) =>
      intervalsOverlap(
        startUtcMs,
        candidateEndWithBreakUtcMs,
        busy.start.getTime(),
        busy.end.getTime() + config.breakMinutes * 60_000,
      ),
    );

    if (!hasConflict) {
      slots.push(slot);
    }
  }

  return slots;
}
