import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Link a template to one or many domains at once: sets `cardTemplate` on every
// owned profile in `profileIds`. Lets the same template be applied across
// multiple domains without copying their individual content.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardTemplate, profileIds } = await req.json();

  if (!cardTemplate || typeof cardTemplate !== "string") {
    return NextResponse.json({ error: "cardTemplate is required" }, { status: 400 });
  }
  if (!Array.isArray(profileIds) || profileIds.length === 0) {
    return NextResponse.json({ error: "Select at least one domain" }, { status: 400 });
  }

  const result = await prisma.profile.updateMany({
    where: { id: { in: profileIds }, userId: session.user.id },
    data: { cardTemplate },
  });

  return NextResponse.json({ count: result.count, cardTemplate });
}
