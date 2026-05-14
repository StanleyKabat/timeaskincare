import { NextResponse } from "next/server";

import { getBookingIntegrationStatus, getAvailableSlotsFromCalendar } from "@/lib/booking-integrations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const duration = Number(searchParams.get("duration") || "0");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(duration)) {
    return NextResponse.json(
      { error: "Chýba dátum alebo trvanie služby." },
      { status: 400 },
    );
  }

  try {
    const slots = await getAvailableSlotsFromCalendar(date, duration);
    return NextResponse.json({
      slots,
      ...getBookingIntegrationStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nepodarilo sa načítať dostupné časy.",
      },
      { status: 500 },
    );
  }
}
