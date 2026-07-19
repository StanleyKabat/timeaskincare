import crypto from "node:crypto";

import { beforeAll, describe, expect, it } from "vitest";

import {
  confirmedCalendarEventTitle,
  getBookingKey,
  type BookingRequest,
} from "@/lib/booking-integrations";
import { createBookingToken, verifyBookingToken } from "@/lib/booking-token";

const SECRET = "test-signing-secret-value";

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    name: "Anna Test",
    email: "anna@example.com",
    phone: "+421900111222",
    services: ["Základné ošetrenie", "Úprava obočia"],
    date: "2026-07-06",
    time: "10:00",
    durationMinutes: 90,
    note: "",
    locale: "sk",
    iat: 1_700_000_000_000,
    ...overrides,
  };
}

describe("confirmedCalendarEventTitle", () => {
  it("formats single-service titles as HH:mm • Name • Service", () => {
    expect(
      confirmedCalendarEventTitle({
        time: "11:00",
        name: "Anna Polcová",
        services: ["Základné ošetrenie"],
      }),
    ).toBe("11:00 • Anna Polcová • Základné ošetrenie");
  });

  it("joins multiple services with ' + ' and does not truncate", () => {
    expect(
      confirmedCalendarEventTitle({
        time: "13:00",
        name: "Vanes Vozárová",
        services: ["Kozmetické ošetrenie", "Laminácia obočia"],
      }),
    ).toBe("13:00 • Vanes Vozárová • Kozmetické ošetrenie + Laminácia obočia");
  });

  it("keeps non-:00 start times verbatim", () => {
    expect(
      confirmedCalendarEventTitle({
        time: "15:15",
        name: "Klaudia Bónová",
        services: ["Laminácia obočia"],
      }),
    ).toBe("15:15 • Klaudia Bónová • Laminácia obočia");
  });
});

describe("getBookingKey (confirmation idempotency)", () => {
  it("is deterministic for the same booking", () => {
    expect(getBookingKey(makeBooking())).toBe(getBookingKey(makeBooking()));
  });

  it("ignores service order and email casing", () => {
    const a = getBookingKey(makeBooking({ services: ["Základné ošetrenie", "Úprava obočia"] }));
    const b = getBookingKey(
      makeBooking({ services: ["Úprava obočia", "Základné ošetrenie"], email: "ANNA@example.com" }),
    );
    expect(a).toBe(b);
  });

  it("differs when time, date or issued-at differ", () => {
    const base = getBookingKey(makeBooking());
    expect(getBookingKey(makeBooking({ time: "11:00" }))).not.toBe(base);
    expect(getBookingKey(makeBooking({ date: "2026-07-07" }))).not.toBe(base);
    expect(getBookingKey(makeBooking({ iat: 1_700_000_000_001 }))).not.toBe(base);
  });

  it("produces a stable sha256 hex string", () => {
    expect(getBookingKey(makeBooking())).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("booking token locale + iat", () => {
  beforeAll(() => {
    process.env.BOOKING_SIGNING_SECRET = SECRET;
  });

  it("round-trips locale and iat", () => {
    const token = createBookingToken(makeBooking({ locale: "en" }));
    const parsed = verifyBookingToken(token);
    expect(parsed?.locale).toBe("en");
    expect(typeof parsed?.iat).toBe("number");
  });

  it("defaults missing locale to sk (old-token compatibility)", () => {
    // Craft a legacy token WITHOUT a locale field, signed with the same secret.
    const legacyPayload = {
      name: "Old Client",
      email: "old@example.com",
      phone: "+421900000000",
      services: ["Základné ošetrenie"],
      date: "2026-07-06",
      time: "09:00",
      durationMinutes: 60,
      note: "",
      iat: 1_600_000_000_000,
    };
    const data = Buffer.from(JSON.stringify(legacyPayload), "utf8").toString("base64url");
    const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    const legacyToken = `${data}.${signature}`;

    const parsed = verifyBookingToken(legacyToken);
    expect(parsed).not.toBeNull();
    expect(parsed?.locale).toBe("sk");
    expect(parsed?.email).toBe("old@example.com");
    // The idempotency key must still be derivable from a legacy token.
    expect(getBookingKey(parsed!)).toMatch(/^[0-9a-f]{64}$/);
  });
});
