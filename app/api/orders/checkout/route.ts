import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCardPriceNpr } from "@/lib/settings";
import { initiateKhaltiPayment, isKhaltiConfigured } from "@/lib/khalti";

// Creates (or reuses) a DRAFT order and starts a Khalti payment for it. The
// order is only "placed" (status PENDING) after payment is verified.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const unitPrice = await getCardPriceNpr();
  const origin = req.nextUrl.origin;

  let order;

  // Retry payment for an existing draft.
  if (body.orderId) {
    order = await prisma.order.findFirst({
      where: { id: body.orderId, userId: session.user.id, status: "DRAFT" },
      include: { profile: { select: { id: true, label: true, slug: true, cardTemplate: true, fullName: true } } },
    });
    if (!order) return NextResponse.json({ error: "Draft order not found" }, { status: 404 });
  } else {
    const {
      profileId = null,
      fullName = "",
      email = "",
      phone = "",
      address = "",
      website = "",
      role = "",
      cardTemplate = "",
      frontImageUrl = null,
      backImageUrl = null,
      quantity = 1,
      qrEnabled = true,
      designMode = "template",
      label,
    } = body ?? {};

    if (!fullName?.trim()) {
      return NextResponse.json({ error: "fullName is required" }, { status: 400 });
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
          // The template (layout) applies in both modes; the background images
          // follow the order's design mode (image mode keeps them, else null).
          cardTemplate: finalTemplate || profile.cardTemplate,
          frontImageUrl: finalFront,
          backImageUrl: finalBack,
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
          ...(finalTemplate ? { cardTemplate: finalTemplate } : {}),
          frontImageUrl: finalFront,
          backImageUrl: finalBack,
        },
      });
    }

    order = await prisma.order.create({
      data: {
        userId: session.user.id,
        profileId: profile.id,
        status: "DRAFT",
        paymentStatus: "UNPAID",
        qrEnabled: Boolean(qrEnabled),
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
      include: { profile: { select: { id: true, label: true, slug: true, cardTemplate: true, fullName: true } } },
    });
  }

  // Mock mode (no Khalti key): route to a built-in test payment screen so the
  // full order flow is testable locally.
  if (!isKhaltiConfigured()) {
    const mockPidx = `MOCK-${order.id}`;
    await prisma.order.update({ where: { id: order.id }, data: { pidx: mockPidx } });
    return NextResponse.json({
      payment_url: `${origin}/dashboard/orders/mock-pay?orderId=${order.id}`,
      pidx: mockPidx,
      orderId: order.id,
      mock: true,
    });
  }

  const addr = (order.shippingAddress ?? {}) as { name?: string; email?: string; phone?: string };

  try {
    const result = await initiateKhaltiPayment({
      amountNpr: order.totalAmount,
      orderId: order.id,
      orderName: `BNC Card x${order.quantity}`,
      returnUrl: `${origin}/dashboard/orders/verify`,
      websiteUrl: origin,
      customer: { name: addr.name ?? "", email: addr.email ?? "", phone: addr.phone ?? "" },
    });

    await prisma.order.update({ where: { id: order.id }, data: { pidx: result.pidx } });

    return NextResponse.json({ payment_url: result.payment_url, pidx: result.pidx, orderId: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to start payment.", orderId: order.id },
      { status: 502 }
    );
  }
}
