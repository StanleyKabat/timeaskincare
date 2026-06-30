import crypto from "node:crypto";

import type { BookingRequest } from "@/lib/booking-integrations";

/**
 * Stateless, signed reservation tokens.
 *
 * The full booking payload is encoded into the token and signed with an HMAC
 * so the confirmation endpoint can trust it without any database. The secret
 * stays server-side; a forged or tampered token fails signature verification.
 *
 * Limitation (no DB): because there is no server-side state, a token cannot be
 * marked as "used", so opening the same confirm link twice would re-send the
 * confirmation e-mail. This is acceptable for a single-operator salon.
 */
function getSecret() {
  const secret =
    process.env.BOOKING_SIGNING_SECRET ||
    process.env.RESEND_API_KEY ||
    process.env.CRON_SECRET;

  if (!secret) {
    throw new Error("Chýba podpisový kľúč pre rezervácie (BOOKING_SIGNING_SECRET).");
  }

  return secret;
}

function sign(data: string) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createBookingToken(booking: BookingRequest): string {
  const payload = JSON.stringify({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    services: booking.services,
    date: booking.date,
    time: booking.time,
    durationMinutes: booking.durationMinutes,
    note: booking.note ?? "",
    iat: Date.now(),
  });

  const data = Buffer.from(payload, "utf8").toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyBookingToken(token: unknown): BookingRequest | null {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [data, signature] = token.split(".");
  if (!data || !signature) {
    return null;
  }

  try {
    const expected = sign(data);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));

    if (
      !parsed ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.date !== "string" ||
      typeof parsed.time !== "string" ||
      !Array.isArray(parsed.services)
    ) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      services: parsed.services.map((service: unknown) => String(service)),
      date: parsed.date,
      time: parsed.time,
      durationMinutes: Number(parsed.durationMinutes) || 0,
      note: typeof parsed.note === "string" ? parsed.note : "",
    };
  } catch {
    return null;
  }
}
