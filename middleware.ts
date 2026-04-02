import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) {
    return NextResponse.next();
  }

  const url = new URL("/", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/reports/:path*"],
};
