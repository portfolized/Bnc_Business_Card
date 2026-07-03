// Common Nepali digital wallets and banks offered as payment methods. The admin
// picks a name from these lists (grouped) when configuring a payment method.

export const PAYMENT_WALLETS = [
  "eSewa",
  "Khalti",
  "IME Pay",
  "ConnectIPS",
  "Fonepay",
  "Prabhu Pay",
  "CellPay",
  "Namaste Pay",
] as const;

export const PAYMENT_BANKS = [
  "Nabil Bank",
  "Nepal Investment Mega Bank",
  "Standard Chartered Bank Nepal",
  "Himalayan Bank",
  "Nepal SBI Bank",
  "Everest Bank",
  "Kumari Bank",
  "Laxmi Sunrise Bank",
  "Machhapuchhre Bank",
  "NIC Asia Bank",
  "Global IME Bank",
  "Citizens Bank International",
  "Prime Commercial Bank",
  "Sanima Bank",
  "NMB Bank",
  "Prabhu Bank",
  "Siddhartha Bank",
  "Agricultural Development Bank",
  "Nepal Bank",
  "Rastriya Banijya Bank",
  "Century Commercial Bank",
] as const;

/** Every selectable wallet/bank name, used to tell known names from legacy/custom ones. */
export const PAYMENT_OPTIONS: string[] = [...PAYMENT_WALLETS, ...PAYMENT_BANKS];

// Website domain per wallet/bank whose brand logo (favicon) is actually served.
// Only verified-resolving domains are listed so the rest fall back to a clean
// lettered badge in <PaymentLogo> (no generic "globe" placeholders).
const PAYMENT_DOMAINS: Record<string, string> = {
  "Khalti": "khalti.com",
  "IME Pay": "imepay.com.np",
  "Fonepay": "fonepay.com",
  "Nabil Bank": "nabilbank.com",
  "Himalayan Bank": "himalayanbank.com",
  "Everest Bank": "everestbankltd.com",
  "NIC Asia Bank": "nicasiabank.com",
  "Laxmi Sunrise Bank": "laxmisunrisebank.com",
  "Standard Chartered Bank Nepal": "sc.com",
  "Agricultural Development Bank": "adbl.gov.np",
  "Nepal Bank": "nepalbank.com.np",
  "Rastriya Banijya Bank": "rbb.com.np",
  "Prime Commercial Bank": "primebank.com.np",
};

// Explicit logo URLs for brands whose favicon isn't indexed by the favicon service.
const PAYMENT_LOGO_OVERRIDES: Record<string, string> = {
  "eSewa": "https://esewa.com.np/favicon.ico",
};

/**
 * A brand logo URL for a wallet/bank name, or null when unknown (the caller then
 * shows a lettered badge). Uses an explicit override, else Google's favicon
 * service for the brand's domain.
 */
export function paymentLogoUrl(name: string): string | null {
  const key = name?.trim();
  if (!key) return null;
  if (PAYMENT_LOGO_OVERRIDES[key]) return PAYMENT_LOGO_OVERRIDES[key];
  const domain = PAYMENT_DOMAINS[key];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
}
