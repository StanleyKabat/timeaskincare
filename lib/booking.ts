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
