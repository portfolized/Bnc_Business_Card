import { auth } from "@/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";

// Max admin-API requests allowed per IP per minute. Generous for real admin
// use, but throttles request floods / scraping / DDoS attempts.
const ADMIN_RATE_LIMIT = 120;
const ADMIN_RATE_WINDOW_MS = 60_000;

/**
 * Guard for admin-only API routes. Returns the session when the caller is an
 * admin, or a NextResponse error to return immediately otherwise.
 *
 * Also applies a per-IP rate limit (returns 429) to protect the admin surface
 * from rapid repeated requests.
 *
 *   const gate = await requireAdmin();
 *   if (gate instanceof NextResponse) return gate;
 *   // gate.user is an admin here
 */
export async function requireAdmin() {
  const ip = ipFromHeaders(await headers());
  const rl = rateLimit(`admin:${ip}`, ADMIN_RATE_LIMIT, ADMIN_RATE_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
