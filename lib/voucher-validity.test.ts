import { describe, expect, it } from "vitest";

import {
  addVoucherCalendarMonths,
  getNewVoucherValidUntil,
  getVoucherValidUntil,
} from "./voucher-validity";

function ymd(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

describe("voucher validity", () => {
  it("expires new vouchers four calendar months after issue", () => {
    const issuedAt = Date.parse("2026-07-12T10:00:00.000Z");
    expect(ymd(getNewVoucherValidUntil(issuedAt))).toBe("2026-11-12");
  });

  it("clamps month-end dates instead of using a fixed day count", () => {
    expect(ymd(addVoucherCalendarMonths(Date.parse("2026-01-31T12:00:00Z"), 4))).toBe(
      "2026-05-31",
    );
    expect(ymd(addVoucherCalendarMonths(Date.parse("2026-10-31T12:00:00Z"), 4))).toBe(
      "2027-02-28",
    );
    expect(ymd(addVoucherCalendarMonths(Date.parse("2027-10-31T12:00:00Z"), 4))).toBe(
      "2028-02-29",
    );
  });

  it("keeps explicit new expiry dates and legacy 12-month behavior", () => {
    const issuedAt = Date.parse("2026-07-12T10:00:00.000Z");
    const explicitExpiry = Date.parse("2026-11-12T12:00:00.000Z");

    expect(getVoucherValidUntil({ iat: issuedAt, validUntil: explicitExpiry })).toBe(
      explicitExpiry,
    );
    expect(ymd(getVoucherValidUntil({ iat: issuedAt }))).toBe("2027-07-12");
  });
});
