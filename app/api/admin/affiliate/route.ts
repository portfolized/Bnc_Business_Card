import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AFFILIATE_RATE } from "@/lib/currency";

// Earned commission = AFFILIATE_RATE of every referred user's DELIVERED orders.
export function earnedFor(
  referrals: { orders: { totalAmount: number; status: string }[] }[]
): number {
  return referrals.reduce(
    (sum, r) =>
      sum +
      r.orders
        .filter((o) => o.status === "DELIVERED")
        .reduce((s, o) => s + o.totalAmount * AFFILIATE_RATE, 0),
    0
  );
}

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const users = await prisma.user.findMany({
    where: { referrals: { some: {} } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      referralCode: true,
      affiliatePaidNpr: true,
      referrals: { select: { orders: { select: { totalAmount: true, status: true } } } },
    },
  });

  const rows = users.map((u) => {
    const earned = earnedFor(u.referrals);
    const paid = u.affiliatePaidNpr;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      referralCode: u.referralCode,
      referralCount: u.referrals.length,
      earned,
      paid,
      due: Math.max(0, earned - paid),
    };
  });

  return NextResponse.json(rows);
}
