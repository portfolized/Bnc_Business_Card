"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  Smartphone,
  RefreshCw,
  Wifi,
  Phone,
  Mail,
  Globe,
  Check,
  Package,
  Zap,
  Pencil,
  BarChart2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import MotionWrapper from "./MotionWrapper";
import { BNC, BRAND_GRADIENT } from "@/lib/brand-colors";
const STEP_DURATION_MS = 4800;

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  badge: string;
  highlights: string[];
  cardHeadline: string;
  cardSubtext: string;
};

const steps: Step[] = [
  {
    icon: ShoppingCart,
    title: "Order Your NFC Card",
    description:
      "Choose your preferred design and place your order online. We'll prepare your personalized NFC card.",
    accent: BNC.yellow,
    badge: "Step 01 · Order",
    highlights: ["Premium NFC chip", "Custom card design", "Doorstep delivery"],
    cardHeadline: "Order Confirmed",
    cardSubtext: "Your card is being crafted",
  },
  {
    icon: User,
    title: "Customize Your Profile",
    description:
      "Set up your digital profile with contact details, social links, and your brand logo.",
    accent: BNC.green,
    badge: "Step 02 · Profile",
    highlights: ["Live profile editor", "Logo & brand colors", "Unlimited fields"],
    cardHeadline: "Anurag Subedi",
    cardSubtext: "CEO · BNC Business Card",
  },
  {
    icon: Smartphone,
    title: "Tap & Share Instantly",
    description:
      "Tap your card on any NFC-enabled phone to instantly share your details — no app required.",
    accent: BNC.orange,
    badge: "Step 03 · Share",
    highlights: ["One-tap sharing", "Works on all phones", "QR backup included"],
    cardHeadline: "Tap to Connect",
    cardSubtext: "NFC · Ready to share",
  },
  {
    icon: RefreshCw,
    title: "Update Anytime",
    description:
      "Edit your profile anytime — changes reflect instantly without reprinting your card.",
    accent: BNC.red,
    badge: "Step 04 · Sync",
    highlights: ["Instant cloud sync", "No reprints needed", "Real-time analytics"],
    cardHeadline: "Profile Updated",
    cardSubtext: "Synced · Just now",
  },
];

function OrderCardVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"
      >
        <Package className="h-7 w-7 text-white/90" strokeWidth={1.5} />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">Order Confirmed</p>
        <p className="mt-1 text-[10px] text-white/50">Ships within 3–5 days</p>
      </div>
      <div className="flex gap-2">
        {["Design", "NFC", "Print"].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"
          >
            <Check className="h-3 w-3 text-bnc-green" />
            <span className="text-[9px] font-semibold text-white/80">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProfileCardVisual() {
  const fields = [
    { Icon: Phone, text: "+977 976-1158811", dot: BNC.green },
    { Icon: Mail, text: "info@bncbusinesscard.com", dot: BNC.yellow },
    { Icon: Globe, text: "bncbusinesscard.com", dot: BNC.orange },
  ];

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-white">Anurag Subedi</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-bnc-green" />
            CEO · BNC Business Card
          </p>
        </div>
        <Image
          src="/logo.png"
          alt="BNC"
          width={32}
          height={32}
          className="rounded-full ring-2 ring-white/10"
          style={{ width: 32, height: 32 }}
        />
      </div>
      <div className="space-y-2">
        {fields.map(({ Icon, text, dot }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15"
              style={{ background: `${dot}25` }}
            >
              <Icon className="h-[9px] w-[9px] text-white/90" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] text-gray-300">{text}</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="ml-auto"
            >
              <Pencil className="h-3 w-3 text-white/30" />
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ShareCardVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/20"
          style={{ width: 60 + i * 40, height: 60 + i * 40 }}
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25"
      >
        <Wifi className="h-8 w-8 text-white" strokeWidth={1.5} />
      </motion.div>
      <div className="relative z-10 text-center">
        <p className="text-sm font-bold text-white">Tap to Connect</p>
        <p className="mt-1 text-[10px] text-white/50">Hold near any smartphone</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex items-center gap-1.5 rounded-full bg-bnc-green/20 px-3 py-1 ring-1 ring-bnc-green/30"
      >
        <Zap className="h-3 w-3 text-bnc-green" />
        <span className="text-[9px] font-bold text-bnc-green">Contact shared!</span>
      </motion.div>
    </div>
  );
}

function SyncCardVisual() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"
      >
        <RefreshCw className="h-6 w-6 text-white/90" strokeWidth={2} />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">Profile Updated</p>
        <p className="mt-1 text-[10px] text-white/50">Synced · Just now</p>
      </div>
      <div className="w-full max-w-[200px] space-y-2">
        {[
          { label: "Phone", value: "Updated" },
          { label: "Website", value: "Updated" },
          { label: "Analytics", value: "+12 taps" },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10"
          >
            <span className="text-[10px] text-white/60">{label}</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-bnc-green">
              <BarChart2 className="h-3 w-3" />
              {value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const CARD_VISUALS = [OrderCardVisual, ProfileCardVisual, ShareCardVisual, SyncCardVisual];

function StepCardPreview({ activeStep }: { activeStep: number }) {
  const step = steps[activeStep];
  const CardVisual = CARD_VISUALS[activeStep];

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -inset-6 rounded-[2rem] blur-3xl"
        style={{ background: `${step.accent}18` }}
      />

      <div className="relative rounded-[1.75rem] bg-gradient-to-br from-gray-200 to-gray-300 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
        <div className="mb-2 flex items-center justify-between px-1">
          <span
            className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            style={{ background: step.accent }}
          >
            {step.badge}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bnc-green" />
            Live preview
          </span>
        </div>

        <div
          className="relative aspect-[1.586/1] overflow-hidden rounded-2xl shadow-inner"
          style={{
            background: `linear-gradient(145deg, #0a0a0a 0%, #161616 50%, #0d0d0d 100%)`,
          }}
        >
          <div
            className="absolute bottom-0 left-0 h-[3px] w-full"
            style={{ background: BRAND_GRADIENT }}
          />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
            <Wifi className="h-3 w-3 text-white/70" />
            <span className="text-[8px] font-bold text-white/70">NFC</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <CardVisual />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-subtext">
            What happens in this step
          </p>
          <div className="flex flex-wrap gap-2">
            {step.highlights.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  background: `${step.accent}12`,
                  color: step.accent,
                }}
              >
                <Check className="h-3 w-3" strokeWidth={2.5} />
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepTimeline({
  activeStep,
  progress,
  onSelect,
}: {
  activeStep: number;
  progress: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === activeStep;
        const isPast = i < activeStep;

        return (
          <button
            key={step.title}
            type="button"
            onClick={() => onSelect(i)}
            className="group flex w-full gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-white/60"
          >
            <div className="flex flex-col items-center pt-1">
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="step-ring"
                    className="absolute -inset-1 rounded-full"
                    style={{ background: `${step.accent}30` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-white shadow-lg"
                      : isPast
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                  }`}
                  style={isActive ? { background: step.accent, boxShadow: `0 8px 24px ${step.accent}40` } : undefined}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="relative my-1 h-full min-h-[36px] w-0.5 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="absolute left-0 top-0 w-full origin-top"
                    initial={false}
                    animate={{
                      height: isPast ? "100%" : isActive ? `${progress * 100}%` : "0%",
                      backgroundColor: isActive ? step.accent : isPast ? "#1f2937" : "#e5e7eb",
                    }}
                    transition={{ duration: 0.08, ease: "linear" }}
                  />
                </div>
              )}
            </div>

            <div
              className={`flex-1 pb-4 pt-0.5 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-45 group-hover:opacity-70"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <h3
                  className={`font-semibold transition-colors ${
                    isActive ? "text-foreground" : "text-subtext"
                  }`}
                >
                  {step.title}
                </h3>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                    style={{ background: step.accent }}
                  >
                    Active
                  </motion.span>
                )}
              </div>
              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.p
                    key="desc"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm leading-relaxed text-subtext"
                  >
                    {step.description}
                  </motion.p>
                ) : (
                  <motion.p
                    key="short"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="line-clamp-1 text-sm text-subtext"
                  >
                    {step.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(0);

  const goToStep = useCallback((index: number) => {
    setActiveStep(index);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (paused) return;

    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STEP_DURATION_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        setActiveStep((prev) => (prev + 1) % steps.length);
        setProgress(0);
        startTimeRef.current = Date.now();
      }
    };

    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [paused, activeStep]);

  return (
    <section id="how-it-works" className="bg-section-gray px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div className="mb-10 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-subtext">
              Simple Process
            </p>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              How It Works
            </h2>
            <p className="text-subtext">
              Get started with your digital business card in four simple steps
            </p>
            <div
              className="mx-auto mt-5 h-1 w-16 rounded-full"
              style={{ background: BRAND_GRADIENT }}
            />
          </div>
        </MotionWrapper>

        <div
          className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            setProgress(0);
          }}
        >
          <MotionWrapper delay={0.1}>
            <div className="rounded-2xl border border-gray-200/60 bg-white/50 p-4 backdrop-blur-sm md:p-6">
              <StepTimeline
                activeStep={activeStep}
                progress={progress}
                onSelect={goToStep}
              />

              <div className="mt-2 flex items-center gap-3 px-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: steps[activeStep].accent }}
                    animate={{
                      width: `${((activeStep + progress) / steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
                <span className="text-[10px] font-semibold tabular-nums text-subtext">
                  {activeStep + 1}/{steps.length}
                </span>
              </div>
            </div>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <StepCardPreview activeStep={activeStep} />
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
