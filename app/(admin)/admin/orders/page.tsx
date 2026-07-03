"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronDown,
  Download,
  X,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Package,
  QrCode,
  Calendar,
  CreditCard,
} from "lucide-react";
import { formatNpr, cardTypeLabel, type CardType, type VipTier } from "@/lib/currency";
import { downloadableImageUrl } from "@/lib/cloudinary";
import { CARD_TEMPLATES } from "@/components/customize/templateRegistry";
import OrderCardPreview from "@/components/customize/OrderCardPreview";
import type { PersonalInfo } from "@/components/customize/types";

type OrderStatus = "DRAFT" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Statuses an admin can switch an order to (DRAFT is system-only, pre-payment).
const STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-500 border-gray-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

// The three payment states an admin can set (mirrors the payments API + page).
const PAY_STATES = ["UNPAID", "PROCESSING", "PAID"] as const;
type PayState = (typeof PAY_STATES)[number];

const PAY_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-gray-100 text-gray-600 border-gray-200",
  // legacy values still render sensibly if any old rows exist
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-gray-100 text-gray-600 border-gray-200",
};

// Map any stored payment value (incl. legacy) onto one of the three states so
// the dropdown always shows a valid selection.
const toPayState = (s: string): PayState =>
  s === "PAID" ? "PAID" : s === "PROCESSING" || s === "PENDING" ? "PROCESSING" : "UNPAID";

const PAY_LABEL: Record<PayState, string> = {
  UNPAID: "Unpaid",
  PROCESSING: "Processing",
  PAID: "Paid",
};

type ShippingAddress = { name?: string; email?: string; phone?: string; address?: string };

type AdminOrder = {
  id: string;
  status: OrderStatus;
  paymentStatus: string;
  transactionId: string | null;
  pidx: string | null;
  qrEnabled: boolean;
  cardType: CardType;
  cardTier: VipTier | null;
  cardTemplate: string;
  quantity: number;
  totalAmount: number;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  shippingAddress: ShippingAddress | null;
  notes: string | null;
  createdAt: string;
  user: { name: string | null; email: string; username: string | null };
  profile: {
    label: string;
    slug: string | null;
    fullName?: string;
    email?: string;
    phone?: string;
    website?: string;
    role?: string;
    location?: string;
    cardTemplate?: string;
    frontImageUrl?: string | null;
    backImageUrl?: string | null;
  } | null;
};

// The template (layout) always lays out the text/QR. The BACKGROUND is either
// the template's own image or the user's upload. Resolve the print files the
// admin should download in either case.
function designAssets(order: AdminOrder) {
  const isImageMode = Boolean(order.frontImageUrl || order.backImageUrl);
  const template = CARD_TEMPLATES.find((t) => t.id === order.cardTemplate);
  const items = isImageMode
    ? ([
        order.frontImageUrl ? { label: "Front", url: order.frontImageUrl } : null,
        order.backImageUrl ? { label: "Back", url: order.backImageUrl } : null,
      ].filter(Boolean) as { label: string; url: string }[])
    : template
    ? [{ label: template.name, url: template.backgroundImage }]
    : [];
  return { isImageMode, template, items };
}

function designLabel(order: AdminOrder) {
  const { isImageMode, template } = designAssets(order);
  if (isImageMode) return "Custom image";
  return template?.name ?? (order.cardTemplate || "—");
}

// A downloadable image thumbnail for the admin to grab print files.
function DownloadThumb({ url, label, name }: { url: string; label: string; name: string }) {
  return (
    <a
      href={downloadableImageUrl(url)}
      download={`${name}.jpg`}
      target="_blank"
      rel="noreferrer"
      title={`Download ${label}`}
      className="group relative inline-block h-12 w-16 overflow-hidden rounded-md border border-gray-200"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
        <Download className="h-4 w-4" />
      </span>
    </a>
  );
}

