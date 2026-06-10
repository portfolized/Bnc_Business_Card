import { NextResponse } from "next/server";
import { getCardPriceNpr } from "@/lib/settings";

// Public, read-only app settings (e.g. card price) used by client pages.
export async function GET() {
  const cardPriceNpr = await getCardPriceNpr();
  return NextResponse.json({ cardPriceNpr });
}
