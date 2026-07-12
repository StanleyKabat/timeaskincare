import { NextResponse } from "next/server";
import { CurrencyCode, encode, PaymentOptions } from "bysquare/pay";
import QRCode from "qrcode";

import { giftVoucherPaymentConfig } from "@/data/site";
import { resolveVoucherSelection } from "@/lib/voucher-selection";

export const runtime = "nodejs";

/**
 * Generates a valid Slovak "PAY by square" QR code for a gift-voucher bank
 * transfer. Generation is server-side only (no browser payment/QR API calls).
 * The IBAN is a public receiving account, not a secret.
 *
 * The amount is derived/validated server-side so it cannot be tampered with by
 * the client.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const from = String(body.from ?? "").trim();
    const forWhom = String(body.for ?? "").trim();
    const selection = resolveVoucherSelection(body);
    if (!from || !forWhom || from.length > 80 || forWhom.length > 80) {
      return NextResponse.json(
        { ok: false, error: "Doplň, od koho a pre koho je darčeková poukážka." },
        { status: 400 },
      );
    }

    if (giftVoucherPaymentConfig.iban.includes("[DOPLNIŤ_IBAN]")) {
      return NextResponse.json(
        { ok: false, error: "Chýba IBAN pre QR platbu darčekovej poukážky." },
        { status: 400 },
      );
    }

    const amount = selection.amount;
    const message =
      selection.voucherType === "services"
        ? `${giftVoucherPaymentConfig.notePrefix} - ošetrenia - od ${from} pre ${forWhom}`
        : `${giftVoucherPaymentConfig.notePrefix} - hodnota ${amount} EUR - od ${from} pre ${forWhom}`;

    // PAY by square payload (compatible with Slovak banking apps).
    let qrDataUrl = "";
    try {
      const qrString = encode({
        payments: [
          {
            type: PaymentOptions.PaymentOrder,
            amount,
            currencyCode: CurrencyCode.EUR,
            paymentNote: message,
            beneficiary: { name: giftVoucherPaymentConfig.accountName },
            bankAccounts: [{ iban: giftVoucherPaymentConfig.iban }],
          },
        ],
      });

      qrDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 512,
      });
    } catch {
      // Keep the validated manual bank-transfer details available if only QR
      // rendering fails.
    }

    return NextResponse.json({
      ok: true,
      qrDataUrl,
      iban: giftVoucherPaymentConfig.iban,
      accountName: giftVoucherPaymentConfig.accountName,
      currency: giftVoucherPaymentConfig.currency,
      amount: amount.toFixed(2),
      message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Nepodarilo sa vytvoriť QR platbu.",
      },
      { status: 400 },
    );
  }
}
