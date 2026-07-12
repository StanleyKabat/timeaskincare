import crypto from "node:crypto";

import type { VoucherRequest } from "@/lib/voucher";
import { resolveVoucherSelection } from "@/lib/voucher-selection";
import { getNewVoucherValidUntil } from "@/lib/voucher-validity";

/**
 * Stateless, signed gift-voucher tokens.
 *
 * Mirrors the appointment booking token: the voucher request payload is encoded
 * and signed with an HMAC so the owner-confirmation endpoint can trust it
 * without any database. The secret stays server-side; a forged or tampered
 * token fails verification.
 *
 * A `kind: "voucher"` marker keeps these tokens separate from appointment
 * booking tokens — one can never be verified as the other.
 *
 * Limitation (no DB): a token cannot be marked "used", so opening the same
 * send-voucher link twice would re-send the voucher. The voucher code and PDF
 * are derived deterministically from the token, so a repeat click produces the
 * exact same voucher (same code, same content) — see lib/voucher.ts.
 */
function getSecret() {
  const secret =
    process.env.BOOKING_SIGNING_SECRET ||
    process.env.RESEND_API_KEY ||
    process.env.CRON_SECRET;

  if (!secret) {
    throw new Error("Chýba podpisový kľúč pre poukazy (BOOKING_SIGNING_SECRET).");
  }

  return secret;
}

function sign(data: string) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createVoucherToken(voucher: VoucherRequest): string {
  const iat = typeof voucher.iat === "number" ? voucher.iat : Date.now();
  const payload = JSON.stringify({
    kind: "voucher",
    name: voucher.name,
    email: voucher.email,
    phone: voucher.phone,
    voucherType: voucher.voucherType,
    services: voucher.services,
    amount: voucher.amount,
    from: voucher.from,
    forName: voucher.forName,
    note: voucher.note ?? "",
    locale: voucher.locale === "en" ? "en" : "sk",
    // Issued-at is the anchor for the deterministic voucher code and date.
    iat,
    validUntil:
      typeof voucher.validUntil === "number"
        ? voucher.validUntil
        : getNewVoucherValidUntil(iat),
  });

  const data = Buffer.from(payload, "utf8").toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyVoucherToken(token: unknown): VoucherRequest | null {
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
      parsed.kind !== "voucher" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }

    // Legacy single-treatment links remain valid; new links carry the explicit
    // voucher type and selection. Both paths are revalidated server-side.
    const selection = resolveVoucherSelection(
      parsed.voucherType === "services" || parsed.voucherType === "value"
        ? {
            voucherType: parsed.voucherType,
            services: parsed.services,
            valueAmount: parsed.amount,
          }
        : {
            voucherType: "services",
            services: typeof parsed.treatment === "string" ? [parsed.treatment] : [],
          },
    );

    return {
      name: parsed.name,
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      voucherType: selection.voucherType,
      services: selection.services,
      amount: selection.amount,
      from: typeof parsed.from === "string" ? parsed.from : "",
      forName: typeof parsed.forName === "string" ? parsed.forName : "",
      note: typeof parsed.note === "string" ? parsed.note : "",
      locale: parsed.locale === "en" ? "en" : "sk",
      iat: parsed.iat,
      validUntil:
        typeof parsed.validUntil === "number" && Number.isFinite(parsed.validUntil)
          ? parsed.validUntil
          : undefined,
    };
  } catch {
    return null;
  }
}
