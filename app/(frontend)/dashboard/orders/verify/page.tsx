"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type State = "verifying" | "success" | "failed";

export default function PaymentVerifyPage() {
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState("Confirming your payment with Khalti…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get("pidx");
    const khaltiStatus = params.get("status");

    if (!pidx) {
      setState("failed");
      setMessage("Missing payment reference.");
      return;
    }
    if (khaltiStatus && khaltiStatus !== "Completed") {
      setState("failed");
      setMessage(`Payment was not completed (${khaltiStatus}). Your order is kept as a draft.`);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pidx }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setState("success");
          setMessage("Payment confirmed — your order has been placed!");
          setTimeout(() => { window.location.href = "/dashboard/orders"; }, 1800);
        } else {
          setState("failed");
          setMessage(data.error ?? `Payment status: ${data.status ?? "unknown"}. Your order is kept as a draft.`);
        }
      } catch {
        setState("failed");
        setMessage("Could not verify payment. Please check your orders.");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {state === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
            <h1 className="mt-5 text-xl font-bold text-gray-900">Verifying payment</h1>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h1 className="mt-5 text-xl font-bold text-gray-900">Payment successful</h1>
          </>
        )}
        {state === "failed" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-5 text-xl font-bold text-gray-900">Payment not completed</h1>
          </>
        )}
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <Link
          href="/dashboard/orders"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          Go to My Orders
        </Link>
      </div>
    </div>
  );
}
