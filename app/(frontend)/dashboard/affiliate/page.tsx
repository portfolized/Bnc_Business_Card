"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { formatNpr } from "@/lib/currency";

type Referral = {
  id: string;
  name: string | null;
  email: string;
  joinedAt: string;
  orders: number;
};

type AffiliateData = {
  code: string;
  referralCount: number;
  totalEarnings: number;
  referrals: Referral[];
};

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    fetch("/api/affiliate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (type: "code" | "link") => {
    const text =
      type === "code"
        ? data!.code
        : `${window.location.origin}/signup?ref=${data!.code}`;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-full bg-gray-50 px-6 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate</h1>
        <p className="mt-1 text-sm text-gray-500">
          Earn 10% commission on every order placed by someone you refer.
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
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Referral Code", value: data.code, mono: true },
              { label: "Total Referrals", value: String(data.referralCount) },
              { label: "Total Earnings", value: formatNpr(data.totalEarnings) },
            ].map(({ label, value, mono }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`mt-1 text-2xl font-bold text-gray-900 ${mono ? "font-mono tracking-widest" : ""}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Share your link */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">Your Referral Link</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm text-gray-600 truncate">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/signup?ref=${data.code}`
                    : `/signup?ref=${data.code}`}
                </div>
                <button
                  type="button"
                  onClick={() => copy("link")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied === "link" ? (
                    <><Check className="h-4 w-4 text-green-500" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Share this link — when someone signs up and places an order, you earn 10% commission automatically.
              </p>
            </div>
          </div>

          {/* Referrals table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Referred Users ({data.referralCount})
              </h2>
            </div>
            {data.referrals.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                No referrals yet. Share your link to start earning.
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-center">Orders</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.referrals.map((r) => (
                    <tr key={r.id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{r.name || "—"}</td>
                      <td className="px-5 py-3.5 text-gray-500">{r.email}</td>
                      <td className="px-5 py-3.5 text-center text-gray-700">{r.orders}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{timeAgo(r.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
