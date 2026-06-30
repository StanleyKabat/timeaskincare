import { NextResponse } from "next/server";

import { getBookingIntegrationStatus, submitReservation } from "@/lib/booking-integrations";
import { getRequestOrigin } from "@/lib/site-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await submitReservation(payload, getRequestOrigin(request));

    if (result.spam) {
      // Honeypot tripped: respond OK without leaking that it was filtered.
      return NextResponse.json({ ok: true, ...getBookingIntegrationStatus() });
    }

    return NextResponse.json({
      ok: true,
      eventId: result.event?.id,
      eventUrl: result.event?.htmlLink,
      ownerSms: result.sms.owner,
      customerSms: result.sms.customer,
      ...getBookingIntegrationStatus(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Rezerváciu sa nepodarilo odoslať.";
    const code =
      error instanceof Error && error.name === "SMS_FAILED"
        ? "SMS_FAILED"
        : "BOOKING_FAILED";

    return NextResponse.json(
      {
        ok: false,
        code,
        error: message,
        ...getBookingIntegrationStatus(),
      },
      { status: code === "SMS_FAILED" ? 502 : 400 },
    );
  }
}
