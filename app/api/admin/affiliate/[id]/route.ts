import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAffiliateRates } from "@/lib/settings";
import {
  AFFILIATE_STATUS,
  effectiveCommissionRate,
  effectiveDiscountRate,
  earnedForAffiliate,
} from "@/lib/affiliate";

// Generate a referral code that isn't already taken.
async function generateReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = nanoid(8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  return nanoid(12).toUpperCase();
}

const rate01 = (v: unknown): number | null | undefined => {
  if (v === null) return null; // explicit clear → fall back to global
  if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1) return v;
  return undefined; // ignore
};

// Full detail for one affiliate: profile, credited orders (their "work"), and
// the users they referred.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      referralCode: true,
      affiliateStatus: true,
      affiliateNote: true,
      affiliateAppliedAt: true,
      affiliateApprovedAt: true,
      affiliateRate: true,
      affiliateDiscountRate: true,
      affiliatePaidNpr: true,
      createdAt: true,
      referrals: {
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [globals, orders, earned] = await Promise.all([
    getAffiliateRates(),
    prisma.order.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        discountAmount: true,
        commissionAmount: true,
        createdAt: true,
        shippingAddress: true,
      },
    }),
    earnedForAffiliate(id),
  ]);

  const paid = user.affiliatePaidNpr;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image,
    referralCode: user.referralCode,
    status: user.affiliateStatus,
    note: user.affiliateNote,
    appliedAt: user.affiliateAppliedAt,
    approvedAt: user.affiliateApprovedAt,
    joinedAt: user.createdAt,
    commissionOverride: user.affiliateRate,
    discountOverride: user.affiliateDiscountRate,
    commissionRate: effectiveCommissionRate(user.affiliateRate, globals.commission),
    discountRate: effectiveDiscountRate(user.affiliateDiscountRate, globals.discount),
    earned,
    paid,
    due: Math.max(0, earned - paid),
    referrals: user.referrals.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      joinedAt: r.createdAt,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.totalAmount,
      discount: o.discountAmount,
      commission: o.commissionAmount,
      createdAt: o.createdAt,
      customer: (o.shippingAddress as { name?: string } | null)?.name ?? "—",
    })),
  });
}

// Affiliate actions: approve / reject an application, set per-person rates, or
// record a payout.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, referralCode: true, affiliatePaidNpr: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  switch (action) {
    case "approve": {
      const code = user.referralCode ?? (await generateReferralCode());
      await prisma.user.update({
        where: { id },
        data: {
          affiliateStatus: AFFILIATE_STATUS.APPROVED,
          affiliateApprovedAt: new Date(),
          referralCode: code,
          affiliateNote: null,
        },
      });
      return NextResponse.json({ ok: true, status: AFFILIATE_STATUS.APPROVED, referralCode: code });
    }

    case "reject": {
      const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 1000) : "";
      await prisma.user.update({
        where: { id },
        data: {
          affiliateStatus: AFFILIATE_STATUS.REJECTED,
          affiliateApprovedAt: null,
          affiliateNote: reason || null,
        },
      });
      return NextResponse.json({ ok: true, status: AFFILIATE_STATUS.REJECTED });
    }

    case "setRate": {
      const commission = rate01(body?.commissionRate);
      const discount = rate01(body?.discountRate);
      if (commission === undefined && discount === undefined) {
        return NextResponse.json(
          { error: "Provide commissionRate and/or discountRate (0–1, or null to clear)." },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id },
        data: {
          ...(commission !== undefined ? { affiliateRate: commission } : {}),
          ...(discount !== undefined ? { affiliateDiscountRate: discount } : {}),
        },
      });
      const globals = await getAffiliateRates();
      const updated = await prisma.user.findUnique({
        where: { id },
        select: { affiliateRate: true, affiliateDiscountRate: true },
      });
      return NextResponse.json({
        ok: true,
        commissionOverride: updated?.affiliateRate ?? null,
        discountOverride: updated?.affiliateDiscountRate ?? null,
        commissionRate: effectiveCommissionRate(updated?.affiliateRate, globals.commission),
        discountRate: effectiveDiscountRate(updated?.affiliateDiscountRate, globals.discount),
      });
    }

    case "markPaid":
    case "pay": {
      const earned = await earnedForAffiliate(id);
      let paid: number;
      if (action === "markPaid") {
        paid = earned;
      } else if (typeof body?.amount === "number" && body.amount >= 0) {
        paid = Math.min(earned, user.affiliatePaidNpr + body.amount);
      } else {
        return NextResponse.json({ error: "Provide a numeric amount." }, { status: 400 });
      }
      await prisma.user.update({ where: { id }, data: { affiliatePaidNpr: paid } });
      return NextResponse.json({ ok: true, earned, paid, due: Math.max(0, earned - paid) });
    }

    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}
