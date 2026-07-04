import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAffiliateRates } from "@/lib/settings";
import {
  AFFILIATE_STATUS,
  effectiveCommissionRate,
  effectiveDiscountRate,
} from "@/lib/affiliate";

// Live check for the affiliate-code box at checkout: is this an approved
// affiliate's code, and what buyer discount does it carry? The final amounts are
// recomputed server-side at checkout (see /api/orders/checkout) — this is just
// for the preview.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false });

  const affiliate = await prisma.user.findUnique({
    where: { referralCode: code },
    select: {
      id: true,
      name: true,
      username: true,
      affiliateStatus: true,
      affiliateRate: true,
      affiliateDiscountRate: true,
    },
  });

  if (!affiliate || affiliate.affiliateStatus !== AFFILIATE_STATUS.APPROVED) {
    return NextResponse.json({ valid: false, reason: "unknown" });
  }
  if (affiliate.id === session.user.id) {
    return NextResponse.json({ valid: false, reason: "self" });
  }

  const globals = await getAffiliateRates();
  return NextResponse.json({
    valid: true,
    discountRate: effectiveDiscountRate(affiliate.affiliateDiscountRate, globals.discount),
    commissionRate: effectiveCommissionRate(affiliate.affiliateRate, globals.commission),
    affiliateName: affiliate.name ?? affiliate.username ?? "an affiliate",
  });
}
