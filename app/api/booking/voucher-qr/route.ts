import { NextResponse } from "next/server";
import { CurrencyCode, encode, PaymentOptions } from "bysquare/pay";
import QRCode from "qrcode";

import { giftVoucherPaymentConfig, giftVoucherTreatments } from "@/data/site";

export const runtime = "nodejs";

/**
 * Generates a valid Slovak "PAY by square" QR code for a gift-voucher bank
 * transfer. Generation is server-side only (no browser payment/QR API calls).
 * The IBAN is a public receiving account, not a secret.
 *
 * The amount is derived server-side from the canonical treatment name so it
 * cannot be tampered with by the client.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      treatment?: unknown;
      from?: unknown;
      for?: unknown;
    };

    const treatmentName = String(body.treatment ?? "").trim();
    const from = String(body.from ?? "").trim();
    const forWhom = String(body.for ?? "").trim();

    const treatment = giftVoucherTreatments.find((item) => item.name === treatmentName);
    if (!treatment) {
      return NextResponse.json(
        { ok: false, error: "Neplatný typ ošetrenia pre poukážku." },
        { status: 400 },
      );
    }

    if (giftVoucherPaymentConfig.iban.includes("[DOPLNIŤ_IBAN]")) {
      return NextResponse.json(
        { ok: false, error: "Chýba IBAN pre QR platbu darčekovej poukážky." },
        { status: 400 },
      );
    }

    const amount = treatment.amount;
    const message = `${giftVoucherPaymentConfig.notePrefix} - ${treatmentName} - od ${from} pre ${forWhom}`;

    // PAY by square payload (compatible with Slovak banking apps).
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

    const qrDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 512,
    });

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
      { status: 500 },
    );
  }
}
