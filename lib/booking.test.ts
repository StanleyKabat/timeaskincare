import { describe, expect, it } from "vitest";

import { bookingConfig, formatDuration, getLocalTodayISO, getSlotsForDate } from "./booking";

describe("booking utilities", () => {
  it("formats local ISO date without UTC shift", () => {
    const result = getLocalTodayISO(new Date("2026-05-11T23:59:59+02:00"));
    expect(result).toBe("2026-05-11");
  });

  it("includes break time in available slot calculations", () => {
    const slots = getSlotsForDate("2026-05-11", 60, bookingConfig);
    expect(slots.at(-1)).toBe("16:30");
    expect(slots).not.toContain("17:00");
  });

  it("calculates slots for combined service duration with one break", () => {
    const slots = getSlotsForDate("2026-05-11", 90, bookingConfig);
    expect(slots.at(-1)).toBe("16:00");
    expect(slots).not.toContain("16:30");
  });

  it("returns no slots on weekends", () => {
    const slots = getSlotsForDate("2026-05-10", 60, bookingConfig);
    expect(slots).toEqual([]);
  });

  it("formats duration text for minutes and hours", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});
