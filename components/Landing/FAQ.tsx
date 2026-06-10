"use client";

import { useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import MotionWrapper from "./MotionWrapper";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What makes BNC cards different from other digital business cards?",
    answer:
      "BNC Business Cards combine a premium physical NFC card with a fully customizable digital profile, real-time analytics, and unlimited profile updates — all for a one-time price. No subscriptions. Your card never becomes outdated.",
  },
  {
    question: "के BNC Card नेपालमा पाइन्छ? (Is BNC Card available in Nepal?)",
    answer:
      "हो! BNC Business Card नेपालमा उपलब्ध छ। हामी काठमाडौं, ललितपुर, भक्तपुर, पोखरा, चितवन र सम्पूर्ण नेपालभर डेलिभरी गर्छौं। काउसलटार, भक्तपुरमा हाम्रो मुख्य कार्यालय छ। Yes — we deliver all across Nepal!",
    isNepali: true,
  },
  {
    question: "Do NFC cards work with all smartphones?",
    answer:
      "NFC sharing works on most modern Android phones and iPhones (iPhone 7 and later). For older devices, every BNC card includes a built-in QR code so anyone can access your profile regardless of their phone model.",
  },
  {
    question: "Can I update my card details after receiving it?",
    answer:
      "Absolutely. Your physical card is permanent — the NFC chip points to your digital profile. Log into your dashboard and update your phone, email, social links, or any info anytime. Changes go live instantly, no reprinting needed.",
  },
  {
    question: "Can I order BNC cards for my entire team or company?",
    answer:
      "Yes! Our Business and Enterprise plans support bulk orders, CSV member imports, and a unified team dashboard. Discounts apply automatically: 3% off for 5+, 5% for 10+, 10% for 20+, and 15% for 50+ cards.",
  },
  {
    question: "How quickly will my card be delivered?",
    answer:
      "We process orders within 1–2 business days. Delivery typically takes 3–5 days within the Kathmandu Valley and 5–10 days for other parts of Nepal. You will receive a tracking update once your card ships.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-section-gray px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <MotionWrapper>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              FAQ
            </span>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-subtext">
              सबैभन्दा सामान्य प्रश्नहरूका उत्तर — answers to the most common questions
            </p>
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={faq.question}
                  initial={false}
                  animate={{
                    backgroundColor: isOpen ? "#ffffff" : "#faf8f5",
                  }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl border border-gray-200/80"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span
                      className={`pr-4 text-sm font-medium transition-colors sm:text-base ${
                        isOpen ? "text-primary" : "text-foreground"
                      } ${faq.isNepali ? "leading-relaxed" : ""}`}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen ? "bg-primary text-white" : "bg-gray-100 text-subtext"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p
                          className={`px-5 pb-5 text-sm leading-relaxed text-subtext ${
                            faq.isNepali ? "font-medium" : ""
                          }`}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="mt-10 rounded-2xl bg-primary p-6 text-center text-white">
            <p className="mb-1 font-bold text-lg">Still have questions?</p>
            <p className="mb-4 text-sm text-white/80">
              हाम्रो टिमलाई सम्पर्क गर्नुहोस् — our team replies within a few hours.
            </p>
            <a
              href="mailto:contact@bncbusinesscard.com"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Contact Us
            </a>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
