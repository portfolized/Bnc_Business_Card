import { requireAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
import { getCardPrices, setCardPrices } from "@/lib/settings";
import type { CardPrices } from "@/lib/currency";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const prices = await getCardPrices();
  return NextResponse.json({ cardPriceNpr: prices.business, prices });
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));

  // Accept either the legacy single `cardPriceNpr` (→ Business) or any subset of
  // the per-tier prices.
  const partial: Partial<CardPrices> = {};
  if (body.cardPriceNpr != null) partial.business = Number(body.cardPriceNpr);
  for (const key of ["business", "vipSilver", "vipGold", "vipPlatinum"] as (keyof CardPrices)[]) {
    if (body[key] != null) partial[key] = Number(body[key]);
  }

  if (Object.keys(partial).length === 0) {
    return NextResponse.json({ error: "No prices provided." }, { status: 400 });
  }
  for (const value of Object.values(partial)) {
    if (!Number.isFinite(value) || (value as number) < 0) {
      return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
    }
  }

  const prices = await setCardPrices(partial);
  return NextResponse.json({ cardPriceNpr: prices.business, prices });
}
