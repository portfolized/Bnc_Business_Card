import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Live availability check for a domain slug, used by the dashboard to show
// "available / taken / invalid" as the user types — before they commit with a
// save. Mirrors the validation rules in PUT /api/domain.
//
// Returns: { available: boolean, reason?: "invalid" | "taken" | "own" }
//   - reason "own"  → the slug already belongs to the card being edited.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawSlug = req.nextUrl.searchParams.get("slug") ?? "";
  const profileId = req.nextUrl.searchParams.get("profileId");
  const slug = rawSlug.trim().toLowerCase();

  if (slug.length < 3 || slug.length > 30 || !/^[a-z0-9_]+$/.test(slug)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.profile.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    if (profileId && existing.id === profileId) {
      return NextResponse.json({ available: true, reason: "own" });
    }
    return NextResponse.json({ available: false, reason: "taken" });
  }

  return NextResponse.json({ available: true });
}
