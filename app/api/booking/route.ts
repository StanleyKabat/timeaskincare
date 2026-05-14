import { NextResponse } from "next/server";

import { createCalendarBooking, getBookingIntegrationStatus } from "@/lib/booking-integrations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await createCalendarBooking(payload);

    return NextResponse.json({
      ok: true,
      eventId: result.event.id,
      eventUrl: result.event.htmlLink,
      ...getBookingIntegrationStatus(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Rezerváciu sa nepodarilo odoslať.";
    const code =
      error instanceof Error && error.name === "CALENDAR_NOT_CONFIGURED"
        ? "CALENDAR_NOT_CONFIGURED"
        : "BOOKING_FAILED";

    return NextResponse.json(
      {
        ok: false,
        code,
        error: message,
        ...getBookingIntegrationStatus(),
      },
      { status: code === "CALENDAR_NOT_CONFIGURED" ? 503 : 400 },
    );
  }
}
