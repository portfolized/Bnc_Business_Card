import { prisma } from "@/lib/prisma";
import {
  CARD_PRICE_NPR,
  DEFAULT_CARD_PRICES,
  AFFILIATE_RATE,
  AFFILIATE_DISCOUNT_RATE,
  type CardPrices,
} from "@/lib/currency";

// Setting keys for each card price. `cardPriceNpr` is the Business price and is
// kept as-is for backward compatibility.
const PRICE_KEYS: Record<keyof CardPrices, string> = {
  business: "cardPriceNpr",
  vipSilver: "vipSilverPriceNpr",
  vipGold: "vipGoldPriceNpr",
  vipPlatinum: "vipPlatinumPriceNpr",
};

/** The admin-configurable Business card price in NPR (falls back to default). */
export async function getCardPriceNpr(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: PRICE_KEYS.business } });
  const n = row ? Number(row.value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : CARD_PRICE_NPR;
}

export async function setCardPriceNpr(price: number): Promise<number> {
  const prices = await setCardPrices({ business: price });
  return prices.business;
}

/** All per-type / per-tier card prices, with defaults for any unset key. */
export async function getCardPrices(): Promise<CardPrices> {
  const rows = await prisma.setting.findMany({ where: { key: { in: Object.values(PRICE_KEYS) } } });
  const byKey = new Map(rows.map((r) => [r.key, Number(r.value)]));
  const pick = (key: string, def: number) => {
    const n = byKey.get(key);
    return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : def;
  };
  return {
    business: pick(PRICE_KEYS.business, DEFAULT_CARD_PRICES.business),
    vipSilver: pick(PRICE_KEYS.vipSilver, DEFAULT_CARD_PRICES.vipSilver),
    vipGold: pick(PRICE_KEYS.vipGold, DEFAULT_CARD_PRICES.vipGold),
    vipPlatinum: pick(PRICE_KEYS.vipPlatinum, DEFAULT_CARD_PRICES.vipPlatinum),
  };
}

/** Upsert any subset of the card prices; ignores invalid/negative values. */
export async function setCardPrices(partial: Partial<CardPrices>): Promise<CardPrices> {
  const updates = (Object.entries(partial) as [keyof CardPrices, number][])
    .filter(([, v]) => Number.isFinite(v) && v >= 0)
    .map(([k, v]) => {
      const value = String(Math.max(0, Math.round(v)));
      return prisma.setting.upsert({
        where: { key: PRICE_KEYS[k] },
        create: { key: PRICE_KEYS[k], value },
        update: { value },
      });
    });
  await Promise.all(updates);
  return getCardPrices();
}

// ─── Affiliate program rates ─────────────────────────────────────────────────
// Global "all persons" rates, stored as fractions (0.10 = 10%). A per-affiliate
// override on the User row takes precedence over these (see @/lib/affiliate).

export type AffiliateRates = {
  commission: number; // paid to the affiliate
  discount: number; // taken off the buyer's total
};

const AFFILIATE_KEYS = {
  commission: "affiliateRate",
  discount: "affiliateDiscountRate",
} as const;

const clampRate = (n: number) => Math.min(1, Math.max(0, n));

/** Global affiliate commission + buyer-discount rates, with defaults for unset keys. */
export async function getAffiliateRates(): Promise<AffiliateRates> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(AFFILIATE_KEYS) } },
  });
  const byKey = new Map(rows.map((r) => [r.key, Number(r.value)]));
  const pick = (key: string, def: number) => {
    const n = byKey.get(key);
    return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1 ? n : def;
  };
  return {
    commission: pick(AFFILIATE_KEYS.commission, AFFILIATE_RATE),
    discount: pick(AFFILIATE_KEYS.discount, AFFILIATE_DISCOUNT_RATE),
  };
}

/** Upsert any subset of the global affiliate rates; ignores out-of-range values. */
export async function setAffiliateRates(partial: Partial<AffiliateRates>): Promise<AffiliateRates> {
  const updates = (Object.entries(partial) as [keyof AffiliateRates, number][])
    .filter(([, v]) => Number.isFinite(v) && v >= 0 && v <= 1)
    .map(([k, v]) => {
      const value = String(clampRate(v));
      return prisma.setting.upsert({
        where: { key: AFFILIATE_KEYS[k] },
        create: { key: AFFILIATE_KEYS[k], value },
        update: { value },
      });
    });
  await Promise.all(updates);
  return getAffiliateRates();
}
