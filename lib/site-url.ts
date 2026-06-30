const FALLBACK_SITE_URL = "https://timeaskincare.sk";

function normalize(url: string) {
  return url.replace(/\/+$/, "");
}

/** Best-effort absolute site origin for building e-mail links. */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalize(process.env.NEXT_PUBLIC_SITE_URL);
  }

  return FALLBACK_SITE_URL;
}

/** Resolves the request origin, preferring proxy headers (Vercel) then config. */
export function getRequestOrigin(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalize(process.env.NEXT_PUBLIC_SITE_URL);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host) {
    return `${proto}://${host}`;
  }

  try {
    return normalize(new URL(request.url).origin);
  } catch {
    return FALLBACK_SITE_URL;
  }
}
