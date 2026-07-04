import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { partitionEditableProfiles } from "@/lib/trial";

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

  // Only apply to profiles the user may currently edit; locked (expired free)
  // templates are skipped rather than silently updated.
  const { editable, locked } = await partitionEditableProfiles(
    session.user.id,
    profileIds
  );

  const result = editable.length
    ? await prisma.profile.updateMany({
        where: { id: { in: editable }, userId: session.user.id },
        data: { cardTemplate },
      })
    : { count: 0 };

  return NextResponse.json({ count: result.count, cardTemplate, skipped: locked.length });
}
