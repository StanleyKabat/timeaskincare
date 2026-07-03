import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/site-url";
import { sendVoucherPdfEmails } from "@/lib/voucher";
import { verifyVoucherToken } from "@/lib/voucher-token";

export const runtime = "nodejs";

// Side effects (generating + e-mailing the PDF voucher) happen only on POST,
// triggered by an explicit click on the owner voucher page. This keeps link
// prefetchers / e-mail security scanners from sending a voucher via GET.
export async function POST(request: Request) {
  const origin = getRequestOrigin(request);
  const formData = await request.formData();
  const token = String(formData.get("token") || "");
  const voucher = verifyVoucherToken(token);

  const redirectTo = (status: string) => {
    const url = new URL("/rezervacia/poukaz", origin);
    if (voucher) {
      url.searchParams.set("token", token);
    }
    url.searchParams.set("status", status);
    return NextResponse.redirect(url, 303);
  };

  if (!voucher) {
    return redirectTo("invalid");
  }

  try {
    await sendVoucherPdfEmails(voucher);
    return redirectTo("sent");
  } catch {
    // On failure nothing is claimed as sent; Timea can safely retry from the
    // same link (the voucher code + PDF are deterministic, so a later retry
    // produces the identical voucher).
    return redirectTo("error");
  }
}
