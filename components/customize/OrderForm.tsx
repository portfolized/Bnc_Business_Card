"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, Loader2, Wallet } from "lucide-react";
import { CARD_TEMPLATES } from "./templateRegistry";
import { PENDING_CARD_KEY, type PersonalInfo } from "./types";
import OrderCardPreview from "./OrderCardPreview";
import VipCardPreview from "./VipCardPreview";
import PaymentPanel from "./PaymentPanel";
import {
  formatNpr,
  resolveCardUnitPrice,
  cardTypeLabel,
  VIP_TIERS,
  VIP_TIER_LABELS,
  DEFAULT_CARD_PRICES,
  type CardPrices,
  type CardType,
  type VipTier,
} from "@/lib/currency";

export type NewOrderForm = {
  profileId: string; // "new" or an existing card/domain id
  fullName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  role: string;
  cardType: CardType; // Business or VIP
  cardTier: VipTier; // VIP tier (ignored when cardType is Business)
  slug: string; // optional domain (username) to claim for a new card
  bio: string; // short description, saved to the profile / shown on the public page
  cardTemplate: string;
  quantity: number;
  qrEnabled: boolean;
};

export const EMPTY_ORDER_FORM: NewOrderForm = {
  profileId: "new",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  role: "",
  cardType: "BUSINESS",
  cardTier: "SILVER",
  slug: "",
  bio: "",
  cardTemplate: CARD_TEMPLATES[0].id,
  quantity: 1,
  qrEnabled: false,
};

type CardOption = { id: string; label: string; slug: string | null; ordered?: boolean };

/**
 * The full "Order a Card" form: details, a template picker and a live preview.
 * Shared by the dashboard order modal and the landing page. Logged-in visitors
 * continue to the manual payment step (pick a method → pay → upload proof);
 * logged-out visitors have their design saved and are sent to login, returning
 * to the dashboard to complete the order.
 */
