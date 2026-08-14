import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Admin resets a user's password (stores a fresh bcrypt hash).
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? "");

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } });

  return NextResponse.json({ success: true });
}
