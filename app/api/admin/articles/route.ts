import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      tags: true,
      readTime: true,
      status: true,
      published: true,
      views: true,
      createdAt: true,
      user: { select: { name: true, username: true, email: true } },
    },
  });

  return NextResponse.json(articles);
}
