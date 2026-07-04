"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Copy,
  Check,
  Handshake,
  Clock,
  XCircle,
  Percent,
  Wallet,
  Users,
} from "lucide-react";
import { formatNpr } from "@/lib/currency";

type CreditedOrder = {
  id: string;
  status: string;
  total: number;
  discount: number;
  commission: number;
  createdAt: string;
  customer: string;
};

type AffiliateData = {
  status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  code: string | null;
  note?: string | null;
  commissionRate?: number;
  discountRate?: number;
  referralCount?: number;
  orderCount?: number;
  earned?: number;
  paid?: number;
  due?: number;
  orders?: CreditedOrder[];
};

function pct(rate?: number) {
  return `${Math.round((rate ?? 0) * 100)}%`;
}

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/affiliate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const apply = async () => {
    setApplying(true);
    setApplyError("");
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setData((prev) => ({ ...(prev ?? { code: null }), status: "PENDING" }));
      } else {
        setApplyError(d.error ?? "Couldn't submit your application.");
      }
    } catch {
      setApplyError("Network error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const copy = async (type: "code" | "link") => {
    if (!data?.code) return;
    const text = type === "code" ? data.code : `${window.location.origin}/signup?ref=${data.code}`;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-full bg-gray-50 px-6 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate</h1>
        <p className="mt-1 text-sm text-gray-500">
          Earn commission when people order using your code.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <p className="text-sm text-gray-400">Failed to load affiliate data.</p>
        </div>
      ) : data.status === "PENDING" ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-amber-900">Application under review</h2>
          <p className="mt-1.5 text-sm text-amber-700">
            Thanks for applying! An admin will review your request and approve your affiliate code soon.
          </p>
        </div>
      ) : data.status !== "APPROVED" ? (
        /* NONE or REJECTED → show the apply form */
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Handshake className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-center text-lg font-bold text-gray-900">
              Become a BNC affiliate
            </h2>
            <p className="mt-1.5 text-center text-sm text-gray-500">
              Get your own code, share it, and earn commission on every order placed with it.
            </p>

            {data.status === "REJECTED" && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">Your previous application was declined.</span>
                  {data.note ? <> Reason: {data.note}</> : null} You can apply again below.
                </span>
              </div>
            )}

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Why do you want to join? <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Tell us how you'll promote BNC — your audience, socials, etc."
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {applyError && <p className="mt-2 text-sm text-red-500">{applyError}</p>}

            <button
              type="button"
              onClick={apply}
              disabled={applying}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-4 w-4" />}
              {applying ? "Submitting…" : "Apply to become an affiliate"}
            </button>
          </div>
        </div>
      ) : (
        /* APPROVED → the affiliate dashboard */
        <div className="space-y-6">
          {/* Rate + earnings stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Your Code", value: data.code ?? "—", mono: true, icon: Handshake },
              { label: "Commission Rate", value: pct(data.commissionRate), icon: Percent },
              { label: "Total Earned", value: formatNpr(data.earned ?? 0), icon: Wallet },
              { label: "Outstanding", value: formatNpr(data.due ?? 0), icon: Wallet },
            ].map(({ label, value, mono, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
                <p className={`mt-1.5 text-xl font-bold text-gray-900 ${mono ? "font-mono tracking-widest" : ""}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Discount note */}
          {(data.discountRate ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Percent className="h-4 w-4 shrink-0" />
              Buyers who use your code get <span className="font-semibold">{pct(data.discountRate)} off</span> their order.
            </div>
          )}

          {/* Share your link */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">Share your code</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm text-gray-600">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/signup?ref=${data.code}`
                    : `/signup?ref=${data.code}`}
                </div>
                <button
                  type="button"
                  onClick={() => copy("link")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied === "link" ? <><Check className="h-4 w-4 text-green-500" /> Copied</> : <><Copy className="h-4 w-4" /> Link</>}
                </button>
                <button
                  type="button"
                  onClick={() => copy("code")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied === "code" ? <><Check className="h-4 w-4 text-green-500" /> Copied</> : <><Copy className="h-4 w-4" /> Code</>}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Buyers can enter your code at checkout, or sign up with your link — either way you earn {pct(data.commissionRate)} commission.
              </p>
            </div>
          </div>

          {/* Credited orders */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <Users className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">
                Orders with your code ({data.orderCount ?? 0})
              </h2>
            </div>
            {(data.orders?.length ?? 0) === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                No orders yet. Share your code to start earning.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full whitespace-nowrap text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Order total</th>
                      <th className="px-5 py-3 text-right">Your commission</th>
                      <th className="px-5 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.orders!.map((o) => (
                      <tr key={o.id} className="transition hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-medium text-gray-800">{o.customer}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[o.status] ?? STATUS_BADGE.DRAFT}`}>
                            {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-600">{formatNpr(o.total)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{formatNpr(o.commission)}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{timeAgo(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">
            Commission is earned once an order is delivered. Payouts are settled by our team.
          </p>
        </div>
      )}
    </div>
  );
}
