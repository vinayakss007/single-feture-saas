/**
 * Works out the public origin of the current request.
 *
 * Needed because payment redirect URLs and email links have to be absolute, and
 * the same build runs on localhost, on a Vercel preview URL and on the custom
 * domain. Precedence is explicit config, then the proxy headers, then the
 * request URL — config wins so that a misconfigured proxy cannot rewrite the
 * links inside password-reset emails.
 */
export function originOf(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return new URL(req.url).origin;
}
