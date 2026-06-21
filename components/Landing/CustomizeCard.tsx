"use client";

import MotionWrapper from "./MotionWrapper";
import OrderForm from "../customize/OrderForm";

export default function CustomizeCard() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <MotionWrapper>
          <div className="mb-10 text-center md:mb-12">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Customize Your Card
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-subtext md:text-base">
              Design your perfect NFC business card now. Your customization will be saved
              automatically when you sign in.
            </p>
          </div>
        </MotionWrapper>

        {/* Same order form used inside the dashboard. Logged-out visitors are
            sent to login and returned to the dashboard to complete payment. */}
        <MotionWrapper delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
            <OrderForm />
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
