"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { formatNpr } from "@/lib/currency";

type AdminOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  pidx: string | null;
  transactionId: string | null;
  totalAmount: number;
  quantity: number;
  createdAt: string;
  user: { name: string | null; email: string; username: string | null };
  profile: { label: string; slug: string | null } | null;
};

type Filter = "ALL" | "PAID" | "UNPAID";

const PAY_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  UNPAID: "bg-amber-50 text-amber-700 border-amber-200",
  REFUNDED: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "PAID");
    return {
      collected: paid.reduce((s, o) => s + o.totalAmount, 0),
      paidCount: paid.length,
      pending: orders.filter((o) => o.paymentStatus !== "PAID").length,
    };
  }, [orders]);

  const rows = orders.filter((o) =>
    filter === "ALL" ? true : filter === "PAID" ? o.paymentStatus === "PAID" : o.paymentStatus !== "PAID"
  );

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>
      <p className="mt-1 text-subtext">Payment history for all card orders.</p>

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Collected", value: formatNpr(totals.collected), icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
          { label: "Paid Orders", value: String(totals.paidCount), icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Awaiting Payment", value: String(totals.pending), icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-sm text-subtext">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["ALL", "PAID", "UNPAID"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="h-9 w-9 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-foreground">No payments to show</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Transaction ID</th>
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
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PAY_STYLES[o.paymentStatus] ?? PAY_STYLES.UNPAID}`}>
                        {o.paymentStatus.charAt(0) + o.paymentStatus.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-subtext">{o.transactionId ?? o.pidx ?? "—"}</td>
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
    </div>
  );
}
