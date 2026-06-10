"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode, type RefObject } from "react";
import {
  Lightbulb,
  Pencil,
  Printer,
  Phone,
  Mail,
  MapPin,
  Globe,
  Wifi,
  Ban,
  FileText,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import MotionWrapper from "./MotionWrapper";
import { BNC, BRAND_GRADIENT } from "@/lib/brand-colors";

const UI = {
  gray: "#9CA3AF",
  darkGray: "#374151",
  lightGray: "#D1D5DB",
  muted: "#E5E7EB",
} as const;

const CARD_W = 300;
const CARD_H = 189;
const CANVAS_H = 420;
const DONUT_SIZE = 260;

type Side = "traditional" | "bnc";

const BNC_STATS = {
  taps: { value: 847, fill: 88, label: "TOTAL TAPS" },
  downloads: { value: 312, fill: 74, label: "DOWNLOADS" },
  messages: { value: 156, fill: 62, label: "MESSAGES" },
} as const;

// ─── Stat Ring ────────────────────────────────────────────────────────────────
function StatRing({
  side,
  stroke,
  labelColor,
  value,
  fill,
  label,
}: {
  side: Side;
  stroke: string;
  labelColor: string;
  value: number;
  fill: number;
  label: string;
}) {
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const ringStroke = side === "traditional" ? UI.lightGray : stroke;
  const textColor = side === "traditional" ? UI.gray : labelColor;
  const offset = circumference - (fill / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative h-[52px] w-[52px] rounded-full ${
          side === "bnc" ? "shadow-[0_4px_14px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <svg className="h-[52px] w-[52px] -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke={UI.muted} strokeWidth="4" />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={ringStroke}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={side === "bnc" ? offset : circumference}
            strokeLinecap="round"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
            side === "traditional" ? "text-gray-400" : "text-foreground"
          }`}
        >
          {side === "traditional" ? "0" : value}
        </span>
      </div>
      <span
        className="whitespace-nowrap text-[8px] font-bold tracking-wider"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Feature Node ─────────────────────────────────────────────────────────────
function FeatureNode({
  side,
  icon: Icon,
  color,
  title,
  subtitle,
  disabled,
}: {
  side: Side;
  icon: typeof Lightbulb;
  color: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  const iconColor = side === "traditional" ? UI.gray : color;
  const titleColor = side === "traditional" ? UI.gray : color;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${disabled ? "opacity-60" : ""}`}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/[0.04] ${
          side === "traditional" ? "grayscale" : ""
        }`}
        style={{
          boxShadow:
            side === "bnc"
              ? `0 4px 16px ${color}28, 0 2px 6px rgba(0,0,0,0.06)`
              : "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold tracking-wide" style={{ color: titleColor }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Traditional paper card ───────────────────────────────────────────────────
function TraditionalPaperCard() {
  return (
    <div
      className="relative overflow-hidden rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={{
        width: CARD_W,
        height: CARD_H,
        transform: "rotate(-3deg)",
        background: "linear-gradient(160deg, #faf8f5 0%, #f0ebe3 50%, #e8e2d8 100%)",
      }}
    >
      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0h1v1H0z' fill='%23000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative flex h-full flex-col justify-between border border-[#d4cfc4] p-5">
        <div>
          <div className="mb-3 h-0.5 w-12 bg-gray-400" />
          <p className="font-serif text-lg font-bold text-gray-700">John Doe</p>
          <p className="font-serif text-xs italic text-gray-500">Sales Manager</p>
        </div>
        <div className="space-y-1 font-serif text-[11px] text-gray-600">
          <p>T: +977 9800000000</p>
          <p>E: john@company.com</p>
          <p>W: www.company.com</p>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-gray-400">
          Printed · Static · No Analytics
        </p>
      </div>
      {/* Worn corner fold */}
      <div
        className="absolute bottom-0 right-0 h-8 w-8"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)",
        }}
      />
    </div>
  );
}

// ─── BNC NFC card (front) ─────────────────────────────────────────────────────
function BNCCardFront() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[14px]"
      style={{
        background: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 60 Q30 20 60 60 T120 60' stroke='rgba(255,255,255,0.05)' fill='none'/%3E%3C/svg%3E"),
          linear-gradient(145deg, #0a0a0a 0%, #161616 50%, #0d0d0d 100%)
        `,
      }}
    >
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full"
        style={{ background: BRAND_GRADIENT }}
      />
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-white">Anurag Subedi</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: BNC.green }} />
              CEO · BNC Business Card
            </p>
          </div>
          <Image
            src="/logo.png"
            alt="BNC"
            width={36}
            height={36}
            className="rounded-full ring-2 ring-white/10"
            style={{ width: 36, height: 36 }}
          />
        </div>
        <div className="space-y-2">
          {[
            { Icon: Phone, text: "+977 976-1158811", dot: BNC.green },
            { Icon: Mail, text: "info@bncbusinesscard.com", dot: BNC.yellow },
            { Icon: MapPin, text: "Kausaltar, Bhaktapur", dot: BNC.red },
            { Icon: Globe, text: "www.bncbusinesscard.com", dot: BNC.orange },
          ].map(({ Icon, text, dot }) => (
            <div key={text} className="flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15"
                style={{ background: `${dot}20` }}
              >
                <Icon className="h-[9px] w-[9px] text-white/90" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] text-gray-300">{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
        <Wifi className="h-3 w-3 text-white/70" />
        <span className="text-[8px] font-bold text-white/70">NFC</span>
      </div>
    </div>
  );
}

