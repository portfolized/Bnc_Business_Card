"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CheckCircle2, Clock, CreditCard, Check, X, ImageOff } from "lucide-react";
import { formatNpr } from "@/lib/currency";
import PaymentLogo from "@/components/ui/PaymentLogo";
import { PageHeader, StatCard, Tabs, EmptyState } from "@/components/admin/ui";

type AdminOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  transactionId: string | null;
  totalAmount: number;
  quantity: number;
  createdAt: string;
  user: { name: string | null; email: string; username: string | null };
  profile: { label: string; slug: string | null } | null;
};

// The three payment states the admin controls.
const PAY_STATES = ["UNPAID", "PROCESSING", "PAID"] as const;
type PayState = (typeof PAY_STATES)[number];

type Filter = "ALL" | PayState;

const PAY_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-gray-100 text-gray-600 border-gray-200",
  // legacy statuses still render sensibly if any old rows exist
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const PAY_LABEL: Record<string, string> = {
  PAID: "Paid",
  PROCESSING: "Processing",
  UNPAID: "Unpaid",
  PENDING: "Processing",
  REJECTED: "Unpaid",
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Orders submitted and awaiting an admin decision. "PENDING" is a legacy alias.
  const isAwaiting = (s: string) => s === "PROCESSING" || s === "PENDING";

  const totals = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "PAID");
    return {
      collected: paid.reduce((s, o) => s + o.totalAmount, 0),
      paidCount: paid.length,
      pending: orders.filter((o) => isAwaiting(o.paymentStatus)).length,
    };
  }, [orders]);

  const decide = async (id: string, paymentStatus: PayState) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to update payment.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const rows = orders.filter((o) =>
    filter === "ALL" ? true : filter === "PROCESSING" ? isAwaiting(o.paymentStatus) : o.paymentStatus === filter
  );

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <PageHeader
        icon={CreditCard}
        eyebrow="Finance"
        title="Payments"
        subtitle="Review payment proofs and set each order paid or unpaid."
      />

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Collected" value={formatNpr(totals.collected)} icon={Wallet} grad="from-emerald-500 to-teal-500" />
        <StatCard label="Paid Orders" value={String(totals.paidCount)} icon={CheckCircle2} grad="from-green-500 to-emerald-500" />
        <StatCard label="Awaiting Approval" value={String(totals.pending)} icon={Clock} grad="from-amber-500 to-orange-500" />
      </div>

      {/* Filter */}
      <div className="mt-6">
        <Tabs
          value={filter}
          onChange={(k) => setFilter(k as Filter)}
          tabs={(["ALL", ...PAY_STATES] as Filter[]).map((f) => ({
            key: f,
            label: f === "ALL" ? "All" : PAY_LABEL[f],
          }))}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments to show" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Proof</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-subtext">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{o.user.name ?? o.user.username ?? "—"}</p>
                      <p className="text-xs text-subtext">{o.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatNpr(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      {o.paymentMethod ? (
                        <span className="flex items-center gap-2">
                          <PaymentLogo name={o.paymentMethod} size={24} />
                          <span className="text-gray-700">{o.paymentMethod}</span>
                        </span>
                      ) : (
                        <span className="text-subtext">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o.paymentProofUrl ? (
                        <button type="button" onClick={() => setPreview(o.paymentProofUrl)} className="block overflow-hidden rounded-lg border border-gray-200">
                          <img src={o.paymentProofUrl} alt="Payment proof" className="h-12 w-12 object-cover transition hover:opacity-80" />
                        </button>
                      ) : (
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-300"><ImageOff className="h-4 w-4" /></span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PAY_STYLES[o.paymentStatus] ?? PAY_STYLES.UNPAID}`}>
                        {PAY_LABEL[o.paymentStatus] ?? o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.paymentStatus === "PAID" ? (
                        <button
                          type="button"
                          onClick={() => decide(o.id, "UNPAID")}
                          disabled={busyId === o.id}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                        >
                          {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          Set unpaid
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => decide(o.id, "PAID")}
                            disabled={busyId === o.id}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                          >
                            {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Mark paid
                          </button>
                          {isAwaiting(o.paymentStatus) && (
                            <button
                              type="button"
                              onClick={() => decide(o.id, "UNPAID")}
                              disabled={busyId === o.id}
                              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                            >
                              <X className="h-3.5 w-3.5" />
                              Set unpaid
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-subtext">
                      {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="relative max-h-[90vh] max-w-lg">
            <button type="button" onClick={() => setPreview(null)} className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-gray-600 shadow-md hover:text-gray-900">
              <X className="h-4 w-4" />
            </button>
            <img src={preview} alt="Payment proof" className="max-h-[90vh] w-auto rounded-lg" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
