import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Moderate an article. action "approve" makes it public; "reject" hides it.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { id } = await ctx.params;
  const { action } = await req.json();

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const updated = await prisma.article.update({
    where: { id },
    data:
      action === "approve"
        ? { status: "APPROVED", published: true }
        : { status: "REJECTED", published: false },
    select: { id: true, status: true, published: true },
  });

  return NextResponse.json(updated);
}
