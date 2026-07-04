"use client";

import {
  Building2,
  PlusCircle,
  Briefcase,
  Smartphone,
  RefreshCw,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import MotionWrapper from "./MotionWrapper";

type Industry = {
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  features: string[];
};

const industries: Industry[] = [
  {
    icon: Building2,
    title: "Business Professionals",
    tagline: "Share details in one tap",
    description:
      "Share contact details, calendar links, and company info instantly at every meeting.",
    features: ["One-tap contact share", "Professional branding", "CRM-ready leads"],
  },
  {
    icon: PlusCircle,
    title: "Creators & Influencers",
    tagline: "Grow your audience fast",
    description:
      "Link your socials, portfolio, store and booking in a single tap.",
    features: ["All socials in one", "Custom profile", "Link-in-bio ready"],
  },
  {
    icon: Briefcase,
    title: "Small Businesses",
    tagline: "Smart, modern networking",
    description:
      "Give your shop or agency a modern card that shares links, reviews, and offers.",
    features: ["Smart storefront link", "Customer analytics", "Easy team cards"],
  },
  {
    icon: Smartphone,
    title: "Students & Job Seekers",
    tagline: "Stand out instantly",
    description:
      "Make a strong first impression at fairs and interviews with a digital card.",
    features: ["Portfolio links", "Instant resume share", "Memorable impression"],
  },
];

function IndustryFlipCard({ item }: { item: Industry }) {
  const Icon = item.icon;

  return (
    <div className="group h-[320px] w-full [perspective:1200px] sm:h-[340px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-[#f5f5f7] shadow-[0_4px_24px_rgba(0,0,0,0.04)] [backface-visibility:hidden]">
          <div className="flex flex-1 items-center justify-center px-6 pt-8">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/[0.04]" />
              <div className="absolute inset-3 rounded-full bg-primary/[0.06]" />
              <div className="absolute inset-6 rounded-full bg-primary/[0.08]" />
              <div className="absolute inset-9 rounded-full bg-primary/10" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,165,79,0.12)] ring-1 ring-primary/10">
                <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 px-5 pb-5 pt-2">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold leading-tight text-foreground sm:text-base">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-subtext sm:text-[13px]">{item.tagline}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-[#f5f5f7] shadow-[0_4px_24px_rgba(0,0,0,0.04)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex flex-1 flex-col px-5 pb-4 pt-6">
            <h3 className="text-[15px] font-bold leading-tight text-foreground sm:text-base">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-subtext sm:text-[13px]">
              {item.description}
            </p>

            <ul className="mt-4 space-y-2.5">
              {item.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs text-foreground sm:text-[13px]">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-200/80 px-4 pb-4 pt-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-between rounded-2xl bg-[#ececef] px-4 py-3 text-left transition-colors hover:bg-[#e4e4e8]"
            >
              <span className="text-sm font-semibold text-foreground">Start today</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransformIndustry() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              Who Uses BNC
            </span>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Built for Every Professional
            </h2>
            <p className="text-subtext">
              व्यवसायी, कलाकार, विद्यार्थी — BNC Card सबैका लागि हो। Hover to explore.
            </p>
          </div>
        </MotionWrapper>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {industries.map((item, i) => (
            <MotionWrapper key={item.title} delay={i * 0.08}>
              <IndustryFlipCard item={item} />
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
