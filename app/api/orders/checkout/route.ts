import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCardPrices } from "@/lib/settings";
import { resolveCardUnitPrice, normalizeVipTier, type CardType } from "@/lib/currency";

// Places a card order with a manual payment. The customer picks one of the
// admin-defined payment methods, pays out-of-band and uploads a screenshot; the
// order is created as PENDING with paymentStatus PROCESSING for the admin to
// mark paid, leave processing, or set back to unpaid. Passing an existing
// `orderId` resubmits proof for an order that isn't paid yet.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
  const paymentProofUrl = typeof body.paymentProofUrl === "string" ? body.paymentProofUrl.trim() : "";

  if (!paymentMethod) {
    return NextResponse.json({ error: "Please choose a payment method." }, { status: 400 });
  }
  if (!paymentProofUrl) {
    return NextResponse.json({ error: "Please upload a screenshot of your payment." }, { status: 400 });
  }

  // The chosen method must be a currently active one.
  const method = await prisma.paymentMethod.findFirst({
    where: { name: paymentMethod, active: true },
  });
  if (!method) {
    return NextResponse.json({ error: "That payment method is unavailable." }, { status: 400 });
  }

  // Resubmit proof for an existing order (e.g. after a rejection).
  if (body.orderId) {
    const existing = await prisma.order.findFirst({
      where: { id: body.orderId, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (existing.paymentStatus === "PAID") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: existing.status === "DRAFT" ? "PENDING" : existing.status,
        paymentStatus: "PROCESSING",
        paymentMethod,
        paymentProofUrl,
      },
    });
    return NextResponse.json({ ok: true, orderId: updated.id });
  }

  const {
    profileId = null,
    fullName = "",
    email = "",
    phone = "",
    address = "",
    website = "",
    role = "",
    bio = "",
    cardTemplate = "",
    cardType = "BUSINESS",
    cardTier = null,
    frontImageUrl = null,
    backImageUrl = null,
    quantity = 1,
    qrEnabled = true,
    designMode = "template",
    slug = "",
    label,
  } = body ?? {};

  if (!fullName?.trim()) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  // Card type drives pricing: Business has one price, VIP has a price per tier.
  const type: CardType = cardType === "VIP" ? "VIP" : "BUSINESS";
  const tier = type === "VIP" ? normalizeVipTier(cardTier) : null;
  const unitPrice = resolveCardUnitPrice(await getCardPrices(), type, tier);

  // Optional: claim a domain (slug) for a brand-new card while ordering.
  const wantSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (wantSlug && !profileId) {
    if (wantSlug.length < 3 || wantSlug.length > 30 || !/^[a-z0-9_]+$/.test(wantSlug)) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters: letters, numbers, underscores only." },
        { status: 400 }
      );
    }
    const taken = await prisma.profile.findUnique({ where: { slug: wantSlug } });
    if (taken) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
  }

  // The template always provides the layout + text/QR overlay. The BACKGROUND
  // is either the template's own image (template mode → no custom images) or
  // the user's uploaded image(s) (image mode → keep front/back). The template
  // id is kept in both modes so the details are laid out exactly the same.
  const mode = designMode === "image" ? "image" : "template";
  const finalTemplate = cardTemplate || "";
  const finalFront = mode === "image" ? (frontImageUrl || null) : null;
  const finalBack = mode === "image" ? (backImageUrl || null) : null;

  const qty = Math.max(1, Number(quantity) || 1);

  // Attach to an existing domain/card or create a new one.
  let profile = profileId
    ? await prisma.profile.findFirst({ where: { id: profileId, userId: session.user.id } })
    : null;

  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        cardTemplate: finalTemplate || profile.cardTemplate,
        frontImageUrl: finalFront,
        backImageUrl: finalBack,
        ...(bio?.trim() ? { bio: bio.trim() } : {}),
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
        ...(bio?.trim() ? { bio: bio.trim() } : {}),
        ...(finalTemplate ? { cardTemplate: finalTemplate } : {}),
        ...(wantSlug ? { slug: wantSlug } : {}),
        frontImageUrl: finalFront,
        backImageUrl: finalBack,
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      profileId: profile.id,
      status: "PENDING",
      paymentStatus: "PROCESSING",
      paymentMethod,
      paymentProofUrl,
      qrEnabled: Boolean(qrEnabled),
      cardType: type,
      cardTier: tier,
      cardTemplate: finalTemplate,
      frontImageUrl: finalFront,
      backImageUrl: finalBack,
      quantity: qty,
      totalAmount: Number((qty * unitPrice).toFixed(2)),
      shippingAddress: {
        name: fullName.trim(),
        email: email?.trim() ?? "",
        phone: phone?.trim() ?? "",
        address: address?.trim() ?? "",
      },
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
}
