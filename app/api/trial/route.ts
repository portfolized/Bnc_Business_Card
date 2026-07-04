import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getTrialSummary } from "@/lib/trial";

// Free-template trial status for the signed-in user: countdown window, how many
// free templates are left, and whether a new one can be created right now.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getTrialSummary(session.user.id);
  return NextResponse.json(summary);
}
