import { NextResponse } from "next/server";

import { getBookingIntegrationStatus, submitReservation } from "@/lib/booking-integrations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await submitReservation(payload);

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
