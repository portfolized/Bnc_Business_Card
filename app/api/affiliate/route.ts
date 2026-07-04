import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAffiliateRates } from "@/lib/settings";
import {
  AFFILIATE_STATUS,
  effectiveCommissionRate,
  effectiveDiscountRate,
  earnedForAffiliate,
} from "@/lib/affiliate";

// The signed-in user's affiliate standing. Codes only exist once APPROVED, so
// the dashboard shows an apply form / pending / rejected state until then.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      affiliateStatus: true,
      affiliateNote: true,
      affiliateRate: true,
      affiliateDiscountRate: true,
      affiliatePaidNpr: true,
      referrals: { select: { id: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = user.affiliateStatus ?? AFFILIATE_STATUS.NONE;

  // Not an active affiliate yet — return just enough for the apply/pending UI.
  if (status !== AFFILIATE_STATUS.APPROVED) {
    return NextResponse.json({
      status,
      note: user.affiliateNote ?? null,
      code: null,
    });
  }

  const globals = await getAffiliateRates();
  const commissionRate = effectiveCommissionRate(user.affiliateRate, globals.commission);
  const discountRate = effectiveDiscountRate(user.affiliateDiscountRate, globals.discount);

  const [earned, credited] = await Promise.all([
    earnedForAffiliate(session.user.id),
    prisma.order.findMany({
      where: { affiliateId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        discountAmount: true,
        commissionAmount: true,
        createdAt: true,
        shippingAddress: true,
      },
    }),
  ]);

  const paid = user.affiliatePaidNpr;

  return NextResponse.json({
    status,
    code: user.referralCode,
    commissionRate,
    discountRate,
    referralCount: user.referrals.length,
    orderCount: credited.length,
    earned,
    paid,
    due: Math.max(0, earned - paid),
    orders: credited.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.totalAmount,
      discount: o.discountAmount,
      commission: o.commissionAmount,
      createdAt: o.createdAt,
      customer:
        (o.shippingAddress as { name?: string } | null)?.name ?? "—",
    })),
  });
}

// Apply to become an affiliate. Moves NONE/REJECTED → PENDING for admin review.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : "";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { affiliateStatus: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = user.affiliateStatus ?? AFFILIATE_STATUS.NONE;
  if (status === AFFILIATE_STATUS.APPROVED) {
    return NextResponse.json({ error: "You're already an affiliate." }, { status: 409 });
  }
  if (status === AFFILIATE_STATUS.PENDING) {
    return NextResponse.json({ error: "Your application is already under review." }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      affiliateStatus: AFFILIATE_STATUS.PENDING,
      affiliateAppliedAt: new Date(),
      affiliateNote: note || null,
    },
  });

  return NextResponse.json({ status: AFFILIATE_STATUS.PENDING });
}
