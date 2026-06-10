import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 9,
    select: {
      id: true,
      html: true,
      imageUrl: true,
      createdAt: true,
      user: { select: { name: true, username: true } },
    },
  });

  return NextResponse.json(posts);
}
