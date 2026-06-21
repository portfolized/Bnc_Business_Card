"use client";

import { useState } from "react";
import SectionBadge from "./SectionBadge";
import TemplateCarousel from "./TemplateCarousel";
import OrderCardPreview from "./OrderCardPreview";
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

  const template = templates[activeIndex] ?? templates[0];

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

      {/* Same two-faces preview the order form uses, so both share one look.
          Uploaded logos act as the front/back background, matching checkout. */}
      <div className="mx-auto mt-6 max-w-[520px]">
        <OrderCardPreview
          templateId={template.id}
          info={info}
          frontImageUrl={frontLogoUrl}
          backImageUrl={backLogoUrl}
        />
      </div>
    </div>
  );
}
