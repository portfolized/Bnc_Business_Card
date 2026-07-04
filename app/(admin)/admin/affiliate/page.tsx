"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Check,
  X,
  Wallet,
  Percent,
  Handshake,
  Clock,
  Users,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { formatNpr } from "@/lib/currency";
import { PageHeader, StatCard, Tabs, EmptyState } from "@/components/admin/ui";

// ─── Types ──────────────────────────────────────────────────────────────────

type Globals = { commission: number; discount: number };

type Application = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  note: string | null;
  appliedAt: string | null;
  joinedAt: string;
};

type Affiliate = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  referralCode: string | null;
  approvedAt: string | null;
  commissionOverride: number | null;
  discountOverride: number | null;
  commissionRate: number;
  discountRate: number;
  referralCount: number;
  orderCount: number;
  earned: number;
  paid: number;
  due: number;
};

type Detail = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  referralCode: string | null;
  status: string;
  note: string | null;
  appliedAt: string | null;
  approvedAt: string | null;
  joinedAt: string;
  commissionOverride: number | null;
  discountOverride: number | null;
  commissionRate: number;
  discountRate: number;
  earned: number;
  paid: number;
  due: number;
  referrals: { id: string; name: string | null; email: string; joinedAt: string }[];
  orders: {
    id: string;
    status: string;
    paymentStatus: string;
    total: number;
    discount: number;
    commission: number;
    createdAt: string;
    customer: string;
  }[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const toPct = (rate: number) => Math.round(rate * 100);
const pctLabel = (rate: number) => `${toPct(rate)}%`;
const shortId = (id: string) => id.slice(-8).toUpperCase();

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
};

function Avatar({ name, email, image }: { name: string | null; email: string; image: string | null }) {
  const initial = (name || email || "?").charAt(0).toUpperCase();
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-bold text-white">
      {initial}
    </div>
  );
}

// ─── Confirm modal (approve / reject) ─────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  withReason,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  withReason?: boolean;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${danger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {withReason && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Reason (optional — shown to the applicant)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="e.g. Not enough audience info provided."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Per-person rate editor ───────────────────────────────────────────────────

