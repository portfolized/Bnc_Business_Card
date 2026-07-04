import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAffiliateRates, setAffiliateRates } from "@/lib/settings";
import {
  AFFILIATE_STATUS,
  COMMISSION_EARNED_STATUS,
  effectiveCommissionRate,
  effectiveDiscountRate,
} from "@/lib/affiliate";

// Admin affiliate console data: global rates, pending applications, and the
// approved affiliates with their earnings.
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const [globals, users] = await Promise.all([
    getAffiliateRates(),
    prisma.user.findMany({
      where: { affiliateStatus: { in: [AFFILIATE_STATUS.PENDING, AFFILIATE_STATUS.APPROVED] } },
      orderBy: { affiliateAppliedAt: "asc" },
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
        referrals: { select: { id: true } },
      },
    }),
  ]);

  const approvedIds = users
    .filter((u) => u.affiliateStatus === AFFILIATE_STATUS.APPROVED)
    .map((u) => u.id);

  // Earned (from delivered credited orders) and total credited-order counts.
  const [earnedRows, countRows] = await Promise.all([
    approvedIds.length
      ? prisma.order.groupBy({
          by: ["affiliateId"],
          where: { affiliateId: { in: approvedIds }, status: COMMISSION_EARNED_STATUS },
          _sum: { commissionAmount: true },
        })
      : Promise.resolve([] as { affiliateId: string | null; _sum: { commissionAmount: number | null } }[]),
    approvedIds.length
      ? prisma.order.groupBy({
          by: ["affiliateId"],
          where: { affiliateId: { in: approvedIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as { affiliateId: string | null; _count: { _all: number } }[]),
  ]);

  const earnedByAff = new Map(earnedRows.map((r) => [r.affiliateId, r._sum.commissionAmount ?? 0]));
  const countByAff = new Map(countRows.map((r) => [r.affiliateId, r._count._all]));

  const applications = users
    .filter((u) => u.affiliateStatus === AFFILIATE_STATUS.PENDING)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      image: u.image,
      note: u.affiliateNote,
      appliedAt: u.affiliateAppliedAt,
      joinedAt: u.createdAt,
    }));

  const affiliates = users
    .filter((u) => u.affiliateStatus === AFFILIATE_STATUS.APPROVED)
    .map((u) => {
      const earned = earnedByAff.get(u.id) ?? 0;
      const paid = u.affiliatePaidNpr;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        image: u.image,
        referralCode: u.referralCode,
        approvedAt: u.affiliateApprovedAt,
        // null override → uses the global rate; expose both so the admin can tell.
        commissionOverride: u.affiliateRate,
        discountOverride: u.affiliateDiscountRate,
        commissionRate: effectiveCommissionRate(u.affiliateRate, globals.commission),
        discountRate: effectiveDiscountRate(u.affiliateDiscountRate, globals.discount),
        referralCount: u.referrals.length,
        orderCount: countByAff.get(u.id) ?? 0,
        earned,
        paid,
        due: Math.max(0, earned - paid),
      };
    });

  return NextResponse.json({ globals, applications, affiliates });
}

// Update the global "all persons" commission / discount rates (fractions 0–1).
export async function PUT(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const partial: { commission?: number; discount?: number } = {};
  if (typeof body?.commission === "number") partial.commission = body.commission;
  if (typeof body?.discount === "number") partial.discount = body.discount;

  if (partial.commission === undefined && partial.discount === undefined) {
    return NextResponse.json({ error: "Provide commission and/or discount (0–1)." }, { status: 400 });
  }

  const globals = await setAffiliateRates(partial);
  return NextResponse.json({ globals });
}
