"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { formatNpr } from "@/lib/currency";

type OrderLite = { id: string; totalAmount: number; quantity: number; shippingAddress: { name?: string } | null };

export default function MockPayPage() {
  const [order, setOrder] = useState<OrderLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("orderId");
    setOrderId(id);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: OrderLite[]) => setOrder(Array.isArray(list) ? list.find((o) => o.id === id) ?? null : null))
      .finally(() => setLoading(false));
  }, []);

  const pay = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const res = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pidx: `MOCK-${orderId}` }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = "/dashboard/orders/verify?pidx=MOCK-" + orderId + "&status=Completed";
      } else {
        alert(data.error ?? "Mock payment failed.");
        setPaying(false);
      }
    } catch {
      alert("Network error.");
      setPaying(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-[#5C2D91] to-[#3a1c5e] px-4 py-16">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#5C2D91] px-5 py-4 text-white">
          <span className="text-lg font-bold">khalti</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Test mode</span>
        </div>

        <div className="px-6 py-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#5C2D91]" /></div>
          ) : (
            <>
              <p className="text-center text-sm text-gray-500">Pay BNC Business Card</p>
              <p className="mt-1 text-center text-3xl font-extrabold text-gray-900">
                {order ? formatNpr(order.totalAmount) : "—"}
              </p>
              <p className="mt-1 text-center text-xs text-gray-400">
                {order ? `${order.quantity} card${order.quantity > 1 ? "s" : ""} · ${order.shippingAddress?.name ?? ""}` : ""}
              </p>

              <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500">
                This is a simulated payment screen used because no Khalti key is set.
                Paste a test key in <code className="font-mono">.env</code> to use the real Khalti sandbox.
              </div>

              <button
                onClick={pay}
                disabled={paying || !order}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C2D91] py-3 text-sm font-semibold text-white transition hover:bg-[#4a2475] disabled:opacity-60"
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {paying ? "Processing…" : "Pay Now (Test)"}
              </button>
              <a
                href="/dashboard/orders"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Cancel
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
