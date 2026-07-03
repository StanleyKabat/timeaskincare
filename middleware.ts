import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Passes the current request pathname to the server via an `x-pathname` header
 * so the root layout can render the correct `<html lang>` on the server
 * (Slovak routes → `lang="sk"`, English `/en*` routes → `lang="en"`).
 *
 * This middleware only forwards the request unchanged (`NextResponse.next`)
 * with one extra request header. It performs NO redirects and NO rewrites,
 * and does not affect navigation, booking, or any URLs.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  /**
   * Run only on real page routes. Excludes API routes (incl. `/api/booking/*`),
   * Next.js internals, image optimization, and any static files with an
   * extension (images, fonts, robots.txt, sitemap.xml, etc.).
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
