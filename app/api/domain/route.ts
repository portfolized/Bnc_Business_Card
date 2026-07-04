import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canEditProfile } from "@/lib/trial";

// Cards are uncapped, but a user may only claim this many domains (slugs).
export const MAX_DOMAINS_PER_USER = 10;

async function resolveProfile(userId: string, profileId?: string | null) {
  if (profileId) {
    const owned = await prisma.profile.findFirst({ where: { id: profileId, userId } });
    if (owned) return owned;
  }
  const first = await prisma.profile.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (first) return first;
  return prisma.profile.create({ data: { userId } });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = req.nextUrl.searchParams.get("profileId");
  const profile = await resolveProfile(session.user.id, profileId);

  return NextResponse.json({ profileId: profile.id, slug: profile.slug ?? "" });
}

// Per-card domain: sets the unique `slug` on the chosen Profile. The public page
// at /profile/<slug> resolves cards by this value.
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profileId, slug: rawSlug } = await req.json();

  if (!rawSlug || typeof rawSlug !== "string") {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const slug = rawSlug.trim().toLowerCase();

  if (slug.length < 3 || slug.length > 30) {
    return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
  }

  if (!/^[a-z0-9_]+$/.test(slug)) {
    return NextResponse.json({ error: "Only letters, numbers, and underscores allowed" }, { status: 400 });
  }

  const profile = await resolveProfile(session.user.id, profileId);

  // A locked (expired free) template can't claim or change its domain until an
  // order activates it.
  const edit = await canEditProfile(session.user.id, profile.id);
  if (!edit.ok) {
    return NextResponse.json({ error: edit.reason }, { status: 403 });
  }

  const existing = await prisma.profile.findUnique({ where: { slug } });
  if (existing && existing.id !== profile.id) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
  }

  // Enforce the domain cap, but only when this card is claiming a NEW domain
  // (it didn't already have one). Renaming an existing domain is always allowed.
  if (!profile.slug) {
    const claimed = await prisma.profile.count({
      where: { userId: session.user.id, slug: { not: null } },
    });
    if (claimed >= MAX_DOMAINS_PER_USER) {
      return NextResponse.json(
        { error: `You can claim at most ${MAX_DOMAINS_PER_USER} domains. Free one up first.` },
        { status: 400 }
      );
    }
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { slug },
  });

  return NextResponse.json({ profileId: profile.id, slug });
}
