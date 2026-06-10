"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  User,
  Truck,
  CheckCircle2,
  Clock,
  ChevronDown,
  Palette,
  Globe,
  Loader2,
  ExternalLink,
  QrCode,
  Wallet,
} from "lucide-react";
import { CARD_TEMPLATES } from "@/components/customize/templateRegistry";
import { PENDING_CARD_KEY, type PendingCard, type PersonalInfo } from "@/components/customize/types";
import ImageUpload from "@/components/ui/ImageUpload";
import { formatNpr, CARD_PRICE_NPR } from "@/lib/currency";

// Live card preview showing BOTH faces, so the entered details and the QR
// toggle are visible at a glance. Mirrors the landing "Design Preview".
function PreviewCards({
  templateId,
  info,
  frontImageUrl,
  backImageUrl,
  showQr = true,
}: {
  templateId: string;
  info: PersonalInfo;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  showQr?: boolean;
}) {
  const template = CARD_TEMPLATES.find((t) => t.id === templateId) ?? CARD_TEMPLATES[0];
  const Comp = template.Component;

  const face = (side: "front" | "back", label: string) => (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
        <Comp
          info={info}
          side={side}
          showQr={showQr}
          frontLogoUrl={frontImageUrl}
          backLogoUrl={backImageUrl}
          backgroundImage={template.backgroundImage}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {face("front", "Front")}
      {face("back", "Back")}
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = "DRAFT" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type ShippingAddress = { name?: string; email?: string; phone?: string; address?: string };

type OrderProfile = {
  id: string;
  label: string;
  slug: string | null;
  cardTemplate: string;
  fullName: string;
} | null;

type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: string;
  qrEnabled: boolean;
  cardTemplate: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  quantity: number;
  totalAmount: number;
  shippingAddress: ShippingAddress | null;
  notes: string | null;
  createdAt: string;
  profile: OrderProfile;
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

function title(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function templateName(id: string) {
  return CARD_TEMPLATES.find((t) => t.id === id)?.name ?? (id || "—");
}

function shortId(id: string) {
  return id.slice(-8).toUpperCase();
}

function customerName(o: Order) {
  return o.shippingAddress?.name || o.profile?.fullName || "—";
}

// ─── Card image thumbnails ──────────────────────────────────────────────────────

function CardImages({ front, back }: { front: string | null; back: string | null }) {
  if (!front && !back) return null;
  return (
    <div className="flex gap-2">
      {front && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={front} alt="Card front" className="h-16 w-28 rounded-lg border border-gray-200 object-cover" />
      )}
      {back && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={back} alt="Card back" className="h-16 w-28 rounded-lg border border-gray-200 object-cover" />
      )}
    </div>
  );
}

// ─── Order Detail Popup ─────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const activeStep = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";
  const addr = order.shippingAddress ?? {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl font-bold text-gray-900">#{shortId(order.id)}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                {title(order.status)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5" /> Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {!cancelled && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= activeStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${done ? "border-green-500 bg-green-500 text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-[11px] font-medium ${done ? "text-gray-700" : "text-gray-300"}`}>{step.label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 ${i < activeStep ? "bg-green-500" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card design */}
          {(order.frontImageUrl || order.backImageUrl) && (
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Card design</h3>
              <CardImages front={order.frontImageUrl} back={order.backImageUrl} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                <User className="h-3.5 w-3.5" /> Customer
              </h3>
              <p className="text-sm font-semibold text-gray-900">{customerName(order)}</p>
              <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                {addr.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" />{addr.email}</p>}
                {addr.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" />{addr.phone}</p>}
                {addr.address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />{addr.address}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                <Package className="h-3.5 w-3.5" /> Order
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Template</span>
                <span className="font-medium text-gray-800">{templateName(order.cardTemplate)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium text-gray-800">×{order.quantity}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatNpr(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Linked card actions */}
          {order.profile && (
            <div className="rounded-xl border border-gray-100 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Linked card — {order.profile.label}</h3>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/themes?profileId=${order.profile.id}`} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <Palette className="h-3.5 w-3.5" /> Choose theme
                </Link>
                <Link href={`/dashboard/domain?profileId=${order.profile.id}`} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <Globe className="h-3.5 w-3.5" /> Set domain
                </Link>
                {order.profile.slug && (
                  <Link href={`/profile/${order.profile.slug}`} target="_blank" className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                    <ExternalLink className="h-3.5 w-3.5" /> View live
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Order Popup ──────────────────────────────────────────────────────────

type CardOption = { id: string; label: string; slug: string | null };

type NewOrderForm = {
  profileId: string; // "new" or an existing card/domain id
  fullName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  role: string;
  cardTemplate: string;
  quantity: number;
  qrEnabled: boolean;
  frontImageUrl: string | null;
  backImageUrl: string | null;
};

const EMPTY_FORM: NewOrderForm = {
  profileId: "new",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  role: "",
  cardTemplate: CARD_TEMPLATES[0].id,
  quantity: 1,
  qrEnabled: true,
  frontImageUrl: null,
  backImageUrl: null,
};

function CreateOrderModal({
  initial,
  onClose,
  onDone,
}: {
  initial?: Partial<NewOrderForm>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState<NewOrderForm>({ ...EMPTY_FORM, ...initial });
  const [cards, setCards] = useState<CardOption[]>([]);
  const [price, setPrice] = useState<number>(CARD_PRICE_NPR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const set = (patch: Partial<NewOrderForm>) => setForm((p) => ({ ...p, ...patch }));

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCards(Array.isArray(d) ? d : []))
      .catch(() => setCards([]));
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.cardPriceNpr === "number") setPrice(d.cardPriceNpr); })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, profileId: form.profileId === "new" ? null : form.profileId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_url) {
        // Redirect to Khalti to complete payment.
        window.location.href = data.payment_url;
        return;
      }
      if (res.ok && data.needsConfig) {
        setInfo("Payment isn't configured yet, so your order was saved as a draft. An admin can enable Khalti to take payment.");
        onDone();
        return;
      }
      setError(data.error ?? "Failed to start checkout.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order a Card</h2>
            <p className="text-xs text-gray-400">Design it, preview both sides, then pay to place the order.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-2">
            {/* ── Left: form fields ── */}
            <div className="space-y-4">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Template</label>
                  <div className="relative">
                    <select value={form.cardTemplate} onChange={(e) => set({ cardTemplate: e.target.value })} className={`${inputCls} appearance-none pr-9`}>
                      {CARD_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" min={1} value={form.quantity} onChange={(e) => set({ quantity: Math.max(1, Number(e.target.value)) })} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Domain</label>
                <div className="relative">
                  <select value={form.profileId} onChange={(e) => set({ profileId: e.target.value })} className={`${inputCls} appearance-none pr-9`}>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}{c.slug ? ` — /profile/${c.slug}` : " — no domain yet"}
                      </option>
                    ))}
                    <option value="new">+ Create a new card</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUpload label="Front image (upload or Pexels)" value={form.frontImageUrl} onChange={(url) => set({ frontImageUrl: url })} className="h-24 w-full" />
                <ImageUpload label="Back image (upload or Pexels)" value={form.backImageUrl} onChange={(url) => set({ backImageUrl: url })} className="h-24 w-full" />
              </div>

              {/* QR toggle */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <QrCode className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">QR code on card back</p>
                    <p className="text-[11px] text-gray-400">{form.qrEnabled ? "Shown on the back ↓" : "Hidden"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.qrEnabled}
                  onClick={() => set({ qrEnabled: !form.qrEnabled })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.qrEnabled ? "bg-[#5C2D91]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.qrEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* ── Right: live preview (both faces) ── */}
            <div className="lg:sticky lg:top-0 lg:self-start">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Live preview</p>
              <PreviewCards
                templateId={form.cardTemplate}
                showQr={form.qrEnabled}
                info={previewInfo}
                frontImageUrl={form.frontImageUrl}
                backImageUrl={form.backImageUrl}
              />
              <p className="mt-2 text-center text-[11px] text-gray-400">Your details appear on the card as you type.</p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="space-y-3 border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
              <span className="text-gray-500">Total ({formatNpr(price)} × {form.quantity})</span>
              <span className="text-base font-bold text-gray-900">{formatNpr(price * form.quantity)}</span>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {info && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{info}</p>}
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                {info ? "Close" : "Cancel"}
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#5C2D91] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a2475] disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {saving ? "Redirecting…" : `Pay ${formatNpr(price * form.quantity)} with Khalti`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const [prefill, setPrefill] = useState<Partial<NewOrderForm> | undefined>(undefined);
  const [payingId, setPayingId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Re-start Khalti payment for a draft order.
  const completePayment = async (orderId: string) => {
    setPayingId(orderId);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      alert(data.error ?? "Payment gateway is not configured yet.");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  // If we arrived from the landing "Order Now" flow, pre-fill the modal.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") !== "1") return;
    let pending: PendingCard | null = null;
    try {
      const raw = localStorage.getItem(PENDING_CARD_KEY);
      if (raw) pending = JSON.parse(raw) as PendingCard;
    } catch {
      pending = null;
    }
    if (pending) {
      setPrefill({
        fullName: pending.info?.fullName ?? "",
        email: pending.info?.email ?? "",
        phone: pending.info?.phone ?? "",
        address: pending.info?.address ?? "",
        website: pending.info?.website ?? "",
        role: pending.info?.role ?? "",
        cardTemplate: pending.cardTemplate || CARD_TEMPLATES[0].id,
        frontImageUrl: pending.frontImageUrl ?? null,
        backImageUrl: pending.backImageUrl ?? null,
      });
      localStorage.removeItem(PENDING_CARD_KEY);
    }
    setCreating(true);
    // Clear the ?new=1 param so a refresh doesn't reopen the modal.
    router.replace("/dashboard/orders");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [shortId(o.id), customerName(o), o.shippingAddress?.email, o.shippingAddress?.phone, o.profile?.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, search]);

  const drafts = filtered.filter((o) => o.status === "DRAFT");
  const placed = filtered.filter((o) => o.status !== "DRAFT");

  return (
    <div className="min-h-full bg-white px-6 py-8 md:px-8 md:py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by name, phone, email, card..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : placed.length === 0 ? "No orders yet" : `${placed.length} order${placed.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Drafts awaiting payment */}
      {drafts.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-800">Pending payment ({drafts.length})</h2>
            <span className="text-xs text-amber-600">Complete payment to place these orders.</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-3">
                {(o.frontImageUrl || o.backImageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(o.frontImageUrl || o.backImageUrl)!} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-gray-100 object-cover" />
                ) : (
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><Package className="h-5 w-5" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{templateName(o.cardTemplate)}</p>
                  <p className="text-xs text-gray-400">{formatNpr(o.totalAmount)} · {customerName(o)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => completePayment(o.id)}
                  disabled={payingId === o.id}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#5C2D91] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4a2475] disabled:opacity-60"
                >
                  {payingId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                  Pay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => { setPrefill(undefined); setCreating(true); }}
          className="group flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center transition hover:border-green-400 hover:bg-green-50/40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-green-100 group-hover:text-green-600">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold text-gray-900">Order Card</span>
          <span className="text-sm text-gray-400">Create a new card order</span>
        </button>

        {placed.map((o) => (
          <div key={o.id} className="flex min-h-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-mono text-lg font-bold tracking-wide text-gray-900">{shortId(o.id)}</h3>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{title(o.status)}</span>
            </div>

            {(o.frontImageUrl || o.backImageUrl) && (
              <div className="mb-3"><CardImages front={o.frontImageUrl} back={o.backImageUrl} /></div>
            )}

            <div className="flex-1 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">{customerName(o)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Template</span>
                <span className="font-semibold text-gray-900">{templateName(o.cardTemplate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">{formatNpr(o.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => setViewing(o)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
                <Eye className="h-4 w-4" /> View
              </button>
              {o.profile && (
                <Link href={`/dashboard/themes?profileId=${o.profile.id}`} title="Choose theme for this card" className="flex items-center justify-center rounded-lg border border-gray-200 px-3 text-gray-600 transition hover:bg-gray-50">
                  <Palette className="h-4 w-4" />
                </Link>
              )}
              {o.profile && (
                <Link href={`/dashboard/domain?profileId=${o.profile.id}`} title="Set domain for this card" className="flex items-center justify-center rounded-lg border border-gray-200 px-3 text-gray-600 transition hover:bg-gray-50">
                  <Globe className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {viewing && <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />}
      {creating && (
        <CreateOrderModal
          initial={prefill}
          onClose={() => { setCreating(false); setPrefill(undefined); }}
          onDone={() => { refresh(); }}
        />
      )}
    </div>
  );
}
