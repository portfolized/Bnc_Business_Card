import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { earnedFor } from "../route";

// Record an affiliate payout. `action: "markPaid"` settles the full balance;
// otherwise an explicit `amount` (NPR) is added to what's already been paid.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      affiliatePaidNpr: true,
      referrals: { select: { orders: { select: { totalAmount: true, status: true } } } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const earned = earnedFor(user.referrals);

  let paid: number;
  if (body?.action === "markPaid") {
    paid = earned;
  } else if (typeof body?.amount === "number" && body.amount >= 0) {
    paid = Math.min(earned, user.affiliatePaidNpr + body.amount);
  } else {
    return NextResponse.json({ error: "Provide action: 'markPaid' or a numeric amount" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { affiliatePaidNpr: paid } });

  return NextResponse.json({ id, earned, paid, due: Math.max(0, earned - paid) });
}
