"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// A card button that opens a centered modal with details (bank account /
// insurance). Rendered via a portal so the modal escapes the scaled
// `transform: scale()` preview and covers the real viewport.
function InfoModal({
  title,
  content,
  accent,
  onClose,
}: {
  title: string;
  content: string;
  accent: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b border-gray-100 px-5 py-4"
          style={{ backgroundColor: `${accent}0d` }}
        >
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {content.trim() ? (
            <p className="whitespace-pre-line text-base leading-relaxed text-gray-700">
              {content}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              No {title.toLowerCase()} details added yet.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function InfoButton({
  title,
  content,
  accent,
  className,
  style,
  children,
}: {
  title: string;
  content: string;
  accent: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={style}
      >
        {children}
      </button>
      {open && (
        <InfoModal
          title={title}
          content={content}
          accent={accent}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
