import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap gate on /dashboard: if there is no session cookie at all, send the
 * visitor to /login instead of rendering a page that will only tell them to sign
 * in.
 *
 * Presence of a cookie is *not* proof of a valid session and is not treated as
 * such. Middleware runs on the edge where there is no database connection, so the
 * real check stays in the page itself via `currentUser()`. This only removes an
 * obviously pointless round trip.
 */
export function middleware(req: NextRequest) {
  const hasCookie = req.cookies.has("sfs_session");
  if (hasCookie) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard"],
};
