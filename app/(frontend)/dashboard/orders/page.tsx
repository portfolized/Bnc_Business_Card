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
  Palette,
  Globe,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { CARD_TEMPLATES } from "@/components/customize/templateRegistry";
import { PENDING_CARD_KEY, type PendingCard } from "@/components/customize/types";
import OrderForm, { type NewOrderForm } from "@/components/customize/OrderForm";
import PaymentPanel from "@/components/customize/PaymentPanel";
import {
  formatNpr,
  cardTypeLabel,
  type CardType,
  type VipTier,
} from "@/lib/currency";

// Payment-status badge styling + label for the customer's own orders.
const PAY_BADGE: Record<string, { cls: string; label: string }> = {
  PROCESSING: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Awaiting approval" },
  PAID: { cls: "bg-green-50 text-green-700 border-green-200", label: "Paid" },
  UNPAID: { cls: "bg-gray-100 text-gray-600 border-gray-200", label: "Unpaid" },
  // legacy statuses still render sensibly if any old rows exist
  PENDING: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Awaiting approval" },
  REJECTED: { cls: "bg-red-50 text-red-700 border-red-200", label: "Payment rejected" },
};

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
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  qrEnabled: boolean;
  cardType: CardType;
  cardTier: VipTier | null;
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
  const isImageMode = Boolean(order.frontImageUrl || order.backImageUrl);
  const template = CARD_TEMPLATES.find((t) => t.id === order.cardTemplate);

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

          {/* Card design — template layout with either its own or a custom background */}
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Card design — {isImageMode ? "Custom image" : templateName(order.cardTemplate)}
            </h3>
            {isImageMode ? (
              <CardImages front={order.frontImageUrl} back={order.backImageUrl} />
            ) : template ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={template.thumbnailImage} alt={template.name} className="h-20 w-36 rounded-lg border border-gray-200 object-cover" />
            ) : (
              <p className="text-sm text-gray-400">No design selected.</p>
            )}
          </div>

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
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800">{cardTypeLabel(order.cardType, order.cardTier)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Design</span>
                <span className="font-medium text-gray-800">{isImageMode ? "Custom image" : templateName(order.cardTemplate)}</span>
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

// Modal chrome around the shared OrderForm (same UI used on the landing page).
function CreateOrderModal({
  initial,
  onClose,
  onDone,
}: {
  initial?: Partial<NewOrderForm>;
  onClose: () => void;
  onDone: () => void;
}) {
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

        <OrderForm initial={initial} onClose={onClose} onDone={onDone} />
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
  // Order whose payment we're (re)submitting proof for, shown in a modal.
  const [resubmit, setResubmit] = useState<Order | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // If we arrived from the landing "Order Now" flow, pre-fill the modal. Also
  // handles "Order to activate" from the Themes page, which passes ?profileId to
  // attach (and activate) that specific template.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") !== "1") return;
    const profileId = params.get("profileId");
    let pending: PendingCard | null = null;
    try {
      const raw = localStorage.getItem(PENDING_CARD_KEY);
      if (raw) pending = JSON.parse(raw) as PendingCard;
    } catch {
      pending = null;
    }
    const initial: Partial<NewOrderForm> = {};
    if (pending) {
      Object.assign(initial, {
        fullName: pending.info?.fullName ?? "",
        email: pending.info?.email ?? "",
        phone: pending.info?.phone ?? "",
        address: pending.info?.address ?? "",
        website: pending.info?.website ?? "",
        role: pending.info?.role ?? "",
        bio: pending.bio ?? "",
        cardTemplate: pending.cardTemplate || CARD_TEMPLATES[0].id,
        ...(pending.cardType ? { cardType: pending.cardType } : {}),
        ...(pending.cardTier ? { cardTier: pending.cardTier } : {}),
        ...(pending.quantity ? { quantity: pending.quantity } : {}),
        ...(typeof pending.qrEnabled === "boolean" ? { qrEnabled: pending.qrEnabled } : {}),
        ...(pending.slug ? { slug: pending.slug } : {}),
        ...(pending.affiliateCode ? { affiliateCode: pending.affiliateCode } : {}),
      });
      localStorage.removeItem(PENDING_CARD_KEY);
    }
    // Preselect the card to activate (overrides "new" so the order links to it).
    if (profileId) initial.profileId = profileId;
    if (Object.keys(initial).length > 0) setPrefill(initial);
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

  // Orders that still need a (re)submitted payment: never checked out (DRAFT),
  // or the admin set the payment back to unpaid (UNPAID / legacy REJECTED).
  // Orders under review (PROCESSING) or PAID are excluded.
  const needsPayment = filtered.filter(
    (o) => o.status === "DRAFT" || o.paymentStatus === "UNPAID" || o.paymentStatus === "REJECTED"
  );
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

      {/* Payments awaiting (re)submission */}
      {needsPayment.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-800">Payment needed ({needsPayment.length})</h2>
            <span className="text-xs text-amber-600">Submit your payment proof to place these orders.</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {needsPayment.map((o) => (
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
                  {o.status !== "DRAFT" && <p className="text-[11px] font-medium text-red-500">Your payment wasn&apos;t confirmed. Please resubmit.</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setResubmit(o)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#5C2D91] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4a2475]"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  {o.status !== "DRAFT" ? "Resubmit" : "Pay"}
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
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{title(o.status)}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${(PAY_BADGE[o.paymentStatus] ?? PAY_BADGE.UNPAID).cls}`}>
                  {(PAY_BADGE[o.paymentStatus] ?? PAY_BADGE.UNPAID).label}
                </span>
              </div>
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
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-gray-900">{cardTypeLabel(o.cardType, o.cardTier)}</span>
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
          onDone={() => { setCreating(false); setPrefill(undefined); refresh(); }}
        />
      )}
      {resubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setResubmit(null)}>
          <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submit payment</h2>
                <p className="text-xs text-gray-400">Order {shortId(resubmit.id)}</p>
              </div>
              <button onClick={() => setResubmit(null)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <PaymentPanel
              amountNpr={resubmit.totalAmount}
              payload={{ orderId: resubmit.id }}
              onSuccess={() => { setResubmit(null); refresh(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
