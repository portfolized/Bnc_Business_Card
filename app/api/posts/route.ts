import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      html: true,
      imageUrl: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, username: true, image: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { html, imageUrl } = await req.json();

  if (!html?.trim()) {
    return NextResponse.json({ error: "html is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { userId: session.user.id, html: html.trim(), imageUrl: imageUrl ?? null },
    select: {
      id: true,
      html: true,
      imageUrl: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, username: true, image: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
