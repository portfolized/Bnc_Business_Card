import { prisma } from "@/lib/prisma";
import { CARD_PRICE_NPR } from "@/lib/currency";

const CARD_PRICE_KEY = "cardPriceNpr";

/** The admin-configurable card price in NPR (falls back to the default). */
export async function getCardPriceNpr(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: CARD_PRICE_KEY } });
  const n = row ? Number(row.value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : CARD_PRICE_NPR;
}

export async function setCardPriceNpr(price: number): Promise<number> {
  const value = String(Math.max(0, Math.round(price)));
  await prisma.setting.upsert({
    where: { key: CARD_PRICE_KEY },
    create: { key: CARD_PRICE_KEY, value },
    update: { value },
  });
  return Number(value);
}
