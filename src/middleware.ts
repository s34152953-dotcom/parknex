import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/login");

    // Redirect already-authenticated users away from login page
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/admin/booking", req.url));
    }

    // Block unauthenticated access to all /admin/* routes
    if (!isAuth && isAdminRoute) {
      const from = req.nextUrl.pathname + (req.nextUrl.search || "");
      return NextResponse.redirect(
        new URL(`/auth/login?redirect=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Ensure customer tokens cannot access admin routes
    if (isAuth && isAdminRoute) {
      const role = (token as any)?.role;
      if (!role || (role !== "admin" && role !== "mall_admin" && role !== "operator")) {
        return NextResponse.redirect(new URL("/auth/login?error=Unauthorized", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        if (isAdminRoute) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};
