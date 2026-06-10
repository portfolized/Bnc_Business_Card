"use client";

import Link from "next/link";
import { Wifi, QrCode, BarChart2, Smartphone, ArrowRight, Users, TrendingUp, Award, Star } from "lucide-react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const badges = [
  { icon: Wifi, label: "NFC Enabled" },
  { icon: QrCode, label: "QR Backup" },
  { icon: BarChart2, label: "Live Analytics" },
  { icon: Smartphone, label: "Any Phone" },
];

const stats = [
  { value: 2000, suffix: "+", label: "Cards Delivered", icon: Award },
  { value: 50000, suffix: "+", label: "Connections Made", icon: Users },
  { value: 500, suffix: "+", label: "Businesses", icon: TrendingUp },
  { value: 4.9, suffix: "★", label: "Avg. Rating", icon: Star, isFloat: true },
];

function CountUp({ end, suffix, isFloat }: { end: number; suffix: string; isFloat?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (isFloat) {
      setCount(end);
      return;
    }
    const duration = 1800;
    const steps = 60;
    const step = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end, isFloat]);

  return (
    <span ref={ref}>
      {isFloat ? end : count.toLocaleString()}
      {suffix}
    </span>
  );
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export default function Hero() {
  return (
    <section className="bg-section-gray px-4 pb-16 pt-28 md:pb-24 md:pt-36 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-5xl text-center"
      >
        {/* Badges row */}
        <motion.div variants={item} className="mb-7 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-bnc-green opacity-75" style={{ animation: "pulse-ring 1.4s ease-out infinite" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-bnc-green" />
            </span>
            <span className="font-semibold text-primary">BNC Business Card</span>
            <span className="hidden text-subtext sm:inline">— Nepal&apos;s #1 NFC Card</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            नेपालको #१ स्मार्ट कार्ड ✦
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div variants={item} className="mb-6 flex items-center justify-center gap-4">
          <Image
            src="/logo.png"
            alt="BNC"
            width={72}
            height={72}
            className="hidden shrink-0 rounded-full sm:block"
            style={{ width: 72, height: 72, animation: "float 4s ease-in-out infinite" }}
          />
          <h1 className="text-4xl font-light leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[88px]">
            The New Way of
            <br />
            <span className="font-bold text-primary">Networking</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p variants={item} className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-subtext md:text-lg">
          Share your contact with one tap. Update your profile anytime — no reprints, no waste.
          Trusted by professionals and businesses across Nepal.{" "}
          <span className="font-medium text-primary">नेपालभर डेलिभरी उपलब्ध छ।</span>
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            अहिले अर्डर गर्नुहोस् — Order Now
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="text-base font-medium text-subtext transition-colors hover:text-foreground"
          >
            How it works →
          </Link>
        </motion.div>

        {/* Feature badges */}
        <motion.div variants={item} className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {badges.map(({ icon: Icon, label }) => (
            <motion.span
              key={label}
              whileHover={{ scale: 1.06, y: -2 }}
              className="inline-flex cursor-default items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-subtext shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={item}
          className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/80 shadow-sm sm:grid-cols-4"
        >
          {stats.map(({ value, suffix, label, icon: Icon, isFloat }, i) => (
            <motion.div
              key={label}
              whileHover={{ backgroundColor: "#f0fdf4" }}
              className="flex flex-col items-center gap-1 bg-white px-4 py-5 transition-colors"
            >
              <Icon className="mb-1 h-4 w-4 text-primary/60" />
              <p className="text-xl font-black text-foreground sm:text-2xl">
                <CountUp end={value} suffix={suffix} isFloat={isFloat} />
              </p>
              <p className="text-[11px] text-subtext">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
