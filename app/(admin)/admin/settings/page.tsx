"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, KeyRound, Tag } from "lucide-react";
import { formatNpr, DEFAULT_CARD_PRICES, type CardPrices } from "@/lib/currency";

// The editable price fields, in display order.
const PRICE_FIELDS: { key: keyof CardPrices; label: string; hint: string }[] = [
  { key: "business", label: "Business Card", hint: "Standard card price." },
  { key: "vipSilver", label: "VIP — Silver", hint: "" },
  { key: "vipGold", label: "VIP — Gold", hint: "" },
  { key: "vipPlatinum", label: "VIP — Platinum", hint: "" },
];

function CardPriceForm({ inputCls }: { inputCls: string }) {
  const [prices, setPrices] = useState<Record<keyof CardPrices, string>>({
    business: "",
    vipSilver: "",
    vipGold: "",
    vipPlatinum: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p: CardPrices = (d && d.prices) || DEFAULT_CARD_PRICES;
        setPrices({
          business: String(p.business),
          vipSilver: String(p.vipSilver),
          vipGold: String(p.vipGold),
          vipPlatinum: String(p.vipPlatinum),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof CardPrices, value: string) =>
    setPrices((prev) => ({ ...prev, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    const payload: Partial<CardPrices> = {};
    for (const { key } of PRICE_FIELDS) {
      const n = Number(prices[key]);
      if (!Number.isFinite(n) || n < 0) {
        setError("Enter a valid price for every card type.");
        return;
      }
      payload[key] = n;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.prices) {
        const p = data.prices as CardPrices;
        setPrices({
          business: String(p.business),
          vipSilver: String(p.vipSilver),
          vipGold: String(p.vipGold),
          vipPlatinum: String(p.vipPlatinum),
        });
        setDone(true);
      } else {
        setError(data.error ?? "Failed to update prices.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Card Prices</h2>
          <p className="text-xs text-subtext">Price per card type used for new orders (NPR).</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        {PRICE_FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{label} (NPR)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rs</span>
              <input
                type="number"
                min={0}
                step={1}
                value={loading ? "" : prices[key]}
                disabled={loading}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={loading ? "Loading…" : String(DEFAULT_CARD_PRICES[key])}
                className={inputCls}
              />
            </div>
            {!loading && Number.isFinite(Number(prices[key])) && (
              <p className="mt-1 text-[11px] text-gray-400">
                {hint ? `${hint} ` : ""}Displayed as {formatNpr(Number(prices[key]))}.
              </p>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {done && (
          <p className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-4 w-4" /> Prices updated.
          </p>
        )}

        <button
          type="submit"
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save Prices"}
        </button>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (next.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setError(data.error ?? "Failed to update password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-subtext">Manage pricing and your admin account.</p>

      <div className="mt-8">
        <CardPriceForm inputCls={inputCls} />
      </div>

      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Change Password</h2>
            <p className="text-xs text-subtext">Update the password you use to sign in.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {done && (
            <p className="flex items-center gap-1.5 text-sm text-green-600">
              <Check className="h-4 w-4" /> Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