// ─── BNC NFC card (back) ─────────────────────────────────────────────────────
function BNCCardBack() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[14px]"
      style={{
        background: `linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%)`,
      }}
    >
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full"
        style={{ background: BRAND_GRADIENT }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${BNC.green} 0%, transparent 55%),
            radial-gradient(circle at 70% 50%, ${BNC.orange} 0%, transparent 50%)`,
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-2">
        <div className="rounded-full p-[3px]" style={{ background: BRAND_GRADIENT }}>
          <div className="rounded-full bg-[#0a0a0a] p-1">
            <Image
              src="/logo.png"
              alt="BNC"
              width={52}
              height={52}
              className="rounded-full"
              style={{ width: 52, height: 52 }}
            />
          </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
          Tap to Connect
        </p>
        <div className="rounded-md bg-white p-1.5">
          <svg width="48" height="48" viewBox="0 0 52 52" aria-hidden>
            <rect width="52" height="52" fill="white" />
            <rect x="2" y="2" width="14" height="14" fill={BNC.green} />
            <rect x="36" y="2" width="14" height="14" fill={BNC.red} />
            <rect x="2" y="36" width="14" height="14" fill={BNC.orange} />
            {[18, 22, 26, 30, 34].flatMap((x) =>
              [18, 22, 26, 30, 34].map((y) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="2.5"
                  height="2.5"
                  fill={(x + y) % 3 === 0 ? UI.darkGray : "white"}
                />
              ))
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

function BNCCardStack({ sliderPos, containerRef }: { sliderPos: number; containerRef: RefObject<HTMLDivElement | null> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [clip, setClip] = useState(55);

  const updateClip = useCallback(() => {
    if (!containerRef.current || !cardRef.current) return;
    const c = containerRef.current.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();
    const sliderX = c.left + (sliderPos / 100) * c.width;
    const pct = ((sliderX - card.left) / card.width) * 100;
    setClip(Math.min(100, Math.max(0, pct)));
  }, [sliderPos, containerRef]);

  useEffect(() => {
    updateClip();
    window.addEventListener("resize", updateClip);
    return () => window.removeEventListener("resize", updateClip);
  }, [updateClip]);

  return (
    <div className="relative" style={{ width: CARD_W + 20, height: CARD_H + 16 }}>
      {/* Back card peeking */}
      <div
        className="absolute left-0 top-2 overflow-hidden rounded-[14px] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: "rotate(-7deg) translate(-10px, -4px)",
          zIndex: 1,
        }}
      >
        <BNCCardBack />
      </div>
      {/* Top card — front/back split aligned with slider */}
      <div
        ref={cardRef}
        className="absolute left-3 top-0 overflow-hidden rounded-[14px] shadow-[0_24px_56px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
        style={{ width: CARD_W, height: CARD_H, transform: "rotate(-3deg)", zIndex: 2 }}
      >
        <div className="absolute inset-0">
          <BNCCardBack />
        </div>
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - clip}% 0 0)` }}
        >
          <BNCCardFront />
        </div>
      </div>
    </div>
  );
}