function RateEditor({
  detail,
  onSaved,
}: {
  detail: Detail;
  onSaved: (d: Partial<Detail>) => void;
}) {
  // Empty string means "use the global default" (clears the override).
  const [commission, setCommission] = useState(detail.commissionOverride != null ? String(toPct(detail.commissionOverride)) : "");
  const [discount, setDiscount] = useState(detail.discountOverride != null ? String(toPct(detail.discountOverride)) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body = {
        action: "setRate",
        commissionRate: commission.trim() === "" ? null : Math.min(1, Math.max(0, Number(commission) / 100)),
        discountRate: discount.trim() === "" ? null : Math.min(1, Math.max(0, Number(discount) / 100)),
      };
      const res = await fetch(`/api/admin/affiliate/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const d = await res.json();
        onSaved({
          commissionOverride: d.commissionOverride,
          discountOverride: d.discountOverride,
          commissionRate: d.commissionRate,
          discountRate: d.discountRate,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
        <Percent className="h-3.5 w-3.5" /> This person&apos;s rates
      </h4>
      <p className="mb-3 text-[11px] text-gray-400">
        Leave blank to use the global rate. Effective now: {pctLabel(detail.commissionRate)} commission · {pctLabel(detail.discountRate)} buyer discount.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Commission %</label>
          <input
            type="number" min={0} max={100}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="global"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Buyer discount %</label>
          <input
            type="number" min={0} max={100}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="global"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
        {saved ? "Saved" : "Save rates"}
      </button>
    </div>
  );
}

// ─── Affiliate detail modal ───────────────────────────────────────────────────

function DetailModal({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/affiliate/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const markPaid = async () => {
    if (!detail) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/admin/affiliate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid" }),
      });
      if (res.ok) {
        const d = await res.json();
        setDetail((prev) => (prev ? { ...prev, paid: d.paid, due: d.due } : prev));
        onChanged();
      }
    } finally {
      setPaying(false);
    }
  };

  const revoke = async (reason: string) => {
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/affiliate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      if (res.ok) {
        setConfirmRevoke(false);
        onChanged();
        onClose();
      }
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {loading || !detail ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <Avatar name={detail.name} email={detail.email} image={detail.image} />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{detail.name ?? detail.username ?? "—"}</h2>
                  <p className="text-sm text-gray-400">{detail.email}</p>
                  {detail.referralCode && (
                    <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">{detail.referralCode}</span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* Earnings */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Earned", value: formatNpr(detail.earned) },
                  { label: "Paid", value: formatNpr(detail.paid) },
                  { label: "Due", value: formatNpr(detail.due), amber: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className={`text-lg font-bold ${s.amber ? "text-amber-600" : "text-gray-900"}`}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markPaid}
                  disabled={paying || detail.due <= 0}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {paying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                  {detail.due <= 0 ? "Settled" : "Mark all paid"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" /> Revoke affiliate
                </button>
              </div>

              {/* Rates */}
              <RateEditor detail={detail} onSaved={(patch) => { setDetail((prev) => (prev ? { ...prev, ...patch } : prev)); onChanged(); }} />

              {/* Referred users */}
              <div className="rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-800">Referred sign-ups ({detail.referrals.length})</h4>
                </div>
                {detail.referrals.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">No referred sign-ups.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {detail.referrals.map((r) => (
                      <li key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="font-medium text-gray-700">{r.name ?? "—"}</span>
                        <span className="text-gray-400">{r.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Credited orders */}
              <div className="rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  <h4 className="text-sm font-semibold text-gray-800">Orders with their code ({detail.orders.length})</h4>
                </div>
                {detail.orders.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">No orders credited yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full whitespace-nowrap text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-2.5">Order</th>
                          <th className="px-4 py-2.5">Customer</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Total</th>
                          <th className="px-4 py-2.5 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detail.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{shortId(o.id)}</td>
                            <td className="px-4 py-2.5 text-gray-700">{o.customer}</td>
                            <td className="px-4 py-2.5">
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[o.status] ?? STATUS_BADGE.DRAFT}`}>
                                {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-600">{formatNpr(o.total)}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatNpr(o.commission)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {confirmRevoke && (
        <ConfirmModal
          title="Revoke this affiliate?"
          message="Their code will stop working immediately and they'll be moved to rejected. Existing recorded commission is kept."
          confirmLabel="Revoke"
          danger
          withReason
          busy={revoking}
          onConfirm={revoke}
          onClose={() => setConfirmRevoke(false)}
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminAffiliatePage() {
  const [globals, setGlobals] = useState<Globals>({ commission: 0.1, discount: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  // Global rate inputs (percent strings).
  const [commissionInput, setCommissionInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [savingGlobals, setSavingGlobals] = useState(false);
  const [savedGlobals, setSavedGlobals] = useState(false);

  const [confirm, setConfirm] = useState<{ action: "approve" | "reject"; user: Application } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending">("all");

  const load = useCallback(() => {
    fetch("/api/admin/affiliate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setGlobals(d.globals);
        setCommissionInput(String(toPct(d.globals.commission)));
        setDiscountInput(String(toPct(d.globals.discount)));
        setApplications(d.applications ?? []);
        setAffiliates(d.affiliates ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveGlobals = async () => {
    setSavingGlobals(true);
    setSavedGlobals(false);
    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commission: Math.min(1, Math.max(0, Number(commissionInput) / 100)),
          discount: Math.min(1, Math.max(0, Number(discountInput) / 100)),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setGlobals(d.globals);
        setSavedGlobals(true);
        setTimeout(() => setSavedGlobals(false), 2000);
        load();
      }
    } finally {
      setSavingGlobals(false);
    }
  };

  const runConfirm = async (reason: string) => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      const res = await fetch(`/api/admin/affiliate/${confirm.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: confirm.action, reason }),
      });
      if (res.ok) {
        setConfirm(null);
        load();
      }
    } finally {
      setConfirmBusy(false);
    }
  };

  const totalDue = affiliates.reduce((s, r) => s + r.due, 0);
  const totalEarned = affiliates.reduce((s, r) => s + r.earned, 0);
  const totalPaid = affiliates.reduce((s, r) => s + r.paid, 0);

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <PageHeader
        icon={Handshake}
        eyebrow="Program"
        title="Affiliate Program"
        subtitle="Approve affiliates, set commission & buyer-discount rates, and settle payouts."
      />

      {/* Global rates */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Percent className="h-4 w-4 text-indigo-500" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Global rates</h2>
            <p className="text-xs text-subtext">Applied to every affiliate without a per-person override.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Commission %</label>
            <input
              type="number" min={0} max={100}
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Buyer discount %</label>
            <input
              type="number" min={0} max={100}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            onClick={saveGlobals}
            disabled={savingGlobals}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingGlobals ? <Loader2 className="h-4 w-4 animate-spin" /> : savedGlobals ? <Check className="h-4 w-4" /> : null}
            {savedGlobals ? "Saved" : "Save global rates"}
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Earned" value={formatNpr(totalEarned)} icon={TrendingUp} grad="from-blue-500 to-indigo-500" />
        <StatCard label="Total Paid" value={formatNpr(totalPaid)} icon={Wallet} grad="from-emerald-500 to-teal-500" />
        <StatCard label="Outstanding" value={formatNpr(totalDue)} icon={Clock} grad="from-amber-500 to-orange-500" />
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs
          value={tab}
          onChange={(k) => setTab(k as "all" | "pending")}
          tabs={[
            { key: "all", label: "All Affiliates", count: affiliates.length, icon: Handshake },
            { key: "pending", label: "Pending Affiliates", count: applications.length, icon: Clock },
          ]}
        />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : tab === "pending" ? (
        /* ── Pending affiliates ── */
        <div className="mt-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white">
              <EmptyState icon={Clock} title="No pending applications" description="New affiliate applications will appear here for review." />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {applications.map((a) => (
                <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} email={a.email} image={a.image} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{a.name ?? a.username ?? "—"}</p>
                      <p className="truncate text-xs text-subtext">{a.email}</p>
                    </div>
                  </div>
                  {a.note && (
                    <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">{a.note}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirm({ action: "approve", user: a })}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ action: "reject", user: a })}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── All affiliates ── */
        <div className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {affiliates.length === 0 ? (
              <EmptyState icon={Handshake} title="No affiliates yet" description="Approve a pending application to add your first affiliate." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                      <th className="px-4 py-3">Affiliate</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3 text-center">Comm.</th>
                      <th className="px-4 py-3 text-center">Disc.</th>
                      <th className="px-4 py-3 text-center">Orders</th>
                      <th className="px-4 py-3 text-right">Earned</th>
                      <th className="px-4 py-3 text-right">Due</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliates.map((r) => (
                      <tr key={r.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setDetailId(r.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={r.name} email={r.email} image={r.image} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{r.name ?? r.username ?? "—"}</p>
                              <p className="truncate text-xs text-subtext">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-subtext">{r.referralCode ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-foreground">{pctLabel(r.commissionRate)}</span>
                          {r.commissionOverride != null && <span className="ml-1 text-[10px] font-semibold text-indigo-500">•</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-foreground">{pctLabel(r.discountRate)}</span>
                          {r.discountOverride != null && <span className="ml-1 text-[10px] font-semibold text-indigo-500">•</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-foreground">{r.orderCount}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatNpr(r.earned)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-600">{formatNpr(r.due)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDetailId(r.id); }}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-subtext">
            <span className="font-semibold text-indigo-500">•</span> marks a per-person rate override. Click a row to view their orders and set rates.
          </p>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.action === "approve" ? "Approve this affiliate?" : "Reject this application?"}
          message={
            confirm.action === "approve"
              ? `${confirm.user.name ?? confirm.user.email} will get a referral code and can start earning commission.`
              : `${confirm.user.name ?? confirm.user.email} won't receive a code. They can re-apply later.`
          }
          confirmLabel={confirm.action === "approve" ? "Yes, approve" : "Yes, reject"}
          danger={confirm.action === "reject"}
          withReason={confirm.action === "reject"}
          busy={confirmBusy}
          onConfirm={runConfirm}
          onClose={() => setConfirm(null)}
        />
      )}

      {detailId && (
        <DetailModal id={detailId} onClose={() => setDetailId(null)} onChanged={load} />
      )}
    </div>
  );
}
