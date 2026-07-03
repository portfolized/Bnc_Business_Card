import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// The admin sets an order's payment state manually. The three states are:
//   UNPAID     — no (accepted) payment yet; the customer can pay / resubmit.
//   PROCESSING — payment submitted and under review.
//   PAID        — payment confirmed.
const VALID = ["UNPAID", "PROCESSING", "PAID"] as const;

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const { paymentStatus } = await req.json().catch(() => ({}));

  if (!VALID.includes(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: { select: { name: true, email: true, username: true } },
        profile: { select: { label: true, slug: true } },
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}
