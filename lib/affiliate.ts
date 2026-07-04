import { prisma } from "@/lib/prisma";
import { getAffiliateRates } from "@/lib/settings";

// ─── Affiliate program ───────────────────────────────────────────────────────
//
// Users must APPLY and be APPROVED by an admin before they receive a referral
// code. A buyer can enter that code at checkout: the order is then credited to
// the affiliate (commission) and the buyer may get a discount. Both rates come
// from the admin — a global "all persons" default, optionally overridden per
// affiliate. The resulting discount/commission are locked onto the Order as
// amounts, so later rate changes never rewrite past orders.

export const AFFILIATE_STATUS = {
  NONE: "NONE",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type AffiliateStatus = (typeof AFFILIATE_STATUS)[keyof typeof AFFILIATE_STATUS];

// Commission is earned once an order reaches this status.
export const COMMISSION_EARNED_STATUS = "DELIVERED";

/** Effective commission rate for an affiliate: their override, else the global. */
export function effectiveCommissionRate(
  affiliateRate: number | null | undefined,
  globalCommission: number
): number {
  return typeof affiliateRate === "number" ? affiliateRate : globalCommission;
}

/** Effective buyer-discount rate for an affiliate: their override, else the global. */
export function effectiveDiscountRate(
  affiliateDiscountRate: number | null | undefined,
  globalDiscount: number
): number {
  return typeof affiliateDiscountRate === "number" ? affiliateDiscountRate : globalDiscount;
}

export type AffiliateQuote = {
  affiliateId: string;
  affiliateCode: string;
  discountRate: number;
  commissionRate: number;
  discountAmount: number; // NPR off the buyer's subtotal
  commissionAmount: number; // NPR owed to the affiliate (on what the buyer pays)
  total: number; // subtotal − discount
};

/**
 * Resolve an affiliate code entered at checkout into a discount + commission
 * quote for the given subtotal (NPR). Returns null when the code is empty,
 * unknown, not an approved affiliate, or belongs to the buyer themselves.
 */
export async function quoteAffiliate(
  rawCode: string | null | undefined,
  subtotal: number,
  buyerUserId: string
): Promise<AffiliateQuote | null> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return null;

  const affiliate = await prisma.user.findUnique({
    where: { referralCode: code },
    select: {
      id: true,
      referralCode: true,
      affiliateStatus: true,
      affiliateRate: true,
      affiliateDiscountRate: true,
    },
  });

  if (!affiliate || affiliate.affiliateStatus !== AFFILIATE_STATUS.APPROVED) return null;
  // No self-referral.
  if (affiliate.id === buyerUserId) return null;

  const globals = await getAffiliateRates();
  const discountRate = effectiveDiscountRate(affiliate.affiliateDiscountRate, globals.discount);
  const commissionRate = effectiveCommissionRate(affiliate.affiliateRate, globals.commission);

  const safeSubtotal = Math.max(0, subtotal);
  const discountAmount = Math.round(safeSubtotal * discountRate);
  const total = Math.max(0, safeSubtotal - discountAmount);
  const commissionAmount = Math.round(total * commissionRate);

  return {
    affiliateId: affiliate.id,
    affiliateCode: affiliate.referralCode!,
    discountRate,
    commissionRate,
    discountAmount,
    total,
    commissionAmount,
  };
}

/**
 * Total commission an affiliate has earned so far: the sum of commissionAmount
 * over the orders credited to them that have reached the earned status.
 */
export async function earnedForAffiliate(affiliateId: string): Promise<number> {
  const agg = await prisma.order.aggregate({
    where: { affiliateId, status: COMMISSION_EARNED_STATUS },
    _sum: { commissionAmount: true },
  });
  return agg._sum.commissionAmount ?? 0;
}
