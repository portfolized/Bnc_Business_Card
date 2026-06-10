// Central money helpers. The app prices and pays out in Nepali Rupees (NPR).

/** Price of one NFC card, in NPR. */
export const CARD_PRICE_NPR = 1500;

/** Affiliate commission rate on a referred user's delivered orders. */
export const AFFILIATE_RATE = 0.1;

/**
 * Format an amount as Nepali Rupees, e.g. 1500 -> "Rs 1,500".
 * Uses South-Asian digit grouping (en-IN), matching NPR conventions.
 */
export function formatNpr(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `Rs ${Math.round(value).toLocaleString("en-IN")}`;
}
