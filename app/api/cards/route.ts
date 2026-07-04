import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  getOrderedProfileIds,
  isTrialActive,
  getTrialSummary,
} from "@/lib/trial";

// A "card" is a Profile. This endpoint lists / creates the cards a user owns,
// so the Themes, Domain and Orders pages can let the user pick which card to act on.
// Free (un-ordered) cards are capped to FREE_TEMPLATE_LIMIT and only creatable
// during the signup trial window (see @/lib/trial); ordering lifts the cap.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [cards, orderedIds, user] = await Promise.all([
    prisma.profile.findMany({
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
    }),
    getOrderedProfileIds(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    }),
  ]);

  // A card is a "real" NFC card once it has a placed (non-DRAFT) order; otherwise
  // it's a free/demo template. Demo templates lock (read-only) once the trial
  // ends until an order activates them. Flag each card accordingly.
  const trialActive = user ? isTrialActive(user.createdAt) : false;

  return NextResponse.json(
    cards.map((c) => {
      const ordered = orderedIds.has(c.id);
      return { ...c, ordered, locked: !ordered && !trialActive };
    })
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gate new free templates: only during the trial and within the free limit.
  // Ordering is the path to more (it activates a card, lifting the cap).
  const summary = await getTrialSummary(session.user.id);
  if (!summary.canCreateFree) {
    return NextResponse.json({ error: summary.blockReason }, { status: 403 });
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
