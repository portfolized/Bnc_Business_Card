import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Aggregated stats for the logged-in user's dashboard home overview.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [cards, viewsAgg, leads, placedOrders, draftOrders, recentLeads, recentOrders] =
    await Promise.all([
      prisma.profile.count({ where: { userId } }),
      prisma.profile.aggregate({ where: { userId }, _sum: { views: true } }),
      prisma.lead.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: { not: "DRAFT" } } }),
      prisma.order.count({ where: { userId, status: "DRAFT" } }),
      prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { userId, status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, status: true, totalAmount: true, createdAt: true },
      }),
    ]);

  // Merge leads + orders into a single recent-activity feed (newest first).
  const activity = [
    ...recentLeads.map((l) => ({
      type: "lead" as const,
      id: l.id,
      title: `New lead — ${l.fullName}`,
      createdAt: l.createdAt,
    })),
    ...recentOrders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: `Order #${o.id.slice(-8).toUpperCase()} — ${o.status.charAt(0) + o.status.slice(1).toLowerCase()}`,
      amount: o.totalAmount,
      createdAt: o.createdAt,
    })),
  ]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  return NextResponse.json({
    cards,
    views: viewsAgg._sum.views ?? 0,
    leads,
    orders: placedOrders,
    draftOrders,
    activity,
  });
}
