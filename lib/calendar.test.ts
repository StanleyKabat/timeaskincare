import { describe, expect, it } from "vitest";

import { siteConfig } from "@/data/site";
import { buildGoogleCalendarLink, buildIcsFile, eventTitle } from "@/lib/calendar";
import type { BookingRequest } from "@/lib/booking-integrations";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    name: "Anna Test",
    email: "anna@example.com",
    phone: "+421900111222",
    services: ["Základné ošetrenie"],
    date: "2026-07-06",
    time: "10:00",
    durationMinutes: 75,
    note: "",
    ...overrides,
  };
}

describe("calendar generation – Europe/Bratislava", () => {
  it("uses the correct event title", () => {
    expect(eventTitle(makeBooking())).toBe("Timea Skincare – Základné ošetrenie");
  });

  it("pins .ics to TZID=Europe/Bratislava with local wall-clock times (summer)", () => {
    const ics = buildIcsFile(makeBooking())!;
    expect(ics).toContain("TZID:Europe/Bratislava");
    expect(ics).toContain("BEGIN:VTIMEZONE");
    expect(ics).toContain("DTSTART;TZID=Europe/Bratislava:20260706T100000");
    // 10:00 + 75 min = 11:15
    expect(ics).toContain("DTEND;TZID=Europe/Bratislava:20260706T111500");
    // Never emit a bare UTC "Z" start that clients could shift.
    expect(ics).not.toContain("DTSTART:20260706T080000Z");
    expect(ics).toContain(`LOCATION:${siteConfig.address.replace(/,/g, "\\,")}`);
  });

  it("pins .ics to local wall-clock times in winter too (DST handled by TZID)", () => {
    const ics = buildIcsFile(makeBooking({ date: "2026-01-06" }))!;
    expect(ics).toContain("DTSTART;TZID=Europe/Bratislava:20260106T100000");
    expect(ics).toContain("DTEND;TZID=Europe/Bratislava:20260106T111500");
  });

  it("builds a Google Calendar link with local dates (no Z) and ctz", () => {
    const link = buildGoogleCalendarLink(makeBooking())!;
    expect(link).toContain("dates=20260706T100000%2F20260706T111500");
    expect(link).toContain("ctz=Europe%2FBratislava");
    expect(link).toContain("text=Timea+Skincare");
    // The old, buggy behaviour produced UTC "Z" stamps in the dates param.
    expect(link).not.toContain("080000Z");
  });

  it("respects service duration for the end time", () => {
    const ics = buildIcsFile(makeBooking({ durationMinutes: 120 }))!;
    // 10:00 + 120 min = 12:00
    expect(ics).toContain("DTEND;TZID=Europe/Bratislava:20260706T120000");
  });

  it("falls back to a defined duration when none is provided", () => {
    const ics = buildIcsFile(makeBooking({ durationMinutes: 0 }))!;
    // fallback 60 min -> 11:00
    expect(ics).toContain("DTEND;TZID=Europe/Bratislava:20260706T110000");
  });
});