export default function OrderForm({
  initial,
  onClose,
  onDone,
}: {
  initial?: Partial<NewOrderForm>;
  /** When provided, a Cancel/Close button is shown (modal usage). */
  onClose?: () => void;
  /** Called after an order is saved as a draft (payment not configured). */
  onDone?: () => void;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState<NewOrderForm>({ ...EMPTY_ORDER_FORM, ...initial });
  const [cards, setCards] = useState<CardOption[]>([]);
  const [prices, setPrices] = useState<CardPrices>(DEFAULT_CARD_PRICES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");
  const set = (patch: Partial<NewOrderForm>) => setForm((p) => ({ ...p, ...patch }));

  // Unit price depends on the chosen card type / VIP tier.
  const unitPrice = resolveCardUnitPrice(prices, form.cardType, form.cardType === "VIP" ? form.cardTier : null);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCards(Array.isArray(d) ? d : []))
      .catch(() => setCards([]));
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.prices) setPrices(d.prices as CardPrices); })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setError("");

    // Logged-out visitor (landing page): stash the design and route through
    // login. The dashboard order page picks this up and reopens the form.
    if (status !== "authenticated") {
      setSaving(true);
      try {
        localStorage.setItem(PENDING_CARD_KEY, JSON.stringify({
          info: {
            fullName: form.fullName,
            role: form.role,
            email: form.email,
            website: form.website,
            phone: form.phone,
            address: form.address,
          },
          bio: form.bio,
          cardTemplate: form.cardTemplate,
          cardType: form.cardType,
          cardTier: form.cardTier,
          quantity: form.quantity,
          qrEnabled: form.qrEnabled,
          slug: form.slug,
        }));
      } catch {
        // ignore storage failures; the order form still reopens empty
      }
      const dest = "/dashboard/orders?new=1";
      router.push(`/login?next=${encodeURIComponent(dest)}`);
      return;
    }

    // Logged-in: move to the manual payment step (choose method → pay → upload).
    setStep("payment");
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#5C2D91]/40 focus:ring-2 focus:ring-[#5C2D91]/10";

  const previewInfo: PersonalInfo = {
    fullName: form.fullName || "Full Name",
    role: form.role || "Your Role",
    email: form.email || "you@example.com",
    website: form.website || "yoursite.com",
    phone: form.phone || "+977 9800000000",
    address: form.address || "Your Address",
  };

  const submitLabel = status === "authenticated" ? "Continue to payment" : "Continue to order";

  // Manual payment step: pick a method, view its QR + details, upload proof.
  if (step === "payment") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PaymentPanel
          amountNpr={unitPrice * form.quantity}
          payload={{ ...form, profileId: form.profileId === "new" ? null : form.profileId }}
          onBack={() => setStep("details")}
          onSuccess={() => (onDone ? onDone() : router.push("/dashboard/orders"))}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-2">
        {/* ── Left: form fields ── */}
        <div className="space-y-4">
          {/* Card type — Business or VIP. VIP unlocks Silver/Gold/Platinum tiers. */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Card type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => set({ cardType: "BUSINESS" })}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${form.cardType === "BUSINESS" ? "bg-[#5C2D91] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Business Card
              </button>
              <button
                type="button"
                onClick={() => set({ cardType: "VIP" })}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${form.cardType === "VIP" ? "bg-[#5C2D91] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
              >
                VIP Card
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              {form.cardType === "VIP"
                ? "VIP cards are premium metal cards, available in Silver, Gold and Platinum finishes."
                : "Business cards are standard PVC cards."}
            </p>

            {form.cardType === "VIP" && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {VIP_TIERS.map((tier) => {
                  const active = form.cardTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => set({ cardTier: tier })}
                      className={`rounded-lg border px-2 py-2 text-center transition ${active ? "border-[#5C2D91] bg-[#5C2D91]/5" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <span className={`block text-sm font-semibold ${active ? "text-[#5C2D91]" : "text-gray-700"}`}>{VIP_TIER_LABELS[tier]}</span>
                      <span className="block text-[11px] text-gray-400">{formatNpr(resolveCardUnitPrice(prices, "VIP", tier))}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
            <input required value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="Enter full name" className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Role / Title</label>
              <input value={form.role} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. CEO, Founder" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Website</label>
              <input value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="yoursite.com" className={inputCls} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="email@example.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
              <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+977 98..." className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
            <input value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="Street, City, Country" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.bio}
              onChange={(e) => set({ bio: e.target.value })}
              rows={3}
              placeholder="A short bio shown on your public profile page."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Card design — pick a ready-made template. Your details are
              overlaid on it. VIP cards use a metal finish instead, so the
              template picker is hidden for them. */}
          {form.cardType !== "VIP" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Card template</label>
              <div className="relative">
                <select value={form.cardTemplate} onChange={(e) => set({ cardTemplate: e.target.value })} className={`${inputCls} appearance-none pr-9`}>
                  {CARD_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">Your name, role and contact details are printed on it.</p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" min={1} value={form.quantity} onChange={(e) => set({ quantity: Math.max(1, Number(e.target.value)) })} className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Domain</label>
            <div className="relative">
              <select value={form.profileId} onChange={(e) => set({ profileId: e.target.value })} className={`${inputCls} appearance-none pr-9`}>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}{c.slug ? ` — /profile/${c.slug}` : " — no domain yet"}{c.ordered ? " · NFC" : " · demo"}
                  </option>
                ))}
                <option value="new">+ Create a new card</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* New card → let the user claim a domain (username) right here. */}
            {form.profileId === "new" && (
              <div className="mt-2">
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                  <span className="whitespace-nowrap border-r border-gray-200 bg-gray-50 px-2.5 py-2.5 text-xs text-gray-400">/profile/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="yourname (optional)"
                    maxLength={30}
                    className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400">Claim a domain for this card now, or set it later. 3–30 letters, numbers or underscores.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: live preview (both faces) ── */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Live preview</p>
          {form.cardType === "VIP" ? (
            <VipCardPreview info={previewInfo} tier={form.cardTier} />
          ) : (
            <OrderCardPreview
              designMode="template"
              templateId={form.cardTemplate}
              showQr={false}
              info={previewInfo}
              frontImageUrl={null}
              backImageUrl={null}
            />
          )}
          <p className="mt-2 text-center text-[11px] text-gray-400">Your details appear on the card as you type.</p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="space-y-3 border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
          <span className="text-gray-500">
            {cardTypeLabel(form.cardType, form.cardTier)} · {formatNpr(unitPrice)} × {form.quantity}
          </span>
          <span className="text-base font-bold text-gray-900">{formatNpr(unitPrice * form.quantity)}</span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Cancel
            </button>
          )}
          <button type="submit" disabled={saving || status === "loading"} className="flex items-center gap-2 rounded-lg bg-[#5C2D91] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a2475] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {saving ? "Redirecting…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
