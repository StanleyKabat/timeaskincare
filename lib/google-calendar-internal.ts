/**
 * Hard rules for Timea Skincare Google Calendar writes.
 *
 * Google Calendar is an INTERNAL owner calendar only. Customers must never be
 * attendees / guests, and Google must never email them about booking events.
 * Customer communication goes only through Timea Skincare (Resend).
 *
 * Official API (Events.insert / update / patch / delete):
 * sendUpdates=none → "No notifications are sent."
 * https://developers.google.com/workspace/calendar/api/v3/reference/events/patch
 */

/** Always pass this query value on insert/update/patch/delete. */
export const GOOGLE_SEND_UPDATES_NONE = "none" as const;

/** Fields that must never appear on an app-managed booking event write. */
const FORBIDDEN_GUEST_FIELDS = [
  "attendees",
  "attendeesOmitted",
  "anyoneCanAddSelf",
  "guestsCanInviteOthers",
  "guestsCanModify",
  "guestsCanSeeOtherGuests",
  "conferenceData",
] as const;

export type CalendarEventWritePayload = Record<string, unknown>;

export class CalendarGuestPayloadError extends Error {
  readonly code = "CALENDAR_GUEST_PAYLOAD";

  constructor(message: string) {
    super(message);
    this.name = "CalendarGuestPayloadError";
  }
}

function isNonProduction() {
  return process.env.NODE_ENV !== "production";
}

/**
 * Defensive sanitizer for every booking-event write body.
 *
 * - Strips attendees and guest-related fields.
 * - Never mutates start/end (copied by reference as provided).
 * - In development/test: throws if forbidden guest fields were present so
 *   regressions fail loudly.
 * - In production: strips and continues (safe fail-open for availability of
 *   confirmation), without logging any email addresses.
 */
export function sanitizeInternalCalendarEventPayload<T extends CalendarEventWritePayload>(
  payload: T,
): T {
  const presentForbidden = FORBIDDEN_GUEST_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field),
  );

  if (presentForbidden.length > 0 && isNonProduction()) {
    throw new CalendarGuestPayloadError(
      `Google Calendar payload must not include guest fields: ${presentForbidden.join(", ")}`,
    );
  }

  const sanitized: CalendarEventWritePayload = { ...payload };
  for (const field of FORBIDDEN_GUEST_FIELDS) {
    delete sanitized[field];
  }

  // Explicit empty attendees on PATCH clears guests (array overwrite). Callers
  // that need to clear old attendees must pass clearAttendees: true via the
  // dedicated helper below — never by putting emails into attendees.
  return sanitized as T;
}

/**
 * PATCH body that clears attendees while preserving other omitted fields.
 * Uses attendees: [] so Google overwrites the attendee array (patch semantics).
 */
export function buildClearAttendeesPatch(): { attendees: [] } {
  return { attendees: [] };
}

/** Appends sendUpdates=none to a Calendar events write URL. */
export function withGoogleSendUpdatesNone(url: string | URL): string {
  const parsed = typeof url === "string" ? new URL(url) : new URL(url.toString());
  parsed.searchParams.set("sendUpdates", GOOGLE_SEND_UPDATES_NONE);
  // Never allow the deprecated notification flag to re-enable mail.
  parsed.searchParams.delete("sendNotifications");
  return parsed.toString();
}

/**
 * Asserts a write URL is locked to sendUpdates=none and does not request
 * customer notifications. Used by tests and defensive call sites.
 */
export function assertInternalCalendarWriteUrl(url: string) {
  const parsed = new URL(url);
  const sendUpdates = parsed.searchParams.get("sendUpdates");
  if (sendUpdates !== GOOGLE_SEND_UPDATES_NONE) {
    throw new CalendarGuestPayloadError(
      `Calendar write URL must use sendUpdates=none (got ${sendUpdates ?? "missing"}).`,
    );
  }
  if (parsed.searchParams.get("sendNotifications") === "true") {
    throw new CalendarGuestPayloadError(
      "Calendar write URL must not use sendNotifications=true.",
    );
  }
}

/**
 * True when an event is clearly owned by the Timea Skincare booking system.
 * Strongest marker: private extended property source=timeaskincare-web and/or
 * a bookingKey. Never rely on title text alone.
 */
export function isAppManagedBookingEvent(event: {
  extendedProperties?: { private?: Record<string, string> };
}): boolean {
  const privateData = event.extendedProperties?.private ?? {};
  if (privateData.source === "timeaskincare-web") {
    return true;
  }
  return Boolean(privateData.bookingKey && privateData.bookingKey.length >= 16);
}

export function countAttendees(event: { attendees?: unknown[] | null }): number {
  return Array.isArray(event.attendees) ? event.attendees.length : 0;
}

/** Non-PII mask for logs / dry-run reports (short hash prefix of the event id). */
export function maskEventId(eventId: string): string {
  // Stable short fingerprint without exposing the full Google event id.
  let hash = 0;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = (hash * 31 + eventId.charCodeAt(i)) >>> 0;
  }
  return `evt_${hash.toString(16).padStart(8, "0")}`;
}
