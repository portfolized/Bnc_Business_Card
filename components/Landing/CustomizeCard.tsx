"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MotionWrapper from "./MotionWrapper";
import PersonalInfoForm from "../customize/PersonalInfoForm";
import DesignPreviewPanel from "../customize/DesignPreviewPanel";
import { CARD_TEMPLATES } from "../customize/templateRegistry";
import { DEFAULT_PERSONAL_INFO, PENDING_CARD_KEY } from "../customize/types";
import type { PersonalInfo } from "../customize/types";

export default function CustomizeCard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [info, setInfo] = useState<PersonalInfo>(DEFAULT_PERSONAL_INFO);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [frontLogoUrl, setFrontLogoUrl] = useState<string | null>(null);
  const [backLogoUrl, setBackLogoUrl] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Save the designed card, then send the visitor to checkout. Logged-out
  // visitors go through login first and are returned to the order flow.
  const handleOrder = () => {
    setOrdering(true);
    const payload = {
      info,
      frontImageUrl: frontLogoUrl,
      backImageUrl: backLogoUrl,
      cardTemplate: CARD_TEMPLATES[activeTemplate]?.id ?? "",
    };
    try {
      localStorage.setItem(PENDING_CARD_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage failures; the order modal still opens empty
    }
    const dest = "/dashboard/orders?new=1";
    if (status === "authenticated" && session?.user) {
      router.push(dest);
    } else {
      router.push(`/login?next=${encodeURIComponent(dest)}`);
    }
  };

  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
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

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <MotionWrapper delay={0.1}>
            <PersonalInfoForm
              info={info}
              onChange={updateField}
              frontLogoUrl={frontLogoUrl}
              backLogoUrl={backLogoUrl}
              onFrontLogoChange={setFrontLogoUrl}
              onBackLogoChange={setBackLogoUrl}
              onOrder={handleOrder}
              ordering={ordering}
            />
          </MotionWrapper>

          <MotionWrapper delay={0.15}>
            <DesignPreviewPanel
              templates={CARD_TEMPLATES}
              activeIndex={activeTemplate}
              onSelectTemplate={setActiveTemplate}
              info={info}
              frontLogoUrl={frontLogoUrl}
              backLogoUrl={backLogoUrl}
            />
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
