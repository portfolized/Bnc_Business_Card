import { NextResponse } from "next/server";
import { getCardPrices } from "@/lib/settings";

// Public, read-only app settings (e.g. card prices) used by client pages.
export async function GET() {
  const prices = await getCardPrices();
  // `cardPriceNpr` (Business price) is kept for backward compatibility.
  return NextResponse.json({ cardPriceNpr: prices.business, prices });
}
