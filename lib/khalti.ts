// Khalti ePayment (KPG-2) server integration.
// Docs: https://docs.khalti.com/khalti-epayment/
//
// Set KHALTI_SECRET_KEY in .env. Amounts are sent to Khalti in paisa
// (1 NPR = 100 paisa).

const BASE = (process.env.KHALTI_BASE_URL || "https://a.khalti.com/api/v2").replace(/\/$/, "");
const KEY = process.env.KHALTI_SECRET_KEY;

export function isKhaltiConfigured() {
  return Boolean(KEY);
}

type InitiateArgs = {
  amountNpr: number;
  orderId: string;
  orderName: string;
  returnUrl: string;
  websiteUrl: string;
  customer: { name: string; email: string; phone: string };
};

export type KhaltiInitiateResult = { pidx: string; payment_url: string };

export async function initiateKhaltiPayment(args: InitiateArgs): Promise<KhaltiInitiateResult> {
  if (!KEY) throw new Error("Khalti is not configured. Add KHALTI_SECRET_KEY to .env.");

  // Khalti requires a phone number; fall back to a placeholder if missing.
  const phone = (args.customer.phone || "").replace(/\D/g, "").slice(-10) || "9800000000";

  const res = await fetch(`${BASE}/epayment/initiate/`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      return_url: args.returnUrl,
      website_url: args.websiteUrl,
      amount: Math.max(1000, Math.round(args.amountNpr * 100)), // paisa, min Rs 10
      purchase_order_id: args.orderId,
      purchase_order_name: args.orderName,
      customer_info: {
        name: args.customer.name || "Customer",
        email: args.customer.email || "customer@example.com",
        phone,
      },
    }),
  });

  if (!res.ok) {
    let detail = "";
    try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text().catch(() => ""); }
    throw new Error(`Khalti initiate failed (${res.status}). ${detail}`.trim());
  }

  return res.json();
}

export type KhaltiLookupResult = {
  pidx: string;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled" | string;
  total_amount: number;
  transaction_id: string | null;
};

export async function lookupKhaltiPayment(pidx: string): Promise<KhaltiLookupResult> {
  if (!KEY) throw new Error("Khalti is not configured.");

  const res = await fetch(`${BASE}/epayment/lookup/`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ pidx }),
  });

  if (!res.ok) {
    throw new Error(`Khalti lookup failed (${res.status}).`);
  }

  return res.json();
}
