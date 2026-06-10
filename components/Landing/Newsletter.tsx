"use client";

import { useState } from "react";
import RemoteImage from "./RemoteImage";
import { Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MotionWrapper from "./MotionWrapper";

const dots = [
  { top: "10%", left: "8%", size: 8, color: "bg-bnc-green" },
  { top: "20%", left: "85%", size: 10, color: "bg-bnc-orange" },
  { top: "60%", left: "5%", size: 6, color: "bg-bnc-red" },
  { top: "75%", left: "92%", size: 8, color: "bg-bnc-yellow" },
  { top: "40%", left: "15%", size: 5, color: "bg-bnc-green" },
  { top: "85%", left: "70%", size: 7, color: "bg-bnc-orange" },
  { top: "15%", left: "50%", size: 6, color: "bg-bnc-red" },
  { top: "55%", left: "80%", size: 5, color: "bg-bnc-yellow" },
];

const avatars = [
  "https://picsum.photos/seed/n1/80/80",
  "https://picsum.photos/seed/n2/80/80",
  "https://picsum.photos/seed/n3/80/80",
  "https://picsum.photos/seed/n4/80/80",
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:py-24">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full opacity-20 ${dot.color}`}
          style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
          animate={{ y: [0, -10, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}

      <div className="relative mx-auto max-w-2xl text-center">
        <MotionWrapper>
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            Newsletter
          </span>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            BNC को नयाँ{" "}
            <span className="text-primary">Features</span> बारे जान्नुहोस्
          </h2>
          <p className="mb-2 text-subtext">
            New card designs, feature launches, and networking tips — delivered to your inbox.
          </p>
          <p className="mb-8 text-sm font-medium text-primary">
            हाम्रो newsletter subscribe गर्नुहोस् र पहिले जानकारी पाउनुहोस्।
          </p>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">You're subscribed!</p>
                  <p className="text-sm text-green-700">धन्यवाद! Thank you for joining.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-full border border-gray-200 px-6 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 sm:max-w-sm"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  Subscribe
                  <Send className="h-4 w-4" />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <div
                  key={i}
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white"
                >
                  <RemoteImage src={src} alt="" fill className="object-cover" sizes="36px" />
                </div>
              ))}
            </div>
            <span className="text-sm text-subtext">
              <span className="font-bold text-foreground">100+</span> professionals already joined ✦
            </span>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
