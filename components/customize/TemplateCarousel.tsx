"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import RemoteImage from "../Landing/RemoteImage";
import type { CardTemplateDefinition } from "./types";

type TemplateCarouselProps = {
  templates: CardTemplateDefinition[];
  activeIndex: number;
  onSelect: (index: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export default function TemplateCarousel({
  templates,
  activeIndex,
  onSelect,
  searchQuery,
  onSearchChange,
}: TemplateCarouselProps) {
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    );
  }, [templates, searchQuery]);

  const visibleIndices = useMemo(() => {
    if (filtered.length === 0) return [];
    const len = filtered.length;
    const center = Math.min(
      Math.max(activeIndex, 0),
      len - 1
    );
    if (len <= 3) return filtered.map((_, i) => i);
    const start = Math.max(0, Math.min(center - 1, len - 3));
    return [start, start + 1, start + 2].filter((i) => i < len);
  }, [filtered, activeIndex]);

  const activeFilteredIndex = useMemo(() => {
    const current = templates[activeIndex];
    const idx = filtered.findIndex((t) => t.id === current?.id);
    return idx >= 0 ? idx : 0;
  }, [templates, activeIndex, filtered]);

  const goPrev = () => {
    if (filtered.length === 0) return;
    const currentId = templates[activeIndex]?.id;
    const fi = filtered.findIndex((t) => t.id === currentId);
    const nextFi = fi <= 0 ? filtered.length - 1 : fi - 1;
    const globalIdx = templates.findIndex((t) => t.id === filtered[nextFi].id);
    onSelect(globalIdx >= 0 ? globalIdx : 0);
  };

  const goNext = () => {
    if (filtered.length === 0) return;
    const currentId = templates[activeIndex]?.id;
    const fi = filtered.findIndex((t) => t.id === currentId);
    const nextFi = fi >= filtered.length - 1 ? 0 : fi + 1;
    const globalIdx = templates.findIndex((t) => t.id === filtered[nextFi].id);
    onSelect(globalIdx >= 0 ? globalIdx : 0);
  };

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtext" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-foreground transition-colors hover:bg-gray-50"
          aria-label="Previous template"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="grid min-h-[88px] flex-1 grid-cols-3 gap-2.5">
          {filtered.length === 0 ? (
            <p className="col-span-3 flex items-center justify-center text-sm text-subtext">
              No templates found
            </p>
          ) : (
            visibleIndices.map((fi) => {
              const template = filtered[fi];
              const globalIdx = templates.findIndex((t) => t.id === template.id);
              const isActive = globalIdx === activeIndex;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelect(globalIdx)}
                  className={`relative aspect-[5/3] overflow-hidden rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <RemoteImage
                    src={template.thumbnailImage}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-foreground transition-colors hover:bg-gray-50"
          aria-label="Next template"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-subtext">
        {filtered[activeFilteredIndex]?.name ?? "Select a template"}
      </p>
    </>
  );
}
