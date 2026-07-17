import { beforeAll, describe, expect, it } from "vitest";

import {
  bookingConfig,
  getSlotsForDate,
  zonedDateTimeToUtcMs,
} from "@/lib/booking";
import {
  appointmentSummaryLines,
  customerAppointmentLines,
  eventStartMatchesBooking,
  getBookingKey,
  type BookingRequest,
} from "@/lib/booking-integrations";
import { createBookingToken, verifyBookingToken } from "@/lib/booking-token";
import {
  buildConfirmedCalendarDateTimes,
  buildGoogleCalendarLink,
  buildIcsFile,
  getBookingWallClock,
} from "@/lib/calendar";

const SECRET = "booking-time-immutability-test-secret";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    name: "Test Customer",
    email: "test@example.com",
    phone: "+421900000000",
    services: ["Základné ošetrenie"],
    date: "2026-07-20",
    time: "09:00",
    durationMinutes: 75,
    note: "",
    locale: "sk",
    iat: 1_720_000_000_000,
    ...overrides,
  };
}

function expectImmutableStart(booking: BookingRequest, selectedTime: string) {
  const wallClock = getBookingWallClock(booking)!;
  const dateTimes = buildConfirmedCalendarDateTimes(booking)!;
  const ics = buildIcsFile(booking)!;
  const link = buildGoogleCalendarLink(booking)!;
  const stamp = `${booking.date.replace(/-/g, "")}T${selectedTime.replace(":", "")}00`;

  expect(booking.time).toBe(selectedTime);
  expect(wallClock.start.time).toBe(selectedTime);
  expect(wallClock.start.date).toBe(booking.date);
  expect(dateTimes.start).toBe(`${booking.date}T${selectedTime}:00`);
  expect(ics).toContain(`DTSTART;TZID=Europe/Bratislava:${stamp}`);
  expect(ics).not.toMatch(/DTSTART[^:]*:\d{8}T\d{6}Z/);
  expect(link).toContain(`dates=${stamp}%2F`);
  expect(link).not.toContain("Z%2F");
  expect(link).toContain("ctz=Europe%2FBratislava");
  expect(appointmentSummaryLines(booking)).toContain(`Čas: ${selectedTime}`);
  expect(
    customerAppointmentLines({ ...booking, locale: "en" }),
  ).toContain(`Time: ${selectedTime}`);
}

