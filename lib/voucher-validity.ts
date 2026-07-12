export const VOUCHER_TIMEZONE = "Europe/Bratislava";
export const NEW_VOUCHER_VALIDITY_MONTHS = 4;
const LEGACY_VOUCHER_VALIDITY_MONTHS = 12;

function localDateParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VOUCHER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

/** Adds calendar months to the Bratislava issue date, clamping month-end days. */
export function addVoucherCalendarMonths(timestamp: number, months: number): number {
  const issue = localDateParts(timestamp);
  const targetMonthIndex = issue.year * 12 + (issue.month - 1) + months;
  const targetYear = Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(issue.day, lastDayOfTargetMonth);

  // Noon UTC keeps the intended calendar date stable in Europe/Bratislava.
  return Date.UTC(targetYear, targetMonth, targetDay, 12);
}

export function getNewVoucherValidUntil(iat: number): number {
  return addVoucherCalendarMonths(iat, NEW_VOUCHER_VALIDITY_MONTHS);
}

/**
 * Old signed tokens have no explicit expiry and retain their original
 * 12-calendar-month validity. New tokens carry a signed four-month date.
 */
export function getVoucherValidUntil(voucher: {
  iat?: number;
  validUntil?: number;
}): number {
  if (typeof voucher.validUntil === "number" && Number.isFinite(voucher.validUntil)) {
    return voucher.validUntil;
  }

  const iat = typeof voucher.iat === "number" ? voucher.iat : Date.now();
  return addVoucherCalendarMonths(iat, LEGACY_VOUCHER_VALIDITY_MONTHS);
}

export function formatVoucherDate(timestamp: number, locale: "sk" | "en"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sk-SK", {
    timeZone: VOUCHER_TIMEZONE,
    day: "numeric",
    month: locale === "en" ? "long" : "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}
