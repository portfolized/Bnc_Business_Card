"use client";

import { VIP_TIER_LABELS, type VipTier } from "@/lib/currency";
import type { PersonalInfo } from "./types";

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

// Per-tier metal finish. VIP cards are physical metal cards, so the preview
// shows a brushed-metal surface coloured to the chosen tier rather than one of
// the standard PVC templates.
const TIER_STYLES: Record<
  VipTier,
  { surface: string; text: string; sub: string; border: string; monogram: string }
> = {
  SILVER: {
    surface: "bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#8a97a8]",
    text: "text-gray-800",
    sub: "text-gray-600",
    border: "border-gray-500/30",
    monogram: "bg-gray-600",
  },
  GOLD: {
    surface: "bg-gradient-to-br from-[#fff3c4] via-[#e3b341] to-[#9c7016]",
    text: "text-[#3a2c05]",
    sub: "text-[#5b4710]",
    border: "border-[#7a5e12]/40",
    monogram: "bg-[#7a5e12]",
  },
  PLATINUM: {
    surface: "bg-gradient-to-br from-[#fdfdfd] via-[#dde4ed] to-[#9aa6b6]",
    text: "text-slate-800",
    sub: "text-slate-600",
    border: "border-slate-500/30",
    monogram: "bg-slate-600",
  },
};

function MetalFace({
  side,
  info,
  tier,
}: {
  side: "front" | "back";
  info: PersonalInfo;
  tier: VipTier;
}) {
  const s = TIER_STYLES[tier];
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl ${s.surface}`}>
      {/* Brushed-metal sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/50 via-transparent to-white/30" />
      <div className="absolute -inset-y-10 left-1/3 w-1/4 rotate-12 bg-white/25 blur-md" />

      {side === "front" ? (
        <div className={`relative flex h-full flex-col justify-center gap-2.5 p-6 ${s.text}`}>
          <div>
            <h4 className="text-xl font-bold leading-tight sm:text-2xl">{info.fullName}</h4>
            {info.role && (
              <p className={`mt-0.5 text-[11px] font-medium uppercase tracking-widest ${s.sub}`}>{info.role}</p>
            )}
          </div>
          <div className={`w-full max-w-[260px] space-y-0.5 border-t ${s.border} pt-2.5 text-[10px] sm:text-[11px] ${s.sub}`}>
            {info.phone && <p className="truncate">{info.phone}</p>}
            {info.email && <p className="truncate">{info.email}</p>}
            {info.website && <p className="truncate">{stripProtocol(info.website)}</p>}
            {info.address && <p className="truncate">{info.address}</p>}
          </div>
        </div>
      ) : (
        <div className={`relative flex h-full flex-col items-center justify-center gap-3 p-6 ${s.text}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${s.monogram} text-lg font-bold text-white`}>
            {info.fullName.charAt(0) || "B"}
          </div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${s.sub}`}>
            {VIP_TIER_LABELS[tier]} Metal
          </p>
          <p className={`text-[9px] font-semibold uppercase tracking-widest ${s.sub}`}>NFC Enabled</p>
        </div>
      )}
    </div>
  );
}

/**
 * Two-faced preview for a VIP metal card, coloured to the chosen tier
 * (Silver / Gold / Platinum). Mirrors the layout of OrderCardPreview.
 */
export default function VipCardPreview({ info, tier }: { info: PersonalInfo; tier: VipTier }) {
  const face = (side: "front" | "back", label: string) => (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
        <MetalFace side={side} info={info} tier={tier} />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {face("front", "Front")}
      {face("back", "Back")}
    </div>
  );
}