function CardDisplay({
  side,
  sliderPos,
  containerRef,
}: {
  side: Side;
  sliderPos: number;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  if (side === "traditional") {
    return <TraditionalPaperCard />;
  }
  return <BNCCardStack sliderPos={sliderPos} containerRef={containerRef} />;
}

// ─── Donut ────────────────────────────────────────────────────────────────────
function DonutChart({ side, className }: { side: Side; className?: string }) {
  const gradient =
    side === "traditional"
      ? `conic-gradient(from 225deg, ${UI.lightGray} 0deg 360deg)`
      : `conic-gradient(from 225deg, ${UI.darkGray} 0deg 72deg, ${BNC.green} 72deg 155deg, ${BNC.red} 155deg 245deg, ${BNC.orange} 245deg 315deg, ${BNC.yellow} 315deg 360deg)`;

  return (
    <div
      className={`relative rounded-full ${className ?? ""}`}
      style={{
        background: gradient,
        boxShadow:
          side === "bnc"
            ? "0 0 0 1px rgba(0,0,0,0.04), 0 24px 60px rgba(27,138,75,0.1)"
            : "0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <div className="absolute inset-[16%] flex items-center justify-center rounded-full bg-white shadow-inner">
        {side === "traditional" ? (
          <span className="text-xs font-bold text-gray-300">NO DATA</span>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: BNC.green }}>
              847
            </p>
            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
              Total Taps
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Background decorations (BNC only) ────────────────────────────────────────
function BNCBackgroundDecor() {
  const words = ["NFC", "ANALYTICS", "SMART", "SHARE", "TRACK"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {words.map((word, i) => (
        <span
          key={word}
          className="absolute select-none font-black uppercase opacity-[0.04]"
          style={{
            fontSize: i % 2 === 0 ? "72px" : "48px",
            color: [BNC.green, BNC.orange, BNC.red, BNC.yellow, BNC.green][i],
            top: `${10 + i * 16}%`,
            left: `${5 + i * 18}%`,
            transform: `rotate(${-12 + i * 6}deg)`,
          }}
        >
          {word}
        </span>
      ))}
      <div
        className="absolute -right-20 top-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `${BNC.green}12` }}
      />
      <div
        className="absolute -left-16 bottom-1/4 h-48 w-48 rounded-full blur-3xl"
        style={{ background: `${BNC.orange}10` }}
      />
    </div>
  );
}

function SectionHeader({ side }: { side: Side }) {
  if (side === "traditional") {
    return (
      <div className="text-center">
        <span className="mb-2 inline-block rounded-full bg-gray-100 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Outdated Networking
        </span>
        <h2 className="text-2xl font-black uppercase tracking-wide text-gray-400 sm:text-3xl md:text-[44px]">
          Traditional Card
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-400">
          Static paper cards with{" "}
          <span className="font-semibold text-gray-500">zero tracking</span>, no
          updates, and costly reprints every time details change.
        </p>
      </div>
    );
  }

  return (
    <div className="relative text-center">
      <span
        className="mb-2 inline-block rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        Smart NFC Technology
      </span>
      <h2
        className="text-2xl font-black uppercase tracking-wide sm:text-3xl md:text-[44px]"
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        BNC Business Card
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-relaxed text-subtext">
        <span style={{ color: BNC.green }}>Tap</span>
        {" · "}
        <span style={{ color: BNC.yellow }}>Share</span>
        {" · "}
        <span style={{ color: BNC.red }}>Track</span>
        {" · "}
        <span style={{ color: BNC.orange }}>Grow</span>
        {" — real-time analytics and unlimited profile updates."}
      </p>
    </div>
  );
}

function ConnectorLines({ side }: { side: Side }) {
  const lines =
    side === "traditional"
      ? [
          { points: "145,125 205,125 315,225", stroke: UI.muted },
          { points: "165,360 245,360 320,285", stroke: UI.muted },
          { points: "780,265 720,265 610,265", stroke: UI.muted },
        ]
      : [
          { points: "145,125 205,125 315,225", stroke: BNC.red },
          { points: "165,360 245,360 320,285", stroke: BNC.orange },
          { points: "780,265 720,265 610,265", stroke: BNC.green },
        ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox={`0 0 920 ${CANVAS_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {lines.map((l) => (
        <polyline
          key={l.points}
          points={l.points}
          fill="none"
          stroke={l.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={side === "traditional" ? 0.5 : 1}
        />
      ))}
    </svg>
  );
}

function SectionLayout({
  side,
  sliderPos,
  containerRef,
}: {
  side: Side;
  sliderPos: number;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative w-full" style={{ height: CANVAS_H }}>
      {side === "bnc" && <BNCBackgroundDecor />}
      <ConnectorLines side={side} />

      <div
        className="absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
      >
        <DonutChart side={side} className="h-full w-full" />
      </div>

      <div className="absolute left-[8%] top-1/2 z-20 -translate-y-1/2">
        <CardDisplay side={side} sliderPos={sliderPos} containerRef={containerRef} />
      </div>

      <div className="absolute right-[1%] top-[2%] z-30 flex gap-3 lg:gap-5">
        <StatRing
          side={side}
          stroke={BNC.green}
          labelColor={BNC.green}
          value={BNC_STATS.taps.value}
          fill={BNC_STATS.taps.fill}
          label={BNC_STATS.taps.label}
        />
        <StatRing
          side={side}
          stroke={BNC.orange}
          labelColor={BNC.orange}
          value={BNC_STATS.downloads.value}
          fill={BNC_STATS.downloads.fill}
          label={BNC_STATS.downloads.label}
        />
        <StatRing
          side={side}
          stroke={BNC.red}
          labelColor={BNC.red}
          value={BNC_STATS.messages.value}
          fill={BNC_STATS.messages.fill}
          label={BNC_STATS.messages.label}
        />
      </div>

      {side === "traditional" ? (
        <>
          <div className="absolute left-[1%] top-[14%] z-20 lg:left-[3%]">
            <FeatureNode side={side} icon={Ban} color={UI.gray} title="MANUAL SHARE" subtitle="LIMITED" disabled />
          </div>
          <div className="absolute bottom-[5%] left-[3%] z-20 lg:left-[5%]">
            <FeatureNode side={side} icon={FileText} color={UI.gray} title="STATIC INFO" subtitle="OUTDATED" disabled />
          </div>
          <div className="absolute bottom-[8%] right-[1%] z-20 lg:right-[3%]">
            <FeatureNode side={side} icon={Printer} color={UI.gray} title="COSTLY REPRINT" subtitle="WASTEFUL" disabled />
          </div>
        </>
      ) : (
        <>
          <div className="absolute left-[1%] top-[14%] z-20 lg:left-[3%]">
            <FeatureNode side={side} icon={Lightbulb} color={BNC.red} title="1 TAP SHARE" subtitle="UNLIMITED" />
          </div>
          <div className="absolute bottom-[5%] left-[3%] z-20 lg:left-[5%]">
            <FeatureNode side={side} icon={Pencil} color={BNC.orange} title="EDIT ANYTIME" subtitle="UNLIMITED" />
          </div>
          <div className="absolute bottom-[8%] right-[1%] z-20 lg:right-[3%]">
            <FeatureNode side={side} icon={TrendingUp} color={BNC.green} title="LIVE ANALYTICS" subtitle="REAL-TIME" />
          </div>
        </>
      )}
    </div>
  );
}

function GlobalSlider({ sliderPos, onDragStart }: { sliderPos: number; onDragStart: () => void }) {
  return (
    <div
      className="absolute top-0 bottom-0 z-50 cursor-ew-resize"
      style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      onMouseDown={(e) => { e.preventDefault(); onDragStart(); }}
      onTouchStart={(e) => { e.preventDefault(); onDragStart(); }}
    >
      <div
        className="h-full w-[2px]"
        style={{
          background: `linear-gradient(to bottom, transparent 5%, ${BNC.yellow} 20%, ${BNC.green} 50%, ${BNC.orange} 80%, transparent 95%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 flex h-9 w-7 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[3px] rounded-lg shadow-xl"
        style={{ background: BRAND_GRADIENT }}
      >
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-[3px]">
            <span className="h-[3px] w-[3px] rounded-full bg-white" />
            <span className="h-[3px] w-[3px] rounded-full bg-white" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SliderHint({ sliderPos }: { sliderPos: number }) {
  const showBnc = sliderPos > 45;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
      <span
        className={`rounded-full px-4 py-1.5 font-semibold transition-all ${
          !showBnc ? "scale-105 shadow-sm" : "opacity-40"
        }`}
        style={{ background: `${UI.gray}18`, color: UI.darkGray }}
      >
        ← Traditional Card
      </span>
      <span className="hidden text-gray-300 sm:inline">drag to compare</span>
      <span
        className={`rounded-full px-4 py-1.5 font-semibold transition-all ${
          showBnc ? "scale-105 shadow-sm" : "opacity-40"
        }`}
        style={{
          background: `linear-gradient(90deg, ${BNC.green}20, ${BNC.orange}20)`,
          color: BNC.green,
        }}
      >
        BNC Business Card →
      </span>
    </div>
  );
}

function CompareSection({
  sliderPos,
  setSliderPos,
}: {
  sliderPos: number;
  setSliderPos: (v: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSliderPos(Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)));
    },
    [setSliderPos]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      updateSlider("touches" in e ? e.touches[0].clientX : e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateSlider]);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onMouseDown={(e) => { dragging.current = true; updateSlider(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; updateSlider(e.touches[0].clientX); }}
    >
      {/* Header — each side clipped to its half so backgrounds never bleed through */}
      <div className="relative mb-3 min-h-[150px] overflow-hidden sm:mb-4 sm:min-h-[165px]">
        <div
          className="absolute inset-0 overflow-hidden bg-[#F8F8FA]"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <SectionHeader side="traditional" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <SectionHeader side="bnc" />
        </div>
      </div>

      {/* Canvas — each side clipped; hidden side fully removed, not just covered */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-[#F8F8FA]"
        style={{ height: CANVAS_H }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <SectionLayout side="traditional" sliderPos={sliderPos} containerRef={containerRef} />
        </div>
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <SectionLayout side="bnc" sliderPos={sliderPos} containerRef={containerRef} />
        </div>
      </div>

      <GlobalSlider sliderPos={sliderPos} onDragStart={() => { dragging.current = true; }} />
      <SliderHint sliderPos={sliderPos} />
    </div>
  );
}

export default function DigitalCard() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section className="bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div
            className="overflow-hidden rounded-2xl border border-gray-200/80 px-4 py-5 sm:px-6 sm:py-6"
            style={{
              background: "linear-gradient(180deg, #fff 0%, #fafafa 100%)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.04)",
            }}
          >
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-subtext">
              See the Difference
            </p>
            <div
              className="mx-auto mb-4 h-1 w-20 rounded-full"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="mx-auto max-w-[920px]">
              <CompareSection sliderPos={sliderPos} setSliderPos={setSliderPos} />
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
