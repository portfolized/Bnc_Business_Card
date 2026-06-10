import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 9,
    select: {
      id: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      tags: true,
      readTime: true,
      views: true,
      createdAt: true,
      user: { select: { name: true, username: true } },
    },
  });

  return NextResponse.json(articles);
}
