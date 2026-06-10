import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      html: true,
      imageUrl: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, username: true, email: true } },
    },
  });

  return NextResponse.json(posts);
}
