import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildConfirmedCalendarEventPayload,
  buildConfirmedCalendarInsertUrl,
  buildConfirmedCalendarPatchUrl,
  confirmedCalendarEventTitle,
  type BookingRequest,
} from "@/lib/booking-integrations";
import {
  buildAttendeeCleanupPatchBody,
  buildAttendeeCleanupPatchUrl,
  classifyCleanupEvent,
  eventTimesEqual,
  summarizeCleanupDecisions,
} from "@/lib/calendar-attendee-cleanup";
import {
  CalendarGuestPayloadError,
  assertInternalCalendarWriteUrl,
  countAttendees,
  isAppManagedBookingEvent,
  sanitizeInternalCalendarEventPayload,
  withGoogleSendUpdatesNone,
} from "@/lib/google-calendar-internal";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    name: "Anna Polcová",
    email: "customer@example.com",
    phone: "+421900111222",
    services: ["Základné ošetrenie"],
    date: "2026-08-03",
    time: "11:00",
    durationMinutes: 75,
    note: "",
    locale: "sk",
    iat: 1_720_000_000_000,
    ...overrides,
  };
}

describe("Google Calendar internal-only write hardening", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("new confirmed booking payload has no attendees", () => {
    const payload = buildConfirmedCalendarEventPayload(makeBooking(), "a".repeat(64));
    expect(payload).not.toHaveProperty("attendees");
    expect(JSON.stringify(payload)).not.toContain('"attendees"');
  });

  it("customer email is not an attendee; may only appear in private metadata/description", () => {
    const booking = makeBooking({ email: "customer@example.com" });
    const payload = buildConfirmedCalendarEventPayload(booking, "b".repeat(64));
    expect(payload).not.toHaveProperty("attendees");
    expect(payload).not.toHaveProperty("guestsCanInviteOthers");
    // Existing owner-facing description / private props may reference the email.
    const privateEmail =
      (payload.extendedProperties as { private?: { customerEmail?: string } })?.private
        ?.customerEmail ?? "";
    expect(privateEmail).toBe("customer@example.com");
  });

  it("insert URL uses sendUpdates=none and never sendUpdates=all/externalOnly", () => {
    const url = buildConfirmedCalendarInsertUrl("primary");
    expect(url).toContain("sendUpdates=none");
    expect(url).not.toContain("sendUpdates=all");
    expect(url).not.toContain("sendUpdates=externalOnly");
    expect(url).not.toContain("sendNotifications=true");
    assertInternalCalendarWriteUrl(url);
  });

  it("patch URL uses sendUpdates=none", () => {
    const url = buildConfirmedCalendarPatchUrl("primary", "event123");
    expect(url).toContain("sendUpdates=none");
    assertInternalCalendarWriteUrl(url);
  });

  it("update-style helper also forces sendUpdates=none", () => {
    const url = withGoogleSendUpdatesNone(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events/abc?sendUpdates=all&sendNotifications=true",
    );
    expect(url).toContain("sendUpdates=none");
    expect(url).not.toContain("sendUpdates=all");
    expect(url).not.toContain("sendNotifications=true");
  });

  it("sanitizer strips attendees in production and preserves start/end", () => {
    vi.stubEnv("NODE_ENV", "production");
    const start = { dateTime: "2026-08-03T11:00:00", timeZone: "Europe/Bratislava" };
    const end = { dateTime: "2026-08-03T12:15:00", timeZone: "Europe/Bratislava" };
    const sanitized = sanitizeInternalCalendarEventPayload({
      summary: "keep",
      start,
      end,
      attendees: [{ email: "customer@example.com" }],
      guestsCanInviteOthers: true,
      extendedProperties: { private: { bookingKey: "x" } },
    });
    expect(sanitized).not.toHaveProperty("attendees");
    expect(sanitized).not.toHaveProperty("guestsCanInviteOthers");
    expect(sanitized.start).toBe(start);
    expect(sanitized.end).toBe(end);
    expect(sanitized.summary).toBe("keep");
  });

  it("sanitizer throws in development/test when guest fields are present", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(() =>
      sanitizeInternalCalendarEventPayload({
        summary: "x",
        attendees: [{ email: "customer@example.com" }],
      }),
    ).toThrow(CalendarGuestPayloadError);
  });

  it("reused/idempotent confirm path cannot gain attendees from payload builder", () => {
    const first = buildConfirmedCalendarEventPayload(makeBooking(), "c".repeat(64));
    const second = buildConfirmedCalendarEventPayload(makeBooking(), "c".repeat(64));
    expect(first).not.toHaveProperty("attendees");
    expect(second).not.toHaveProperty("attendees");
    expect(first.summary).toBe(second.summary);
    expect(first.start).toEqual(second.start);
  });

  it("double confirmation keeps title and time unchanged and never enables notifications", () => {
    const booking = makeBooking({ time: "11:00", locale: "en" });
    const payload = buildConfirmedCalendarEventPayload(booking, "d".repeat(64));
    expect(payload.summary).toBe(
      confirmedCalendarEventTitle(booking),
    );
    expect(payload.summary).toBe("11:00 • Anna Polcová • Základné ošetrenie");
    expect(
      (payload.start as { dateTime: string }).dateTime,
    ).toBe("2026-08-03T11:00:00");
    expect(buildConfirmedCalendarInsertUrl("primary")).toContain("sendUpdates=none");
  });

  it("SK and EN payloads keep canonical Slovak services in the calendar title", () => {
    const sk = buildConfirmedCalendarEventPayload(
      makeBooking({ locale: "sk", services: ["Laminácia obočia"] }),
      "e".repeat(64),
    );
    const en = buildConfirmedCalendarEventPayload(
      makeBooking({ locale: "en", services: ["Laminácia obočia"] }),
      "f".repeat(64),
    );
    expect(sk.summary).toContain("Laminácia obočia");
    expect(en.summary).toContain("Laminácia obočia");
    expect(sk).not.toHaveProperty("attendees");
    expect(en).not.toHaveProperty("attendees");
  });

  it("cleanup patch clears attendees with sendUpdates=none", () => {
    const url = buildAttendeeCleanupPatchUrl("primary", "evt");
    expect(url).toContain("sendUpdates=none");
    expect(buildAttendeeCleanupPatchBody()).toEqual({ attendees: [] });
  });

  it("cleanup classifier targets only app-managed future bookings with attendees", () => {
    const appWithGuests = classifyCleanupEvent({
      id: "abc123",
      start: { dateTime: "2026-08-10T11:00:00+02:00" },
      end: { dateTime: "2026-08-10T12:15:00+02:00" },
      attendees: [{ email: "x@example.com" }],
      extendedProperties: {
        private: { source: "timeaskincare-web", bookingKey: "k".repeat(64) },
      },
    });
    expect(appWithGuests.action).toBe("clean");

    const lunch = classifyCleanupEvent({
      id: "lunch1",
      start: { dateTime: "2026-08-10T12:00:00+02:00" },
      attendees: [],
      extendedProperties: { private: {} },
    });
    expect(lunch.action).toBe("skip");
    expect(lunch.reason).toBe("not_app_managed");

    const alreadyClean = classifyCleanupEvent({
      id: "clean1",
      start: { dateTime: "2026-08-10T11:00:00+02:00" },
      attendees: [],
      extendedProperties: {
        private: { source: "timeaskincare-web", bookingKey: "k".repeat(64) },
      },
    });
    expect(alreadyClean.action).toBe("skip");
    expect(alreadyClean.reason).toBe("no_attendees");
  });

  it("cleanup summary counts are safe and time equality detects drift", () => {
    const report = summarizeCleanupDecisions("dry-run", [
      {
        id: "1",
        start: { dateTime: "2026-08-10T11:00:00+02:00" },
        attendees: [{ email: "a@example.com" }],
        extendedProperties: {
          private: { source: "timeaskincare-web", bookingKey: "k".repeat(64) },
        },
      },
      {
        id: "2",
        start: { dateTime: "2026-08-10T13:00:00+02:00" },
        attendees: [],
        extendedProperties: {
          private: { source: "timeaskincare-web", bookingKey: "m".repeat(64) },
        },
      },
    ]);
    expect(report.appManagedFuture).toBe(2);
    expect(report.withAttendees).toBe(1);
    expect(report.safeToClean).toBe(1);

    expect(
      eventTimesEqual(
        {
          id: "1",
          start: { dateTime: "2026-08-10T11:00:00+02:00", timeZone: "Europe/Bratislava" },
          end: { dateTime: "2026-08-10T12:15:00+02:00", timeZone: "Europe/Bratislava" },
        },
        {
          id: "1",
          start: { dateTime: "2026-08-10T11:00:00+02:00", timeZone: "Europe/Bratislava" },
          end: { dateTime: "2026-08-10T12:15:00+02:00", timeZone: "Europe/Bratislava" },
        },
      ),
    ).toBe(true);
  });

  it("isAppManagedBookingEvent requires strong metadata markers", () => {
    expect(
      isAppManagedBookingEvent({
        extendedProperties: { private: { source: "timeaskincare-web" } },
      }),
    ).toBe(true);
    expect(
      isAppManagedBookingEvent({
        extendedProperties: { private: { bookingKey: "x".repeat(16) } },
      }),
    ).toBe(true);
    expect(
      isAppManagedBookingEvent({
        extendedProperties: { private: {} },
      }),
    ).toBe(false);
    expect(countAttendees({ attendees: [{}, {}] })).toBe(2);
  });
});
