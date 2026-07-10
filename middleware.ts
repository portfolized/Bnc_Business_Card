import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

// Build a dedicated, edge-safe auth instance from the lightweight config so the
// middleware bundle never pulls in Prisma/bcrypt (which blew the Edge Function
// past Vercel's 1 MB limit). The full `@/auth` stays for Node-runtime routes.
const { auth } = NextAuth(authConfig);

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

  // Admins use the admin console, not the user dashboard.
  if (isLoggedIn && role === "admin" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const dest = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/admin-login", "/login", "/signup"],
};
