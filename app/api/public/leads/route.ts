import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Public lead capture from a card's profile page. The card is identified by its
// per-card `slug` (sent as `slug`, or legacy `username`). Falls back to
// resolving by User.username -> their first card for older links.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, username, fullName, email, phone, company, message, type } = body;

  const handle = (slug ?? username)?.trim();
  if (!handle) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!fullName?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "fullName and email are required" }, { status: 400 });
  }

  // Prefer a per-card slug; fall back to a user's username (legacy links).
  let profile = await prisma.profile.findUnique({ where: { slug: handle } });
  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { username: handle },
      include: { profiles: { orderBy: { createdAt: "asc" }, take: 1 } },
    });
    profile = user?.profiles?.[0] ?? null;
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const subject = `${type ?? "Contact"} from ${fullName.trim()}`;

  await prisma.lead.create({
    data: {
      userId: profile.userId,
      profileId: profile.id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? "",
      company: company?.trim() ?? "",
      subject,
      message: message?.trim() ?? "",
      type: type ?? "Contact",
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
