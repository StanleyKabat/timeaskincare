import { NextResponse } from "next/server";

import {
  BookingTimeMismatchError,
  confirmReservation,
  declineReservation,
} from "@/lib/booking-integrations";
import { verifyBookingToken } from "@/lib/booking-token";
import { getRequestOrigin } from "@/lib/site-url";

export const runtime = "nodejs";

// Side effects (sending e-mails) happen only on POST, triggered by an explicit
// click on the management page. This keeps link prefetchers / e-mail security
// scanners from accidentally confirming a reservation via a GET request.
export async function POST(request: Request) {
  const origin = getRequestOrigin(request);
  const formData = await request.formData();
  const token = String(formData.get("token") || "");
  const action = String(formData.get("action") || "");

  const booking = verifyBookingToken(token);

  const redirectTo = (status: string) => {
    const url = new URL("/rezervacia/sprava", origin);
    if (booking) {
      url.searchParams.set("token", token);
    }
    url.searchParams.set("status", status);
    return NextResponse.redirect(url, 303);
  };

  if (!booking) {
    return redirectTo("invalid");
  }

  try {
    if (action === "confirm") {
      await confirmReservation(booking);
      return redirectTo("confirmed");
    }

    if (action === "decline") {
      await declineReservation(booking);
      return redirectTo("declined");
    }

    return redirectTo("invalid");
  } catch (error) {
    if (error instanceof BookingTimeMismatchError) {
      return redirectTo("time-mismatch");
    }
    return redirectTo("error");
  }
}
