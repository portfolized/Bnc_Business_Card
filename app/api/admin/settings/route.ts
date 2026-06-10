import { requireAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import { getCardPriceNpr, setCardPriceNpr } from "@/lib/settings";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  return NextResponse.json({ cardPriceNpr: await getCardPriceNpr() });
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const { cardPriceNpr } = await req.json();
  const price = Number(cardPriceNpr);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }

  const saved = await setCardPriceNpr(price);
  return NextResponse.json({ cardPriceNpr: saved });
}
