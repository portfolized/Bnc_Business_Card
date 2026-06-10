import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, content: true, excerpt: true,
      imageUrl: true, tags: true, readTime: true, published: true, status: true,
      views: true, createdAt: true,
      user: { select: { name: true, username: true, image: true } },
    },
  });

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, excerpt, imageUrl, tags, readTime, published } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim() ?? "",
      imageUrl: imageUrl ?? null,
      tags: tags?.trim() ?? "",
      readTime: readTime?.trim() || "5 min read",
      published: published ?? false,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
