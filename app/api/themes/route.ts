import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canEditProfile } from "@/lib/trial";

// Resolve which card (Profile) to act on. If a profileId is supplied and owned
// by the user, use it; otherwise fall back to the user's first card (creating
// one if they have none yet).
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

  return NextResponse.json({
    id: profile.id,
    label: profile.label,
    slug: profile.slug ?? "",
    fullName: profile.fullName,
    role: profile.role,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    location: profile.location,
    avatarUrl: profile.avatarUrl ?? "",
    coverUrl: profile.coverUrl ?? "",
    accent: profile.cardAccent,
    cardTemplate: profile.cardTemplate,
    headline: profile.headline,
    skills: profile.skills,
    greeting: profile.greeting,
    ctaPrimary: profile.ctaPrimary,
    ctaSecondary: profile.ctaSecondary,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    profileId,
    fullName,
    role,
    bio,
    email,
    phone,
    website,
    location,
    avatarUrl,
    coverUrl,
    accent,
    cardTemplate,
    headline,
    skills,
    greeting,
    ctaPrimary,
    ctaSecondary,
  } = body;

  const profile = await resolveProfile(session.user.id, profileId);

  // Locked (expired free) templates are read-only until an order activates them.
  const edit = await canEditProfile(session.user.id, profile.id);
  if (!edit.ok) {
    return NextResponse.json({ error: edit.reason }, { status: 403 });
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      fullName: fullName ?? profile.fullName,
      role: role ?? profile.role,
      bio: bio ?? profile.bio,
      email: email ?? profile.email,
      phone: phone ?? profile.phone,
      website: website ?? profile.website,
      location: location ?? profile.location,
      avatarUrl: avatarUrl !== undefined ? avatarUrl || null : profile.avatarUrl,
      coverUrl: coverUrl !== undefined ? coverUrl || null : profile.coverUrl,
      cardAccent: accent ?? profile.cardAccent,
      cardTemplate: cardTemplate ?? profile.cardTemplate,
      headline: headline !== undefined ? headline : profile.headline,
      skills: skills !== undefined ? skills : profile.skills,
      greeting: greeting !== undefined ? greeting : profile.greeting,
      ctaPrimary: ctaPrimary !== undefined ? ctaPrimary : profile.ctaPrimary,
      ctaSecondary: ctaSecondary !== undefined ? ctaSecondary : profile.ctaSecondary,
    },
  });

  return NextResponse.json({ success: true, id: updated.id, cardTemplate: updated.cardTemplate });
}
