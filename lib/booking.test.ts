import { describe, expect, it } from "vitest";

import {
  allDayEventBusyIntervalForDate,
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

describe("all-day calendar availability", () => {
  it("single-day all-day Busy event blocks every slot that day", () => {
    const event = { start: { date: "2026-05-11" }, end: { date: "2026-05-12" } };
    const interval = allDayEventBusyIntervalForDate(event, "2026-05-11");
    expect(interval).not.toBeNull();

    const slots = getSlotsForDate(
      "2026-05-11",
      60,
      interval ? [interval] : [],
      bookingConfig,
      morningBeforeTestDate,
    );
    expect(slots).toEqual([]);
  });

  it("all-day Free/transparent event does not block slots", () => {
    const event = {
      start: { date: "2026-05-11" },
      end: { date: "2026-05-12" },
      transparency: "transparent",
    };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-11")).toBeNull();

    const slots = getSlotsForDate("2026-05-11", 60, [], bookingConfig, morningBeforeTestDate);
    expect(slots.length).toBeGreaterThan(0);
  });

  it("explicit opaque all-day event blocks", () => {
    const event = {
      start: { date: "2026-05-11" },
      end: { date: "2026-05-12" },
      transparency: "opaque",
    };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-11")).not.toBeNull();
  });

  it("multi-day all-day Busy event blocks every covered day", () => {
    // Blocks 2026-05-11, 2026-05-12, 2026-05-13 (end date is exclusive).
    const event = { start: { date: "2026-05-11" }, end: { date: "2026-05-14" } };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-11")).not.toBeNull();
    expect(allDayEventBusyIntervalForDate(event, "2026-05-13")).not.toBeNull();

    const slots = getSlotsForDate(
      "2026-05-13",
      60,
      [allDayEventBusyIntervalForDate(event, "2026-05-13")!],
      bookingConfig,
      morningBeforeTestDate,
    );
    expect(slots).toEqual([]);
  });

  it("handles Google's exclusive all-day end date", () => {
    const event = { start: { date: "2026-07-06" }, end: { date: "2026-07-07" } };
    expect(allDayEventBusyIntervalForDate(event, "2026-07-06")).not.toBeNull();
    expect(allDayEventBusyIntervalForDate(event, "2026-07-07")).toBeNull();
  });

  it("does not block days outside a multi-day range", () => {
    const event = { start: { date: "2026-05-11" }, end: { date: "2026-05-14" } };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-14")).toBeNull();
    expect(allDayEventBusyIntervalForDate(event, "2026-05-10")).toBeNull();
  });

  it("treats a missing/degenerate end date as a single day", () => {
    const event = { start: { date: "2026-05-11" } };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-11")).not.toBeNull();
    expect(allDayEventBusyIntervalForDate(event, "2026-05-12")).toBeNull();
  });

  it("ignores timed events (handled by FreeBusy, not the all-day path)", () => {
    const event = {
      start: { dateTime: "2026-05-11T08:00:00+02:00" },
      end: { dateTime: "2026-05-11T18:00:00+02:00" },
    };
    expect(allDayEventBusyIntervalForDate(event, "2026-05-11")).toBeNull();
  });
});
