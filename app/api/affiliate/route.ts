import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { AFFILIATE_RATE } from "@/lib/currency";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          orders: { select: { totalAmount: true, status: true } },
        },
      },
    },
  });

  // Generate code if not present
  let code = user?.referralCode;
  if (!code) {
    code = nanoid(8).toUpperCase();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: code },
    });
  }

  const referrals = user?.referrals ?? [];
  const totalEarnings = referrals.reduce((sum, r) => {
    const completed = r.orders.filter((o) => o.status === "DELIVERED");
    return sum + completed.reduce((s, o) => s + o.totalAmount * AFFILIATE_RATE, 0);
  }, 0);

  return NextResponse.json({
    code,
    referralCount: referrals.length,
    totalEarnings,
    referrals: referrals.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      joinedAt: r.createdAt,
      orders: r.orders.length,
    })),
  });
}
