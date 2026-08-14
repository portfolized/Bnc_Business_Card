import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

// Toggle a post between PUBLIC (landing page) and PRIVATE (profile only).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { visibility } = await req.json();
  if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
    return NextResponse.json({ error: "visibility must be 'PUBLIC' or 'PRIVATE'" }, { status: 400 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { visibility },
    select: { id: true, visibility: true },
  });

  return NextResponse.json(updated);
}
