import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const role = (token as any)?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isOperatorLogin = pathname === "/auth/login";
  const isCustomerLogin = pathname === "/customer/login";
  const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

  // 1. Unauthenticated users accessing /admin/* -> redirect to /auth/login
  if (!isAuth && isAdminRoute) {
    const from = pathname + (req.nextUrl.search || "");
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(from)}`, req.url)
    );
  }

  // 2. Customers trying to access /admin/* -> redirect to /customer/dashboard
  if (isAuth && isAdminRoute && role === "customer") {
    return NextResponse.redirect(new URL("/customer/dashboard", req.url));
  }

  // 3. Unauthenticated users accessing /customer/dashboard -> redirect to /customer/login
  if (!isAuth && isCustomerDashboard) {
    return NextResponse.redirect(new URL("/customer/login", req.url));
  }

  // 4. Authenticated operators visiting /auth/login -> redirect to /admin/booking
  if (isAuth && isOperatorLogin && role !== "customer") {
    return NextResponse.redirect(new URL("/admin/booking", req.url));
  }

  // 5. Authenticated customers visiting /customer/login -> redirect to /customer/dashboard
  if (isAuth && isCustomerLogin && role === "customer") {
    return NextResponse.redirect(new URL("/customer/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/login",
    "/customer/login",
    "/customer/dashboard/:path*",
  ],
};
