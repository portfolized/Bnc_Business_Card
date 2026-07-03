import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Approve or reject a submitted manual payment. Approving marks it PAID;
// rejecting marks it REJECTED so the customer can resubmit a new screenshot.
const VALID = ["PAID", "REJECTED"] as const;

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
