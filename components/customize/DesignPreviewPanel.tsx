"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FlipHorizontal2, Wand2 } from "lucide-react";
import SectionBadge from "./SectionBadge";
import TemplateCarousel from "./TemplateCarousel";
import type { CardTemplateDefinition, PersonalInfo } from "./types";

type DesignPreviewPanelProps = {
  templates: CardTemplateDefinition[];
  activeIndex: number;
  onSelectTemplate: (index: number) => void;
  info: PersonalInfo;
  frontLogoUrl: string | null;
  backLogoUrl: string | null;
};

export default function DesignPreviewPanel({
  templates,
  activeIndex,
  onSelectTemplate,
  info,
  frontLogoUrl,
  backLogoUrl,
}: DesignPreviewPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [flipped, setFlipped] = useState(false);

  const template = templates[activeIndex] ?? templates[0];
  const TemplateComponent = template.Component;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:p-8">
      <SectionBadge>Choose Your Template</SectionBadge>
      <h3 className="mb-4 text-lg font-bold text-foreground">Design Preview</h3>

      <TemplateCarousel
        templates={templates}
        activeIndex={activeIndex}
        onSelect={onSelectTemplate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="relative mx-auto mt-6 max-w-[520px]">
        <div className="perspective-[1200px]">
          <motion.div
            className="relative aspect-[1.586/1] w-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <TemplateComponent
                info={info}
                side="front"
                frontLogoUrl={frontLogoUrl}
                backLogoUrl={backLogoUrl}
                backgroundImage={template.backgroundImage}
              />
            </div>
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <TemplateComponent
                info={info}
                side="back"
                frontLogoUrl={frontLogoUrl}
                backLogoUrl={backLogoUrl}
                backgroundImage={template.backgroundImage}
              />
            </div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          <FlipHorizontal2 className="h-3.5 w-3.5" />
          Flip
        </button>
      </div>

      <button
        type="button"
        className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-bnc-green via-bnc-orange to-bnc-red py-3.5 text-sm font-semibold text-white shadow-lg shadow-bnc-green/20 transition-opacity hover:opacity-90"
      >
        <Wand2 className="h-4 w-4" strokeWidth={2} />
        Try Advanced Design Mode
      </button>
    </div>
  );
}
