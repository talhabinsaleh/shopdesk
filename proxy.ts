import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Quick cookie check only. The private layouts verify the real session on the server.
export function proxy(request: NextRequest) {
  const page = request.nextUrl.pathname + request.nextUrl.search;
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", page);
    return NextResponse.redirect(url);
  }
  const headers = new Headers(request.headers);
  headers.set("x-return-to", page);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/manage/:path*"],
};
