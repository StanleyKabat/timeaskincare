import { NextResponse } from "next/server";

import {
  CalendarUnavailableError,
  getAvailableSlotsFromCalendar,
  getBookingIntegrationStatus,
} from "@/lib/booking-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const duration = Number(searchParams.get("duration") || "0");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(duration)) {
    return NextResponse.json(
      { error: "Chýba dátum alebo trvanie služby." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const slots = await getAvailableSlotsFromCalendar(date, duration);
    return NextResponse.json(
      {
        slots,
        calendarUnavailable: false,
        ...getBookingIntegrationStatus(),
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const calendarUnavailable = error instanceof CalendarUnavailableError;
    return NextResponse.json(
      {
        slots: [],
        calendarUnavailable,
        error: calendarUnavailable
          ? "Dostupnosť termínov sa momentálne nedá načítať."
          : error instanceof Error
            ? error.message
            : "Nepodarilo sa načítať dostupné časy.",
        ...getBookingIntegrationStatus(),
      },
      {
        status: calendarUnavailable ? 503 : 500,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
