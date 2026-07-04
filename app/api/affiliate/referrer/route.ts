import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AFFILIATE_STATUS } from "@/lib/affiliate";

// The code to pre-fill in the checkout affiliate box: the code of whoever
// referred this buyer at signup, but only if that referrer is still an approved
// affiliate. Returns { code: null } otherwise.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referredBy: {
        select: { referralCode: true, affiliateStatus: true },
      },
    },
  });

  const ref = me?.referredBy;
  const code =
    ref && ref.affiliateStatus === AFFILIATE_STATUS.APPROVED ? ref.referralCode : null;

  return NextResponse.json({ code: code ?? null });
}
