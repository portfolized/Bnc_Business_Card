"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Wallet } from "lucide-react";
import { formatNpr } from "@/lib/currency";

type AffiliateRow = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  referralCode: string | null;
  referralCount: number;
  earned: number;
  paid: number;
  due: number;
};

export default function AdminAffiliatePage() {
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/affiliate")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const markPaid = async (id: string) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/admin/affiliate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRows((list) =>
          list.map((r) => (r.id === id ? { ...r, paid: data.paid, due: data.due } : r))
        );
      }
    } finally {
      setPayingId(null);
    }
  };

  const totalDue = rows.reduce((s, r) => s + r.due, 0);
  const totalEarned = rows.reduce((s, r) => s + r.earned, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-foreground">Affiliate Payments</h1>
      <p className="mt-1 text-subtext">
        Commission owed to referrers (10% of each referred user&apos;s delivered orders).
      </p>

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earned", value: totalEarned, color: "text-blue-600 bg-blue-50" },
          { label: "Total Paid", value: totalPaid, color: "text-green-600 bg-green-50" },
          { label: "Outstanding", value: totalDue, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Wallet className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{formatNpr(value)}</p>
            <p className="mt-1 text-sm text-subtext">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-foreground">No affiliates yet</p>
            <p className="mt-1 text-sm text-subtext">Users who refer others will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                  <th className="px-4 py-3">Affiliate</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 text-center">Referrals</th>
                  <th className="px-4 py-3 text-right">Earned</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{r.name ?? r.username ?? "—"}</p>
                      <p className="text-xs text-subtext">{r.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-subtext">{r.referralCode ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-foreground">{r.referralCount}</td>
                    <td className="px-4 py-3 text-right text-foreground">{formatNpr(r.earned)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatNpr(r.paid)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600">{formatNpr(r.due)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={r.due <= 0 || payingId === r.id}
                        onClick={() => markPaid(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {payingId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {r.due <= 0 ? "Settled" : "Mark Paid"}
                      </button>
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
