// Central money helpers. The app prices and pays out in Nepali Rupees (NPR).

/** Price of one NFC card, in NPR. */
export const CARD_PRICE_NPR = 1500;

/** Affiliate commission rate on a referred user's delivered orders. */
export const AFFILIATE_RATE = 0.1;

// ─── Card type & VIP tiers ─────────────────────────────────────────────────────
// A card is either a standard Business Card or a VIP Card. VIP cards come in
// three tiers, each with its own (admin-configurable) price.

export type CardType = "BUSINESS" | "VIP";
export type VipTier = "SILVER" | "GOLD" | "PLATINUM";

export const VIP_TIERS: VipTier[] = ["SILVER", "GOLD", "PLATINUM"];

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  BUSINESS: "Business Card",
  VIP: "VIP Card",
};

export const VIP_TIER_LABELS: Record<VipTier, string> = {
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

/** Per-type / per-VIP-tier card prices (NPR). Admin-configurable in Settings. */
export type CardPrices = {
  business: number;
  vipSilver: number;
  vipGold: number;
  vipPlatinum: number;
};

/** Defaults used until an admin overrides them in Settings. */
export const DEFAULT_CARD_PRICES: CardPrices = {
  business: CARD_PRICE_NPR,
  vipSilver: 3000,
  vipGold: 5000,
  vipPlatinum: 8000,
};

/** Normalise an arbitrary value to a valid VIP tier (defaults to SILVER). */
export function normalizeVipTier(value: unknown): VipTier {
  return VIP_TIERS.includes(value as VipTier) ? (value as VipTier) : "SILVER";
}

/** Resolve the unit price for a given card type / VIP tier. */
export function resolveCardUnitPrice(prices: CardPrices, type: CardType, tier?: VipTier | null): number {
  if (type === "VIP") {
    if (tier === "GOLD") return prices.vipGold;
    if (tier === "PLATINUM") return prices.vipPlatinum;
    return prices.vipSilver;
  }
  return prices.business;
}

/** Human label for an order's type + tier, e.g. "VIP Card — Gold". */
export function cardTypeLabel(type: CardType, tier?: VipTier | null): string {
  if (type === "VIP") return `${CARD_TYPE_LABELS.VIP} — ${VIP_TIER_LABELS[normalizeVipTier(tier)]}`;
  return CARD_TYPE_LABELS.BUSINESS;
}

/**
 * Format an amount as Nepali Rupees, e.g. 1500 -> "Rs 1,500".
 * Uses South-Asian digit grouping (en-IN), matching NPR conventions.
 */
export function formatNpr(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `Rs ${Math.round(value).toLocaleString("en-IN")}`;
}
