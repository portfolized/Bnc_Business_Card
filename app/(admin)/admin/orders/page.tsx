"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronDown, Download } from "lucide-react";
import { formatNpr } from "@/lib/currency";
import { downloadableImageUrl } from "@/lib/cloudinary";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

type AdminOrder = {
  id: string;
  status: OrderStatus;
  cardTemplate: string;
  quantity: number;
  totalAmount: number;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  createdAt: string;
  user: { name: string | null; email: string; username: string | null };
  profile: { label: string; slug: string | null } | null;
};

// A downloadable image thumbnail for the admin to grab print files.
function DownloadThumb({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-xs text-gray-300">—</span>;
  return (
    <a
      href={downloadableImageUrl(url)}
      download={`${label}.jpg`}
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Orders</h1>
        <p className="mt-1 text-subtext">
          {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} total — update status inline.`}
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
                  <th className="px-4 py-3 font-medium text-subtext">Card</th>
                  <th className="px-4 py-3 font-medium text-subtext">Images</th>
                  <th className="px-4 py-3 font-medium text-subtext">Qty</th>
                  <th className="px-4 py-3 font-medium text-subtext">Total</th>
                  <th className="px-4 py-3 font-medium text-subtext">Status</th>
                  <th className="px-4 py-3 font-medium text-subtext">Date</th>
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
                        {order.user.name ?? order.user.username ?? "—"}
                      </p>
                      <p className="text-xs text-subtext">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {order.profile?.label ?? order.cardTemplate ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <DownloadThumb url={order.frontImageUrl} label={`order-${order.id.slice(-8)}-front`} />
                        <DownloadThumb url={order.backImageUrl} label={`order-${order.id.slice(-8)}-back`} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{order.quantity}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatNpr(order.totalAmount)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
