import crypto from "node:crypto";

import {
  buildClearAttendeesPatch,
  countAttendees,
  isAppManagedBookingEvent,
  maskEventId,
  withGoogleSendUpdatesNone,
} from "@/lib/google-calendar-internal";

export type CleanupMode = "dry-run" | "apply";

export type CleanupEventSnapshot = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
  description?: string;
  attendees?: unknown[];
  extendedProperties?: { private?: Record<string, string> };
};

export type CleanupDecision =
  | {
      action: "clean";
      maskedId: string;
      date: string | null;
      time: string | null;
      attendeeCountBefore: number;
      reason: "has_attendees";
    }
  | {
      action: "skip";
      maskedId: string;
      date: string | null;
      time: string | null;
      attendeeCountBefore: number;
      reason:
        | "not_app_managed"
        | "no_attendees"
        | "missing_start"
        | "all_day"
        | "uncertain_identity";
    };

export type CleanupReport = {
  mode: CleanupMode;
  scanned: number;
  appManagedFuture: number;
  withAttendees: number;
  safeToClean: number;
  skipped: number;
  decisions: CleanupDecision[];
  applied?: Array<{
    maskedId: string;
    attendeeCountBefore: number;
    attendeeCountAfter: number;
    status: "cleaned" | "aborted_time_changed" | "failed";
  }>;
};

function wallClockFromEvent(event: CleanupEventSnapshot): {
  date: string | null;
  time: string | null;
} {
  const dateTime = event.start?.dateTime;
  if (!dateTime) {
    return { date: event.start?.date ?? null, time: null };
  }
  // Google returns offset timestamps; take the wall-clock prefix before offset.
  const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) {
    return { date: null, time: null };
  }
  return { date: match[1], time: match[2] };
}

export function classifyCleanupEvent(event: CleanupEventSnapshot): CleanupDecision {
  const maskedId = maskEventId(event.id);
  const { date, time } = wallClockFromEvent(event);
  const attendeeCountBefore = countAttendees(event);

  if (!isAppManagedBookingEvent(event)) {
    return {
      action: "skip",
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "not_app_managed",
    };
  }

  const privateData = event.extendedProperties?.private ?? {};
  if (!privateData.source && !privateData.bookingKey) {
    return {
      action: "skip",
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "uncertain_identity",
    };
  }

  if (event.start?.date && !event.start?.dateTime) {
    return {
      action: "skip",
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "all_day",
    };
  }

  if (!event.start?.dateTime) {
    return {
      action: "skip",
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "missing_start",
    };
  }

  if (attendeeCountBefore === 0) {
    return {
      action: "skip",
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "no_attendees",
    };
  }

  return {
    action: "clean",
    maskedId,
    date,
    time,
    attendeeCountBefore,
    reason: "has_attendees",
  };
}

export function buildAttendeeCleanupPatchUrl(calendarId: string, eventId: string) {
  return withGoogleSendUpdatesNone(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events/${encodeURIComponent(eventId)}`,
  );
}

export function buildAttendeeCleanupPatchBody() {
  // Patch array overwrite: empty attendees removes all guests.
  return buildClearAttendeesPatch();
}

export function eventTimesEqual(
  before: CleanupEventSnapshot,
  after: CleanupEventSnapshot,
): boolean {
  return (
    (before.start?.dateTime ?? null) === (after.start?.dateTime ?? null) &&
    (before.end?.dateTime ?? null) === (after.end?.dateTime ?? null) &&
    (before.start?.timeZone ?? null) === (after.start?.timeZone ?? null) &&
    (before.end?.timeZone ?? null) === (after.end?.timeZone ?? null)
  );
}

export function summarizeCleanupDecisions(
  mode: CleanupMode,
  events: CleanupEventSnapshot[],
): CleanupReport {
  const decisions = events.map(classifyCleanupEvent);
  const appManaged = decisions.filter((d) => d.reason !== "not_app_managed");
  const withAttendees = appManaged.filter((d) => d.attendeeCountBefore > 0);
  const safeToClean = decisions.filter((d) => d.action === "clean");

  return {
    mode,
    scanned: events.length,
    appManagedFuture: appManaged.length,
    withAttendees: withAttendees.length,
    safeToClean: safeToClean.length,
    skipped: decisions.filter((d) => d.action === "skip").length,
    decisions,
  };
}

/** Safe log line — never includes name/email/phone/description. */
export function formatCleanupLogLine(input: {
  operation: string;
  maskedId: string;
  date: string | null;
  time: string | null;
  attendeeCountBefore: number;
  attendeeCountAfter?: number;
  status: string;
}) {
  return JSON.stringify({
    scope: "calendar-attendee-cleanup",
    operation: input.operation,
    maskedId: input.maskedId,
    date: input.date,
    time: input.time,
    attendeeCountBefore: input.attendeeCountBefore,
    attendeeCountAfter: input.attendeeCountAfter ?? null,
    status: input.status,
    // Correlation id only — not derived from PII.
    runId: crypto.randomBytes(4).toString("hex"),
  });
}
