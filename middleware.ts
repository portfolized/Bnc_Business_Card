import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const { pathname } = req.nextUrl;

  // Note: keep "/admin-login" OUT of the admin-guard match below, otherwise
  // `startsWith("/admin")` would redirect the login page to itself (loop).
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAdminArea) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin-login", req.nextUrl));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  // Already-signed-in admins skip the admin login screen.
  if (isLoggedIn && role === "admin" && pathname === "/admin-login") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/admin-login", "/login", "/signup"],
};
