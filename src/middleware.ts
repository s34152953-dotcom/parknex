import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("parknex_admin_session");

    // In production or when strictly enforcing, check session cookie
    // Allow demo query or session cookie
    const hasDemoBypass = request.nextUrl.searchParams.get("demo") === "true";

    if (!sessionCookie && !hasDemoBypass && process.env.STRICT_ADMIN_AUTH === "true") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
