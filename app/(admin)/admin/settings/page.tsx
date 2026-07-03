"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, KeyRound, Tag, QrCode, Plus, Trash2, ChevronDown } from "lucide-react";
import { formatNpr, DEFAULT_CARD_PRICES, type CardPrices } from "@/lib/currency";
import ImageUpload from "@/components/ui/ImageUpload";
import PaymentLogo from "@/components/ui/PaymentLogo";
import { PAYMENT_WALLETS, PAYMENT_BANKS, PAYMENT_OPTIONS } from "@/lib/paymentOptions";

// ─── Payment methods ─────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string;
  name: string;
  qrUrl: string | null;
  description: string;
  active: boolean;
  sortOrder: number;
};

// A single editable payment method: name, QR upload, details, active toggle.
function MethodCard({
  method,
  inputCls,
  onSaved,
  onDeleted,
}: {
  method: PaymentMethod;
  inputCls: string;
  onSaved: (m: PaymentMethod) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(method.name);
  const [qrUrl, setQrUrl] = useState<string | null>(method.qrUrl);
  const [description, setDescription] = useState(method.description);
  const [active, setActive] = useState(method.active);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== method.name ||
    qrUrl !== method.qrUrl ||
    description !== method.description ||
    active !== method.active;

  async function save() {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, qrUrl, description, active }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onSaved(data as PaymentMethod);
        setDone(true);
      } else {
        setError(data.error ?? "Failed to save.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this payment method?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(method.id);
      else setError("Failed to delete.");
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <ImageUpload
          label="QR code"
          value={qrUrl}
          onChange={setQrUrl}
          className="h-28 w-28"
          rounded="lg"
          placeholder="Upload QR"
        />
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Wallet / Bank</label>
            <div className="flex items-center gap-2.5">
              <PaymentLogo name={name} size={40} />
              <div className="relative flex-1">
                <select
                  value={name}
                  onChange={(e) => { setName(e.target.value); setDone(false); }}
                  className={`${inputCls} appearance-none pr-9`}
                >
                  <option value="" disabled>Select a wallet or bank…</option>
                  {/* Preserve a legacy/custom name that isn't in the lists. */}
                  {name && !PAYMENT_OPTIONS.includes(name) && <option value={name}>{name}</option>}
                  <optgroup label="Wallets">
                    {PAYMENT_WALLETS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </optgroup>
                  <optgroup label="Banks">
                    {PAYMENT_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment details</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDone(false); }}
              rows={3}
              placeholder="Account name, number, wallet ID, or instructions shown to the customer."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={active} onChange={(e) => { setActive(e.target.checked); setDone(false); }} className="h-4 w-4 rounded border-gray-300" />
          Active (shown to customers)
        </label>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {done && !dirty && <span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3.5 w-3.5" /> Saved</span>}
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodsForm({ inputCls }: { inputCls: string }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/payment-methods")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMethods(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function add() {
    setAdding(true);
    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", description: "", active: true }),
      });
      if (res.ok) {
        const created = (await res.json()) as PaymentMethod;
        setMethods((prev) => [...prev, created]);
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Payment Methods</h2>
          <p className="text-xs text-subtext">QR + details shown to customers at checkout. They pay and upload a screenshot for you to approve.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-4">
          {methods.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-3.5 py-3 text-sm text-gray-500">No payment methods yet. Add one so customers can pay.</p>
          )}
          {methods.map((m) => (
            <MethodCard
              key={m.id}
              method={m}
              inputCls={inputCls}
              onSaved={(saved) => setMethods((prev) => prev.map((x) => (x.id === saved.id ? saved : x)))}
              onDeleted={(id) => setMethods((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
          <button
            type="button"
            onClick={add}
            disabled={adding}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add payment method
          </button>
        </div>
      )}
    </div>
  );
}

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

      <div className="mt-6">
        <PaymentMethodsForm inputCls={inputCls} />
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
