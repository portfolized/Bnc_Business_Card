import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// A "card" is a Profile. This endpoint lists / creates the cards a user owns,
// so the Themes, Domain and Orders pages can let the user pick which card to act on.
// Cards are uncapped; the limit applies to claimed domains (see /api/domain).

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      slug: true,
      fullName: true,
      cardTemplate: true,
      cardAccent: true,
      avatarUrl: true,
      frontImageUrl: true,
      backImageUrl: true,
      createdAt: true,
    },
  });

  // A card is a "real" NFC card once it has a placed (non-DRAFT) order; otherwise
  // it's a demo card the user can still edit. Flag each card accordingly.
  const placed = await prisma.order.findMany({
    where: { userId: session.user.id, status: { not: "DRAFT" }, profileId: { not: null } },
    select: { profileId: true },
    distinct: ["profileId"],
  });
  const orderedIds = new Set(placed.map((o) => o.profileId));

  return NextResponse.json(cards.map((c) => ({ ...c, ordered: orderedIds.has(c.id) })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { label, cardTemplate } = body ?? {};

  const card = await prisma.profile.create({
    data: {
      userId: session.user.id,
      label: typeof label === "string" && label.trim() ? label.trim() : "New Card",
      cardTemplate: typeof cardTemplate === "string" && cardTemplate ? cardTemplate : "classic",
    },
  });

  return NextResponse.json(card, { status: 201 });
}
