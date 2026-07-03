"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { paymentLogoUrl } from "@/lib/paymentOptions";

// Deterministic accent color for the lettered fallback badge.
const COLORS = ["#7c3aed", "#2563eb", "#059669", "#db2777", "#ea580c", "#0891b2", "#4f46e5", "#ca8a04"];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

/**
 * A consistent logo chip for a payment method (wallet/bank), used on both the
 * admin and customer sides. Shows the brand's fetched logo, falling back to a
 * colored lettered badge when no logo is available or the image fails to load.
 */
export default function PaymentLogo({
  name,
  size = 32,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const url = paymentLogoUrl(name);
  const [failed, setFailed] = useState(false);

  // Reset the error state when the method name changes.
  useEffect(() => setFailed(false), [name]);

  const box = { width: size, height: size } as const;

  if (!url || failed) {
    const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${className}`}
        style={{ ...box, backgroundColor: colorFor(name || "?"), fontSize: Math.round(size * 0.42) }}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-gray-200 ${className}`}
      style={box}
    >
      <img
        src={url}
        alt={`${name} logo`}
        onError={() => setFailed(true)}
        style={{ width: Math.round(size * 0.72), height: Math.round(size * 0.72), objectFit: "contain" }}
      />
    </span>
  );
}
