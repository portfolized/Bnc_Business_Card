"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// Renders a block of text with a tiny markdown subset:
//   **bold**           → <strong>
//   lines starting "#" → bold, on their own line (headings)
//
// When `maxLength` is set and the text is longer, it truncates with "…" and
// shows a "See more / See less" toggle. The expanded text is capped to a
// `maxHeight` and becomes scrollable instead of overflowing its space.
export default function RichText({
  text,
  className = "",
  maxLength,
  maxHeight = 280,
  style,
}: {
  text: string;
  className?: string;
  maxLength?: number;
  maxHeight?: number;
  style?: CSSProperties;
}) {
  const [expanded, setExpanded] = useState(false);

  const full = (text ?? "").replace(/\r\n?/g, "\n");
  const overLimit = typeof maxLength === "number" && full.length > maxLength;
  const shown = overLimit && !expanded ? `${full.slice(0, maxLength)}…` : full;

  // Only fields that opt into truncation get the scrollable box (bio).
  const scrollable = typeof maxLength === "number";

  const lines = shown.split("\n");

  return (
    <div className={className} style={style}>
      <div
        className={scrollable ? "overflow-y-auto" : undefined}
        style={scrollable ? { maxHeight } : undefined}
      >
        {lines.map((line, i) => {
          const heading = /^#{1,6}\s+/.exec(line);
          const content = heading ? line.slice(heading[0].length) : line;
          if (!content.trim()) return null;
          return (
            <div key={i} className={heading ? "font-bold" : ""}>
              {renderInline(content, i)}
            </div>
          );
        })}
      </div>
      {overLimit && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1.5 block text-[0.8em] font-semibold underline opacity-70 transition hover:opacity-100"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function renderInline(text: string, line: number): ReactNode[] {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${line}-${i}`}>{part}</strong>
    ) : (
      <span key={`${line}-${i}`}>{part}</span>
    ),
  );
}
