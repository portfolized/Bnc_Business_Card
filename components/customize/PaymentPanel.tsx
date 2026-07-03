"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Check, QrCode, Upload } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import PaymentLogo from "@/components/ui/PaymentLogo";
import { formatNpr } from "@/lib/currency";

type Method = { id: string; name: string; qrUrl: string | null; description: string };

const BRAND = "#5C2D91";

/**
 * The manual-payment step of checkout, in two pages:
 *   1. Pick a payment method and read its QR + details (pay out-of-band).
 *   2. Upload a screenshot as proof and submit.
 * Submitting posts to /api/orders/checkout with the given `payload` (the full
 * order form for a new order, or `{ orderId }` to resubmit proof for an
 * existing one).
 */
export default function PaymentPanel({
  amountNpr,
  payload,
  onSuccess,
  onBack,
}: {
  amountNpr: number;
  payload: Record<string, unknown>;
  /** Called after the order/proof is submitted successfully. */
  onSuccess: () => void;
  /** Optional "back" affordance (e.g. to return to the details step). */
  onBack?: () => void;
}) {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [step, setStep] = useState<"method" | "upload">("method");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMethods(Array.isArray(d) ? d : []))
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = methods.find((m) => m.id === selectedId) ?? null;

  const goToUpload = () => {
    if (!selected) {
      setError("Please choose a payment method.");
      return;
    }
    setError("");
    setStep("upload");
  };

  const submit = async () => {
    setError("");
    if (!selected) {
      setError("Please choose a payment method.");
      return;
    }
    if (!proofUrl) {
      setError("Please upload a screenshot of your payment.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, paymentMethod: selected.name, paymentProofUrl: proofUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(true);
        return;
      }
      setError(data.error ?? "Failed to submit payment.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-gray-900">Payment submitted</h3>
        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
          Your order has been placed and is <span className="font-medium text-gray-700">awaiting approval</span>.
          We&apos;ll confirm it once your payment is verified.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="mt-7 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Done
        </button>
      </div>
    );
  }

  // ─── Step indicator ──────────────────────────────────────────────────────────
  const steps = [
    { key: "method", n: 1, label: "Pay", icon: QrCode },
    { key: "upload", n: 2, label: "Upload proof", icon: Upload },
  ] as const;

  const StepBar = (
    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3.5">
      {steps.map((s, i) => {
        const isActive = step === s.key;
        const isDone = s.key === "method" && step === "upload";
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition ${
                  isActive ? "text-white" : isDone ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}
                style={isActive ? { backgroundColor: BRAND } : undefined}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : s.n}
              </span>
              <span className={`text-xs font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i === 0 && <span className="h-px w-6 bg-gray-200 sm:w-10" />}
          </div>
        );
      })}
    </div>
  );

  // ─── Loading / empty ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }
  if (methods.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 px-6 py-8">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No payment methods are available yet. Please try again later.
          </p>
        </div>
        {onBack && (
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {StepBar}

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Amount */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND}, #3a1c5e)` }}
        >
          <span className="text-sm opacity-90">Amount to pay</span>
          <span className="text-xl font-bold">{formatNpr(amountNpr)}</span>
        </div>

        {step === "method" ? (
          <>
            {/* Method picker */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment method</label>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => { setSelectedId(e.target.value); setError(""); }}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3.5 py-2.5 pr-9 text-sm text-gray-800 outline-none focus:border-[#5C2D91]/40 focus:ring-2 focus:ring-[#5C2D91]/10"
                >
                  <option value="">Choose a payment method…</option>
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* QR + details */}
            {selected ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-800">
                  <PaymentLogo name={selected.name} size={24} />
                  {selected.name}
                </div>
                <div className="p-4">
                  {selected.qrUrl ? (
                    <div className="flex justify-center rounded-xl bg-gray-50 p-3">
                      {/* Show the QR as large as the modal allows. object-contain keeps
                          the whole image visible; tall phone screenshots grow by height
                          (up to 70vh) so the QR stays big and scannable. */}
                      <img
                        src={selected.qrUrl}
                        alt={`${selected.name} QR`}
                        className="h-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-400">No QR provided — use the details below.</p>
                  )}
                  {selected.description && (
                    <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 px-3.5 py-3 text-sm text-gray-700">
                      {selected.description}
                    </p>
                  )}
                  <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-400">
                    <QrCode className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Scan the QR or use the details above to pay, then continue to upload your screenshot.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
                Select a payment method to see its QR and details.
              </div>
            )}
          </>
        ) : (
          <>
            {/* Upload step: summary + big dropzone */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <PaymentLogo name={selected?.name ?? ""} size={40} />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Paying with</p>
                  <p className="truncate text-sm font-semibold text-gray-900">{selected?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("method")}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#5C2D91] transition hover:bg-[#5C2D91]/5"
              >
                Change
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment screenshot</label>
              <ImageUpload
                value={proofUrl}
                onChange={setProofUrl}
                className="h-56 w-full"
                rounded="xl"
                placeholder="Upload screenshot"
              />
              <p className="mt-2 text-xs text-gray-400">
                Upload a clear screenshot of your completed payment. An admin will verify it and confirm your order.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-3 border-t border-gray-100 px-6 py-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {step === "method" ? (
          <div className="flex items-center justify-end gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              type="button"
              onClick={goToUpload}
              disabled={!selected}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              I&apos;ve paid — upload proof <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setStep("method"); setError(""); }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !proofUrl}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting…" : "Submit payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
