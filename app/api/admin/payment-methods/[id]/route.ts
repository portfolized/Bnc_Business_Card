import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const data: Prisma.PaymentMethodUpdateInput = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.qrUrl === "string") data.qrUrl = body.qrUrl.trim() || null;
  else if (body.qrUrl === null) data.qrUrl = null;
  if (typeof body.description === "string") data.description = body.description;
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    data.sortOrder = Number(body.sortOrder);
  }

  try {
    const method = await prisma.paymentMethod.update({ where: { id }, data });
    return NextResponse.json(method);
  } catch {
    return NextResponse.json({ error: "Payment method not found." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  try {
    await prisma.paymentMethod.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payment method not found." }, { status: 404 });
  }
}
