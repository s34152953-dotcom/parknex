import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const role = (token as any)?.role;
    const pathname = req.nextUrl.pathname;

    const isAdminRoute = pathname.startsWith("/admin");
    const isOperatorLogin = pathname === "/auth/login";
    const isCustomerLogin = pathname === "/customer/login";
    const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

    // Redirect authenticated operators away from login
    if (isAuth && isOperatorLogin && role !== "customer") {
      return NextResponse.redirect(new URL("/admin/booking", req.url));
    }

    // Redirect authenticated customers away from customer login
    if (isAuth && isCustomerLogin) {
      return NextResponse.redirect(new URL("/customer/dashboard", req.url));
    }

    // Block unauthenticated access to admin routes
    if (!isAuth && isAdminRoute) {
      const from = pathname + (req.nextUrl.search || "");
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Block customers from accessing admin routes
    if (isAuth && isAdminRoute && role === "customer") {
      return NextResponse.redirect(new URL("/customer/dashboard", req.url));
    }

    // Block unauthenticated from customer dashboard
    if (!isAuth && isCustomerDashboard) {
      return NextResponse.redirect(new URL("/customer/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always let middleware function run the logic above
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/login",
    "/customer/login",
    "/customer/dashboard/:path*",
  ],
};
