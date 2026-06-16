import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, username: true } },
      profile: {
        select: {
          label: true,
          slug: true,
          fullName: true,
          email: true,
          phone: true,
          website: true,
          role: true,
          location: true,
          cardTemplate: true,
          frontImageUrl: true,
          backImageUrl: true,
        },
      },
    },
  });

  return NextResponse.json(orders);
}
