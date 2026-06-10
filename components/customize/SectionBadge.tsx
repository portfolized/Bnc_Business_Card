import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export default function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
      {children}
    </span>
  );
}
