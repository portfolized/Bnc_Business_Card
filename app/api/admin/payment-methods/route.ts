import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Admin CRUD for the manual payment methods shown to customers at checkout.
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const methods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const qrUrl = typeof body.qrUrl === "string" && body.qrUrl.trim() ? body.qrUrl.trim() : null;
  const description = typeof body.description === "string" ? body.description : "";
  const active = body.active === undefined ? true : Boolean(body.active);

  const method = await prisma.paymentMethod.create({
    data: { name, qrUrl, description, active },
  });
  return NextResponse.json(method, { status: 201 });
}
