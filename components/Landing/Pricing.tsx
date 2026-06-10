"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import MotionWrapper from "./MotionWrapper";

const BASE_PRICE = 1499;

const sharedFeatures = [
  "NFC enabled physical card",
  "Custom digital profile",
  "QR code generation",
  "Social media integration",
  "Contact form",
  "Unlimited customization",
  "Support",
];

const businessExtras = ["Bulk order support", "CSV import for members"];

function getDiscount(qty: number): number {
  if (qty >= 50) return 0.15;
  if (qty >= 20) return 0.1;
  if (qty >= 10) return 0.05;
  if (qty >= 5) return 0.03;
  return 0;
}

export default function Pricing() {
  const [quantity, setQuantity] = useState(1);

  const discount = getDiscount(quantity);
  const subtotal = BASE_PRICE * quantity;
  const savings = Math.round(subtotal * discount);
  const total = subtotal - savings;

  return (
    <section id="pricing" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="text-subtext">
              Adjust the slider for Business to see your total and automatic
              savings.
            </p>
          </div>
        </MotionWrapper>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Individuals */}
          <MotionWrapper delay={0.1}>
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 p-6 md:p-8">
              <h3 className="mb-2 text-xl font-bold">Individuals</h3>
              <p className="mb-1 text-3xl font-bold text-foreground">
                NPR {BASE_PRICE.toLocaleString()}
                <span className="text-base font-normal text-subtext"> /pcs</span>
              </p>
              <p className="mb-6 text-sm text-subtext">Simple and built for you</p>
              <ul className="mb-8 flex-1 space-y-3">
                {sharedFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-subtext">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block rounded-full bg-primary py-3 text-center font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          </MotionWrapper>

          {/* Business */}
          <MotionWrapper delay={0.2}>
            <div className="relative flex h-full flex-col rounded-2xl border-2 border-primary bg-bnc-green/5 p-6 md:p-8">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-xl font-bold">Business</h3>
                <span className="rounded-full bg-bnc-orange/15 px-2.5 py-0.5 text-xs font-medium text-bnc-orange">
                  🔥 Most Popular
                </span>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground">
                NPR {total.toLocaleString()}
                <span className="text-base font-normal text-subtext"> total</span>
              </p>
              <p className="mb-4 text-sm text-subtext">
                Number of cards: {quantity}
              </p>
              <input
                type="range"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mb-2 w-full accent-primary"
              />
              {savings > 0 && (
                <p className="mb-4 text-sm font-medium text-bnc-green">
                  You save NPR {savings.toLocaleString()} ({Math.round(discount * 100)}% off)
                </p>
              )}
              <p className="mb-6 text-sm text-subtext">
                Great for teams and bulk orders
              </p>
              <ul className="mb-8 flex-1 space-y-3">
                {[...sharedFeatures, ...businessExtras].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-subtext">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block rounded-full bg-primary py-3 text-center font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          </MotionWrapper>

          {/* Enterprise */}
          <MotionWrapper delay={0.3}>
            <div className="flex h-full flex-col rounded-2xl bg-gray-950 p-6 text-white md:p-8">
              <h3 className="mb-2 text-xl font-bold">Enterprise</h3>
              <p className="mb-1 text-4xl font-bold">Custom</p>
              <p className="mb-6 text-sm text-gray-400">
                Tailored design and add ons
              </p>
              <ul className="mb-8 flex-1 space-y-3">
                {[
                  ...sharedFeatures,
                  ...businessExtras,
                  "Premium materials and finishes",
                  "Fully custom artwork",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-semibold">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@bncbusinesscard.com"
                className="block rounded-full border border-white py-3 text-center font-medium transition-colors hover:bg-white hover:text-gray-950"
              >
                Contact Us
              </a>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
