import { describe, expect, it } from "vitest";

import {
  bookingConfig,
  formatDuration,
  getLocalTodayISO,
  getSlotsForDate,
  isWithinBookingRules,
} from "./booking";

const morningBeforeTestDate = new Date("2026-05-10T04:00:00.000Z");

describe("booking utilities", () => {
  it("formats local ISO date without UTC shift", () => {
    const result = getLocalTodayISO(new Date("2026-05-11T23:59:59+02:00"));
    expect(result).toBe("2026-05-11");
  });

  it("allows an appointment to end at closing without adding a final break", () => {
    const slots = getSlotsForDate(
      "2026-05-11",
      120,
      [],
      bookingConfig,
      morningBeforeTestDate,
    );
    expect(slots).toContain("16:00");
    expect(slots).not.toContain("16:30");
  });

  it("calculates slots for combined service duration with one break", () => {
    const slots = getSlotsForDate(
      "2026-05-11",
      90,
      [
        {
          start: new Date("2026-05-11T06:00:00.000Z"),
          end: new Date("2026-05-11T07:00:00.000Z"),
        },
      ],
      bookingConfig,
      morningBeforeTestDate,
    );
    expect(slots).not.toContain("09:00");
    expect(slots).toContain("09:30");
  });

  it("returns no slots on weekends", () => {
    const slots = getSlotsForDate("2026-05-10", 60, [], bookingConfig, morningBeforeTestDate);
    expect(slots).toEqual([]);
  });

  it("blocks next-day online bookings after evening cutoff", () => {
    const result = isWithinBookingRules(
      "2026-05-12",
      "12:00",
      60,
      new Date("2026-05-11T18:05:00.000Z"),
      bookingConfig,
    );

    expect(result).toBe(false);
  });

  it("formats duration text in minutes", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("90 min");
  });
});
