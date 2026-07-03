import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/site-url";
import { sendVoucherRequestEmails, validateVoucherRequest } from "@/lib/voucher";

export const runtime = "nodejs";

/**
 * Step 1 of the gift-voucher flow: the customer clicked "I have sent the
 * payment". Validates the request, derives the amount from the canonical
 * treatment server-side, then e-mails the customer (request received) and the
 * owner (secure confirm-and-send link). No PDF is sent yet — that happens only
 * after Timea confirms the bank payment.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot: bots that fill the hidden "company" field get a silent success.
    if (typeof body.company === "string" && body.company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const voucher = validateVoucherRequest(body);
    const origin = getRequestOrigin(request);
    const { code } = await sendVoucherRequestEmails(voucher, origin);

    return NextResponse.json({ ok: true, code });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Objednávku sa nepodarilo odoslať.",
      },
      { status: 400 },
    );
  }
}