// The Images cell — downloads for custom images (image mode) or the template
// background (template mode).
function DesignThumbs({ order }: { order: AdminOrder }) {
  const { items } = designAssets(order);
  if (items.length === 0) return <span className="text-xs text-gray-300">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {items.map((it) => (
        <DownloadThumb
          key={it.label}
          url={it.url}
          label={it.label}
          name={`order-${order.id.slice(-8)}-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
        />
      ))}
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
  saving,
}: {
  value: OrderStatus;
  onChange: (v: OrderStatus) => void;
  saving: boolean;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-semibold outline-none transition disabled:opacity-50 ${STATUS_STYLES[value]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin opacity-70" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
      )}
    </div>
  );
}

function PaymentSelect({
  value,
  onChange,
  saving,
}: {
  value: string;
  onChange: (v: PayState) => void;
  saving: boolean;
}) {
  const current = toPayState(value);
  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        disabled={saving}
        onChange={(e) => onChange(e.target.value as PayState)}
        className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-xs font-semibold outline-none transition disabled:opacity-50 ${PAY_STYLES[current]}`}
      >
        {PAY_STATES.map((s) => (
          <option key={s} value={s}>{PAY_LABEL[s]}</option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin opacity-70" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
      )}
    </div>
  );
}

// ─── Full order detail (everything the customer filled in) ──────────────────────

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <span className="w-24 shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 break-words">{value}</span>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const addr = order.shippingAddress ?? {};
  const p = order.profile;
  const { isImageMode, template, items } = designAssets(order);

  // Prefer what was captured on the order; fall back to the linked card.
  const name = addr.name || p?.fullName || order.user.name || "—";
  const email = addr.email || p?.email || order.user.email;
  const phone = addr.phone || p?.phone;
  const address = addr.address || p?.location;

  // The details to render onto the card sample preview (same as the customer's
  // live order preview), drawn from the order + linked card.
  const previewInfo: PersonalInfo = {
    fullName: name === "—" ? "" : name,
    role: p?.role || "",
    email: email || "",
    website: p?.website || "",
    phone: phone || "",
    address: address || "",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5" /> Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Customer details — exactly what they filled while ordering */}
          <section className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Customer details</h3>
            <div className="space-y-2.5">
              <Row icon={User} label="Name" value={name} />
              <Row icon={Mail} label="Email" value={email} />
              <Row icon={Phone} label="Phone" value={phone} />
              <Row icon={MapPin} label="Address" value={address} />
              <Row icon={Briefcase} label="Role" value={p?.role} />
              <Row icon={Globe} label="Website" value={p?.website} />
              <Row icon={User} label="Account" value={`${order.user.name ?? order.user.username ?? ""} <${order.user.email}>`} />
            </div>
          </section>

          {/* Card sample — the actual card the customer designed, both faces. */}
          <section className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Card sample</h3>
            <div className="mx-auto max-w-xs">
              <OrderCardPreview
                templateId={order.cardTemplate}
                info={previewInfo}
                frontImageUrl={order.frontImageUrl}
                backImageUrl={order.backImageUrl}
                showQr={order.qrEnabled}
              />
            </div>
          </section>

          {/* Design — template layout with either its own or a custom background */}
          <section className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Design — {isImageMode ? "Custom image" : `Template · ${template?.name ?? order.cardTemplate}`}
            </h3>
            {items.length > 0 ? (
              <div className="flex flex-wrap items-end gap-4">
                {items.map((it) => (
                  <div key={it.label} className="space-y-1.5">
                    <p className="text-[11px] font-medium text-gray-500">{it.label}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.url} alt={it.label} className="h-24 w-40 rounded-lg border border-gray-200 object-cover" />
                    <a
                      href={downloadableImageUrl(it.url)}
                      download={`order-${order.id.slice(-8)}-${it.label.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-40 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No design asset.</p>
            )}
            {!isImageMode && template && (
              <p className="mt-3 text-xs text-gray-400">
                Template: <span className="font-medium text-gray-600">{template.name}</span> — the background is a Pexels
                image; the link opens it full-size to save.
              </p>
            )}
          </section>

          {/* Order summary */}
          <section className="rounded-xl border border-gray-100 p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
              <Package className="h-3.5 w-3.5" /> Order
            </h3>
            <div className="space-y-2.5">
              <Row icon={CreditCard} label="Card type" value={cardTypeLabel(order.cardType, order.cardTier)} />
              <Row icon={Package} label="Design" value={designLabel(order)} />
              <Row icon={QrCode} label="QR on back" value={order.qrEnabled ? "Yes" : "No"} />
              <Row icon={Package} label="Quantity" value={`×${order.quantity}`} />
              <Row icon={CreditCard} label="Total" value={formatNpr(order.totalAmount)} />
              <Row icon={CreditCard} label="Payment" value={order.paymentStatus} />
              <Row icon={CreditCard} label="Txn ID" value={order.transactionId || order.pidx} />
              {order.profile && (
                <Row icon={Globe} label="Card" value={`${order.profile.label}${order.profile.slug ? ` — /profile/${order.profile.slug}` : ""}`} />
              )}
              <Row icon={Package} label="Notes" value={order.notes} />
            </div>
          </section>
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AdminOrder | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const prev = orders;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) setOrders(prev);
    } catch {
      setOrders(prev);
    } finally {
      setSavingId(null);
    }
  };

  const updatePayment = async (id: string, paymentStatus: PayState) => {
    const prev = orders;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
    setPayingId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!res.ok) setOrders(prev);
    } catch {
      setOrders(prev);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Orders</h1>
        <p className="mt-1 text-subtext">
          {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} total — click a row to see full details.`}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-foreground">No orders yet</p>
            <p className="mt-1 text-sm text-subtext">Orders placed by users will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-subtext">Order ID</th>
                  <th className="px-4 py-3 font-medium text-subtext">Customer</th>
                  <th className="px-4 py-3 font-medium text-subtext">Type</th>
                  <th className="px-4 py-3 font-medium text-subtext">Design</th>
                  <th className="px-4 py-3 font-medium text-subtext">Download</th>
                  <th className="px-4 py-3 font-medium text-subtext">Qty</th>
                  <th className="px-4 py-3 font-medium text-subtext">Total</th>
                  <th className="px-4 py-3 font-medium text-subtext">Payment</th>
                  <th className="px-4 py-3 font-medium text-subtext">Status</th>
                  <th className="px-4 py-3 font-medium text-subtext">Date</th>
                  <th className="px-4 py-3 font-medium text-subtext"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-subtext">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {order.shippingAddress?.name ?? order.user.name ?? order.user.username ?? "—"}
                      </p>
                      <p className="text-xs text-subtext">{order.shippingAddress?.email ?? order.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {order.cardType === "VIP" ? (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          {cardTypeLabel(order.cardType, order.cardTier)}
                        </span>
                      ) : (
                        <span className="text-foreground">{cardTypeLabel(order.cardType, order.cardTier)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{designLabel(order)}</td>
                    <td className="px-4 py-3">
                      <DesignThumbs order={order} />
                    </td>
                    <td className="px-4 py-3 text-foreground">{order.quantity}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatNpr(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentSelect
                        value={order.paymentStatus}
                        saving={payingId === order.id}
                        onChange={(v) => updatePayment(order.id, v)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={order.status}
                        saving={savingId === order.id}
                        onChange={(v) => updateStatus(order.id, v)}
                      />
                    </td>
                    <td className="px-4 py-3 text-subtext">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewing(order)}
                        title="View full details"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
