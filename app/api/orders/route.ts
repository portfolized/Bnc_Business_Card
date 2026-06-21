import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCardPrices } from "@/lib/settings";
import { resolveCardUnitPrice, normalizeVipTier, type CardType } from "@/lib/currency";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      profile: {
        select: { id: true, label: true, slug: true, cardTemplate: true, fullName: true },
      },
    },
  });

  return NextResponse.json(orders);
}

// Creating an order also creates the *card* (Profile) it is linked to, so each
// NFC card the user orders becomes its own themeable / domainable profile.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    profileId = null, // existing domain/card to attach this order to
    fullName = "",
    email = "",
    phone = "",
    address = "",
    website = "",
    role = "",
    cardTemplate = "", // physical card template id (CARD_TEMPLATES)
    cardType = "BUSINESS",
    cardTier = null,
    frontImageUrl = null,
    backImageUrl = null,
    quantity = 1,
    label,
  } = body ?? {};

  if (!fullName?.trim()) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  const type: CardType = cardType === "VIP" ? "VIP" : "BUSINESS";
  const tier = type === "VIP" ? normalizeVipTier(cardTier) : null;
  const qty = Math.max(1, Number(quantity) || 1);
  const unitPrice = resolveCardUnitPrice(await getCardPrices(), type, tier);

  // Attach to an existing domain/card if one was chosen; otherwise create a new
  // card seeded from the order details.
  let profile = profileId
    ? await prisma.profile.findFirst({ where: { id: profileId, userId: session.user.id } })
    : null;

  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        cardTemplate: cardTemplate || profile.cardTemplate,
        frontImageUrl: frontImageUrl || profile.frontImageUrl,
        backImageUrl: backImageUrl || profile.backImageUrl,
      },
    });
  } else {
    profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        label: typeof label === "string" && label.trim() ? label.trim() : `${fullName.trim()}'s Card`,
        fullName: fullName.trim(),
        email: email?.trim() ?? "",
        phone: phone?.trim() ?? "",
        website: website?.trim() ?? "",
        role: role?.trim() ?? "",
        location: address?.trim() ?? "",
        frontImageUrl: frontImageUrl || null,
        backImageUrl: backImageUrl || null,
      },
    });
  }

  // 2) Create the order linked to that card.
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      profileId: profile.id,
      cardType: type,
      cardTier: tier,
      cardTemplate: cardTemplate || "",
      frontImageUrl: frontImageUrl || null,
      backImageUrl: backImageUrl || null,
      quantity: qty,
      totalAmount: Number((qty * unitPrice).toFixed(2)),
      shippingAddress: {
        name: fullName.trim(),
        email: email?.trim() ?? "",
        phone: phone?.trim() ?? "",
        address: address?.trim() ?? "",
      },
    },
    include: {
      profile: {
        select: { id: true, label: true, slug: true, cardTemplate: true, fullName: true },
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
