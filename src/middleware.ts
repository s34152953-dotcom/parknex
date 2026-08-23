import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback_nextauth_secret_parknex_2026";

  // Robust token retrieval checking default, secure, and non-secure cookie formats
  let token = null;
  try {
    token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, secureCookie: true });
    }
    if (!token) {
      token = await getToken({ req, secret, secureCookie: false });
    }
  } catch (err) {
    console.warn("[Middleware Token Warning]:", err);
    token = null;
  }

  const isAuth = !!token;
  const role = (token as any)?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isOperatorLogin = pathname === "/auth/login";
  const isCustomerLogin = pathname === "/customer/login";
  const isCustomerDashboard = pathname.startsWith("/customer/dashboard");

  const makeRedirect = (url: URL) => {
    const res = NextResponse.redirect(url);
    res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res;
  };

  // 1. Unauthenticated users accessing /admin/* -> redirect to /auth/login
  if (!isAuth && isAdminRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname + (search || ""));
    return makeRedirect(url);
  }

  // 2. Customers trying to access /admin/* -> redirect to /customer/dashboard
  if (isAuth && isAdminRoute && role === "customer") {
    const url = req.nextUrl.clone();
    url.pathname = "/customer/dashboard";
    url.search = "";
    return makeRedirect(url);
  }

  // 3. Unauthenticated users accessing /customer/dashboard -> redirect to /customer/login
  if (!isAuth && isCustomerDashboard) {
    const url = req.nextUrl.clone();
    url.pathname = "/customer/login";
    url.search = "";
    return makeRedirect(url);
  }

  // 4. Authenticated operators visiting /auth/login -> redirect to /admin
  if (isAuth && isOperatorLogin && role !== "customer") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return makeRedirect(url);
  }

  // 5. Authenticated customers visiting /customer/login -> redirect to /customer/dashboard
  if (isAuth && isCustomerLogin && role === "customer") {
    const url = req.nextUrl.clone();
    url.pathname = "/customer/dashboard";
    url.search = "";
    return makeRedirect(url);
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