describe("booking start time immutability", () => {
  beforeAll(() => {
    process.env.BOOKING_SIGNING_SECRET = SECRET;
  });

  it.each(["09:00", "09:30", "10:00"] as const)(
    "selected %s remains %s everywhere (wall-clock, ICS, Google link, emails)",
    (selectedTime) => {
      expectImmutableStart(makeBooking({ time: selectedTime }), selectedTime);
    },
  );

  it("token round-trip preserves the exact selected time", () => {
    for (const time of ["09:00", "09:30", "10:00"] as const) {
      const booking = makeBooking({ time, locale: "en" });
      const parsed = verifyBookingToken(createBookingToken(booking));
      expect(parsed?.time).toBe(time);
      expect(parsed?.date).toBe(booking.date);
      expect(parsed?.durationMinutes).toBe(booking.durationMinutes);
    }
  });

  it("10-minute buffer does not alter appointment start", () => {
    expect(bookingConfig.breakMinutes).toBe(10);
    const booking = makeBooking({ time: "09:00" });
    const wallClock = getBookingWallClock(booking)!;
    expect(wallClock.start.time).toBe("09:00");
    // Buffer only participates in availability overlap checks.
    const slots = getSlotsForDate(
      booking.date,
      booking.durationMinutes,
      [],
      bookingConfig,
      new Date("2026-07-17T08:00:00Z"),
    );
    expect(slots).toContain("09:00");
    expect(buildConfirmedCalendarDateTimes(booking)?.start).toBe(
      "2026-07-20T09:00:00",
    );
  });

  it("30-minute slot grid does not alter a selected start", () => {
    expect(bookingConfig.slotStepMinutes).toBe(30);
    const booking = makeBooking({ time: "09:30" });
    expect(getBookingWallClock(booking)?.start.time).toBe("09:30");
    expect(buildConfirmedCalendarDateTimes(booking)?.start).toBe(
      "2026-07-20T09:30:00",
    );
  });

  it.each([
    [75, "10:15"],
    [95, "10:35"],
    [120, "11:00"],
  ] as const)(
    "%s-minute service changes only the end time (start stays 09:00 → end %s)",
    (durationMinutes, endTime) => {
      const booking = makeBooking({ time: "09:00", durationMinutes });
      const wallClock = getBookingWallClock(booking)!;
      expect(wallClock.start.time).toBe("09:00");
      expect(wallClock.end.time).toBe(endTime);
      expect(buildConfirmedCalendarDateTimes(booking)).toEqual({
        start: "2026-07-20T09:00:00",
        end: `2026-07-20T${endTime}:00`,
      });
      const ics = buildIcsFile(booking)!;
      expect(ics).toContain("DTSTART;TZID=Europe/Bratislava:20260720T090000");
      expect(ics).toContain(
        `DTEND;TZID=Europe/Bratislava:20260720T${endTime.replace(":", "")}00`,
      );
    },
  );

  it("SK and EN request/confirmation display lines keep the exact selected time", () => {
    const booking = makeBooking({ time: "09:30", locale: "sk" });
    expect(appointmentSummaryLines(booking)).toEqual(
      expect.arrayContaining(["Čas: 09:30"]),
    );
    expect(customerAppointmentLines({ ...booking, locale: "en" })).toEqual(
      expect.arrayContaining(["Time: 09:30"]),
    );
  });

  it("Google Calendar event payload starts at exact Bratislava wall-clock time", () => {
    const booking = makeBooking({ time: "10:00", durationMinutes: 75 });
    expect(buildConfirmedCalendarDateTimes(booking)).toEqual({
      start: "2026-07-20T10:00:00",
      end: "2026-07-20T11:15:00",
    });
  });

  it("eventStartMatchesBooking accepts the exact Google offset and rejects a 30-min shift", () => {
    const booking = makeBooking({ date: "2026-07-20", time: "09:00" });
    // Summer CEST = +02:00
    expect(
      eventStartMatchesBooking(booking, "2026-07-20T09:00:00+02:00"),
    ).toBe(true);
    expect(
      eventStartMatchesBooking(booking, "2026-07-20T09:30:00+02:00"),
    ).toBe(false);
    expect(eventStartMatchesBooking(booking, undefined)).toBe(false);
  });

  it("double confirmation key stays tied to the original time (no shifted event key)", () => {
    const first = makeBooking({ time: "09:00" });
    const secondClick = makeBooking({ time: "09:00" });
    const shifted = makeBooking({ time: "09:30" });
    expect(getBookingKey(first)).toBe(getBookingKey(secondClick));
    expect(getBookingKey(first)).not.toBe(getBookingKey(shifted));
  });

  it("is DST-safe for Europe/Bratislava winter and summer", () => {
    const summer = makeBooking({ date: "2026-07-20", time: "09:00" });
    const winter = makeBooking({ date: "2026-01-12", time: "09:00" });

    expect(getBookingWallClock(summer)?.start.time).toBe("09:00");
    expect(getBookingWallClock(winter)?.start.time).toBe("09:00");
    expect(buildIcsFile(summer)).toContain(
      "DTSTART;TZID=Europe/Bratislava:20260720T090000",
    );
    expect(buildIcsFile(winter)).toContain(
      "DTSTART;TZID=Europe/Bratislava:20260112T090000",
    );

    const summerUtc = zonedDateTimeToUtcMs("2026-07-20", "09:00")!;
    const winterUtc = zonedDateTimeToUtcMs("2026-01-12", "09:00")!;
    // Summer +02:00 → 07:00Z; winter +01:00 → 08:00Z
    expect(new Date(summerUtc).toISOString()).toBe("2026-07-20T07:00:00.000Z");
    expect(new Date(winterUtc).toISOString()).toBe("2026-01-12T08:00:00.000Z");
    expect(
      eventStartMatchesBooking(summer, "2026-07-20T09:00:00+02:00"),
    ).toBe(true);
    expect(
      eventStartMatchesBooking(winter, "2026-01-12T09:00:00+01:00"),
    ).toBe(true);
  });

  it("does not introduce UTC Z double-conversion in ICS or Google links", () => {
    const booking = makeBooking({ time: "09:30" });
    const ics = buildIcsFile(booking)!;
    const link = buildGoogleCalendarLink(booking)!;
    expect(ics).not.toContain("DTSTART:20260720T073000Z");
    expect(ics).not.toContain("DTSTART:20260720T083000Z");
    expect(link).not.toContain("073000Z");
    expect(link).not.toContain("083000Z");
    expect(link).toContain("dates=20260720T093000%2F20260720T104500");
  });
});
