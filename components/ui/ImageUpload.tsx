"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X, Search, Images } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Optional label rendered above the control. */
  label?: string;
  /** Extra classes for the clickable drop area (height/width/etc). */
  className?: string;
  /** Shape of the preview/drop area. */
  rounded?: "lg" | "xl" | "full";
  /** Small helper text shown under the control. */
  hint?: string;
  /** Placeholder text inside the empty drop area. */
  placeholder?: string;
};

type Photo = { id: string; thumb: string; src: string; alt: string };

// ─── Pexels picker modal ────────────────────────────────────────────────────

function PexelsModal({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pexels?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setPhotos(Array.isArray(data.photos) ? data.photos : []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load("business card"); }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Images className="h-4 w-4" /> Choose an image from Pexels
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); load(query.trim() || "business card"); }}
          className="flex items-center gap-2 border-b border-gray-100 px-5 py-3"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. office, nature, abstract…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            Search
          </button>
        </form>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
          ) : photos.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">No images found. Try another search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPick(p.src)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200"
                >
                  <img src={p.thumb} alt={p.alt} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-400">Photos provided by Pexels.</p>
      </div>
    </div>
  );
}

// ─── Image upload control ───────────────────────────────────────────────────

/**
 * Reusable image picker. Uploads to Cloudinary OR lets the user pick a stock
 * image from Pexels. The value it emits is a hosted image URL.
 */
export default function ImageUpload({
  value,
  onChange,
  label,
  className = "h-24 w-full",
  rounded = "xl",
  hint,
  placeholder = "Upload image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pexelsOpen, setPexelsOpen] = useState(false);

  const radius =
    rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "rounded-xl";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && (
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <ImageIcon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`group relative flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-gray-50/80 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-wait ${radius} ${className}`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : value ? (
            <img src={value} alt={label ?? "Selected image"} className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-primary">
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">{placeholder}</span>
            </span>
          )}
        </button>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setPexelsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Images className="h-3.5 w-3.5" /> Choose from Pexels
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}

      {pexelsOpen && (
        <PexelsModal
          onClose={() => setPexelsOpen(false)}
          onPick={(url) => { onChange(url); setPexelsOpen(false); }}
        />
      )}
    </div>
  );
}
