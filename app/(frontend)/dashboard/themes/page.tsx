"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  SquarePen,
  Check,
  X,
  Palette,
  Loader2,
  Image as ImageIcon,
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Monitor,
  Smartphone,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  TEMPLATES,
  ACCENTS,
  DESIGN_W,
  DESIGN_H,
} from "@/components/templates/registry";
import type { Profile } from "@/components/templates/registry";
import ImageUpload from "@/components/ui/ImageUpload";

type Card = {
  id: string;
  label: string;
  slug: string | null;
  fullName: string;
  cardTemplate: string;
  ordered?: boolean; // true once a (non-draft) order exists for this card
  locked?: boolean; // demo template past the free trial → read-only until ordered
};

// Free-template trial status (see @/lib/trial). Drives the countdown + quota UI.
type Trial = {
  createdAt: string;
  trialEndsAt: string;
  trialActive: boolean;
  freeLimit: number;
  demoCount: number;
  orderedCount: number;
  remainingFree: number;
  canCreateFree: boolean;
  blockReason: string | null;
};

// ─── Defaults ──────────────────────────────────────────────────────────────────

// The domain your public profiles are served from. Used to build the live URL
// shown in the preview's address bar so it always matches the card's slug.
const APP_DOMAIN = "bncbusinesscard.com";

const DEFAULT_PROFILE: Profile = {
  fullName: "Full Name",
  role: "Founder",
  bio: "This is a profile, Customizable & Flexible for your use case.",
  email: "example@example.com",
  phone: "+977 9800000001",
  website: "bncbusinesscard.com",
  location: "Kathmandu, Nepal",
  avatarUrl: "",
  accent: "#7c3aed",
  headline: "",
  skills: "",
  greeting: "",
  ctaPrimary: "",
  ctaSecondary: "",
};

// ─── Scaled preview ────────────────────────────────────────────────────────────

function ScaledPreview({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / DESIGN_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height: DESIGN_H * scale }}>
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Browser frame ─────────────────────────────────────────────────────────────

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-4 py-1 text-xs text-gray-500 shadow-sm">
          <Globe className="h-3 w-3" /> {url}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Edit field ─────────────────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChange,
  textarea,
  placeholder,
  hint,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  const base =
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2";
  const state = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-gray-200 focus:border-blue-400 focus:ring-blue-100";
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${base} resize-none ${state}`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} ${state}`}
        />
      )}
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}

// ─── Edit drawer ────────────────────────────────────────────────────────────────

// ─── Section heading inside the drawer ──────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
      {children}
    </h4>
  );
}

function EditDrawer({
  profile,
  onChange,
  onClose,
  templateName,
  templateId,
  domainInput,
  onDomainChange,
  availability,
  liveUrl,
  onSave,
  saving,
  saveError,
  errors,
  onClearError,
}: {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
  onClose: () => void;
  templateName: string;
  templateId: string;
  domainInput: string;
  onDomainChange: (v: string) => void;
  availability: "checking" | "available" | "taken" | "invalid" | "own" | null;
  liveUrl: string;
  onSave: () => void;
  saving: boolean;
  saveError: string;
  errors: { fullName?: string; domain?: string };
  onClearError: (field: "fullName" | "domain") => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <SquarePen className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit &amp; publish</h3>
              <p className="text-xs text-gray-400">{templateName} template</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Your link / domain */}
          <div className="space-y-2">
            <SectionTitle><Globe className="h-3.5 w-3.5" /> Your link</SectionTitle>
            <div
              className={`flex items-center overflow-hidden rounded-xl border transition-colors ${
                availability === "available"
                  ? "border-emerald-400 ring-2 ring-emerald-100"
                  : availability === "taken" || availability === "invalid"
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
              }`}
            >
              <span className="whitespace-nowrap border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-400">/profile/</span>
              <input
                value={domainInput}
                onChange={(e) => onDomainChange(e.target.value)}
                placeholder="yourname"
                maxLength={30}
                className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none"
              />
              {availability === "checking" && <Loader2 className="mr-3 h-4 w-4 shrink-0 animate-spin text-gray-400" />}
              {availability === "available" && <Check className="mr-3 h-4 w-4 shrink-0 text-emerald-500" />}
              {availability === "own" && <Check className="mr-3 h-4 w-4 shrink-0 text-blue-500" />}
              {availability === "taken" && <X className="mr-3 h-4 w-4 shrink-0 text-red-500" />}
            </div>
            {errors.domain ? (
              <p className="text-[11px] font-medium text-red-500">{errors.domain}</p>
            ) : (
              <p
                className={`text-[11px] ${
                  availability === "available"
                    ? "text-emerald-600"
                    : availability === "own"
                    ? "text-blue-600"
                    : availability === "taken"
                    ? "text-red-500"
                    : availability === "invalid"
                    ? "text-amber-600"
                    : "text-gray-400"
                }`}
              >
                {availability === "available" ? (
                  <>✓ <span className="font-mono">{liveUrl}</span> is available</>
                ) : availability === "own" ? (
                  "This is the current link for this card."
                ) : availability === "taken" ? (
                  "That link is already taken — try another."
                ) : availability === "invalid" ? (
                  "3–30 characters · letters, numbers and underscores only."
                ) : (
                  "Choose where your profile lives. Published when you save."
                )}
              </p>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Profile content */}
          <div className="space-y-4">
            <SectionTitle><ImageIcon className="h-3.5 w-3.5" /> Profile content</SectionTitle>

            <ImageUpload
              label="Profile photo"
              value={profile.avatarUrl || null}
              onChange={(url) => onChange({ avatarUrl: url ?? "" })}
              rounded="full"
              className="h-20 w-20"
              placeholder="Upload"
            />

            <EditField
              label="Full Name"
              value={profile.fullName}
              onChange={(v) => { onChange({ fullName: v }); if (errors.fullName) onClearError("fullName"); }}
              placeholder="Your full name"
              required
              error={errors.fullName}
            />
            <EditField label="Role / Title" value={profile.role} onChange={(v) => onChange({ role: v })} placeholder="e.g. Product Designer" />
            <EditField
              label="Greeting / Intro line"
              value={profile.greeting}
              onChange={(v) => onChange({ greeting: v })}
              placeholder="e.g. Hello, I am"
              hint="Small intro line shown above your name."
            />
            <EditField
              label="Headline"
              value={profile.headline}
              onChange={(v) => onChange({ headline: v })}
              textarea
              placeholder={
                templateId === "modern" ? "e.g. Building Scalable & Engaging Web." :
                templateId === "minimalist" ? "e.g. I help startups launch fast, scalable products." :
                templateId === "creative" ? "e.g. Hey, I'm" :
                templateId === "elegant" ? "e.g. Portfolio" :
                "Your main headline or tagline"
              }
              hint="The big hero text shown on your profile. Leave blank to use the template default."
            />
            <EditField label="Bio" value={profile.bio} onChange={(v) => onChange({ bio: v })} textarea placeholder="A short description about yourself" />
            <EditField
              label="Expertise / Skills"
              value={profile.skills}
              onChange={(v) => onChange({ skills: v })}
              placeholder="Strategy, Leadership, Product, Growth, Design"
              hint="Comma-separated — shown as tags on every template."
            />
            <EditField label="Email" value={profile.email} onChange={(v) => onChange({ email: v })} placeholder="your@email.com" />
            <EditField label="Phone" value={profile.phone} onChange={(v) => onChange({ phone: v })} placeholder="+1 234 567 8900" />
            <EditField label="Website" value={profile.website} onChange={(v) => onChange({ website: v })} placeholder="yoursite.com" />
            <EditField label="Location" value={profile.location} onChange={(v) => onChange({ location: v })} placeholder="City, Country" />
            <EditField
              label="Primary button text"
              value={profile.ctaPrimary}
              onChange={(v) => onChange({ ctaPrimary: v })}
              placeholder="e.g. Get in touch"
              hint="The main call-to-action button. Leave blank for the template default."
            />
            <EditField
              label="Secondary button text"
              value={profile.ctaSecondary}
              onChange={(v) => onChange({ ctaSecondary: v })}
              placeholder="e.g. View work"
              hint="The second button — shown on every template."
            />
          </div>

          <div className="h-px bg-gray-100" />

          {/* accent */}
          <div className="space-y-2">
            <SectionTitle><Palette className="h-3.5 w-3.5" /> Accent color</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ accent: c })}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full ring-offset-2 transition ${
                    profile.accent === c ? "ring-2 ring-gray-900" : ""
                  }`}
                >
                  {profile.accent === c && <Check className="mx-auto h-4 w-4 text-white" />}
                </button>
              ))}
              <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300">
                <Palette className="h-4 w-4 text-gray-400" />
                <input
                  type="color"
                  value={profile.accent}
                  onChange={(e) => onChange({ accent: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {/* footer — save & publish */}
        <div className="border-t border-gray-100 px-6 py-4">
          {saveError && <p className="mb-2 text-xs text-red-500">{saveError}</p>}
          <button
            onClick={onSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Publishing…" : "Save & Publish"}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Saves your content, template &amp; link — and publishes it live.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Free-trial countdown banner ─────────────────────────────────────────────────

function TrialBanner({ trial }: { trial: Trial }) {
  // Tick every second while the trial is live so the countdown stays accurate.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!trial.trialActive) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [trial.trialActive]);

  if (!trial.trialActive) {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
        <div className="flex items-center gap-2.5 text-sm text-red-800">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">Free trial ended.</span> Your free templates are
            now read-only — place an order to activate and edit them.
          </span>
        </div>
        <Link
          href="/dashboard/orders?new=1"
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Order a card
        </Link>
      </div>
    );
  }

  const ms = Math.max(0, new Date(trial.trialEndsAt).getTime() - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
      <div className="flex items-center gap-2.5 text-sm text-emerald-800">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>
          <span className="font-semibold">Free trial.</span> Build up to {trial.freeLimit} free
          templates and edit them freely — {trial.remainingFree} of {trial.freeLimit} left.
        </span>
      </div>
      <div className="flex items-center gap-2 text-emerald-900">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="font-mono text-sm font-semibold tabular-nums">
          {days}d {pad(hours)}:{pad(mins)}:{pad(secs)}
        </span>
        <span className="text-xs text-emerald-600">left</span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function ThemesPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
  const [activeId, setActiveId] = useState(TEMPLATES[0].id);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Field-level validation shown after the user hits Save & Publish.
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; domain?: string }>({});
  const [cards, setCards] = useState<Card[]>([]);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [linkIds, setLinkIds] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domainMsg, setDomainMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Async availability result, tagged with the slug it applies to so stale
  // responses are ignored. Empty / invalid / checking are derived during render.
  const [remoteCheck, setRemoteCheck] =
    useState<{ slug: string; status: "available" | "taken" | "own" } | null>(null);
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: 1 | -1) =>
    carouselRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  const patchProfile = (patch: Partial<Profile>) =>
    setProfile((prev) => ({ ...prev, ...patch }));

  // Sanitize domain input as the user types (lowercase, url-safe chars only).
  const onDomainChange = (v: string) => {
    setDomainInput(v.toLowerCase().replace(/[^a-z0-9_]/g, ""));
    setDomainMsg(null);
    setFieldErrors((e) => (e.domain ? { ...e, domain: undefined } : e));
  };

  const clearFieldError = (field: "fullName" | "domain") =>
    setFieldErrors((e) => ({ ...e, [field]: undefined }));

  // Pull the latest free-trial status (countdown + how many free templates are
  // left). Refetched after creating a card so the quota stays in sync.
  const refreshTrial = async () => {
    try {
      const res = await fetch("/api/trial");
      if (res.ok) setTrial(await res.json());
    } catch {
      // ignore — the banner just won't show
    }
  };

  useEffect(() => {
    refreshTrial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a new card/domain, then select it so its theme can be edited. The
  // slug itself is claimed via the "Domain for this card" field below.
  const handleCreateDomain = async () => {
    // Instant feedback when the free-template quota is used up or the trial ended.
    if (trial && !trial.canCreateFree) {
      setDomainMsg({ ok: false, text: trial.blockReason ?? "You can't create more free templates." });
      return;
    }
    setCreatingDomain(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `Card ${cards.length + 1}` }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards((prev) => [...prev, { id: data.id, label: data.label, slug: data.slug ?? null, fullName: data.fullName ?? "", cardTemplate: data.cardTemplate ?? TEMPLATES[0].id, ordered: false, locked: false }]);
        setCardId(data.id);
        refreshTrial();
      } else {
        setDomainMsg({ ok: false, text: data.error ?? "Couldn't create a new template." });
      }
    } catch {
      setDomainMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setCreatingDomain(false);
    }
  };

  // Label a card as a domain option, marking real (NFC) vs demo cards.
  const domainOptionLabel = (c: Card) =>
    `${c.slug ? `/profile/${c.slug}` : c.label}${c.ordered ? " · NFC" : " · demo"}`;

  // Load the user's cards, then pick which one to edit (?profileId or first).
  useEffect(() => {
    let cancelled = false;
    async function loadCards() {
      try {
        const res = await fetch("/api/cards");
        if (!res.ok || cancelled) return;
        const data: Card[] = await res.json();
        setCards(data);
        const fromUrl = new URLSearchParams(window.location.search).get("profileId");
        // Prefer the card named in the URL, else the first real (ordered) NFC
        // card, else the first card (a demo card).
        const initial =
          data.find((c) => c.id === fromUrl)?.id ??
          data.find((c) => c.ordered)?.id ??
          data[0]?.id ??
          null;
        setCardId(initial);
        if (!initial) setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    loadCards();
    return () => { cancelled = true; };
  }, []);

  // Load the selected card's theme whenever the selection changes.
  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;
    async function load() {
      // Reset per-card UI state and show the loader, then fetch this card's
      // theme. Kept inside the async fn (not the effect body) so it doesn't
      // count as a synchronous setState-in-effect.
      setLinkIds([]);
      setDomainMsg(null);
      setLoading(true);
      try {
        const res = await fetch(`/api/themes?profileId=${cardId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProfile({
            fullName: data.fullName || DEFAULT_PROFILE.fullName,
            role: data.role || DEFAULT_PROFILE.role,
            bio: data.bio || DEFAULT_PROFILE.bio,
            email: data.email || DEFAULT_PROFILE.email,
            phone: data.phone || DEFAULT_PROFILE.phone,
            website: data.website || DEFAULT_PROFILE.website,
            location: data.location || DEFAULT_PROFILE.location,
            avatarUrl: data.avatarUrl || "",
            accent: data.accent || DEFAULT_PROFILE.accent,
            headline: data.headline ?? "",
            skills: data.skills ?? "",
            greeting: data.greeting ?? "",
            ctaPrimary: data.ctaPrimary ?? "",
            ctaSecondary: data.ctaSecondary ?? "",
          });
          const savedTemplate = TEMPLATES.find((t) => t.id === data.cardTemplate);
          const tid = savedTemplate?.id ?? TEMPLATES[0].id;
          setSelectedId(tid);
          setActiveId(tid);
          setDomainInput(data.slug || "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [cardId]);

  // Live availability check for the domain input (debounced). Only valid slugs
  // hit the network, and setState happens solely inside the deferred callback —
  // never synchronously in the effect body — so it avoids cascading renders.
  const domainSlug = domainInput.trim().toLowerCase();
  const domainSlugValid =
    domainSlug.length >= 3 && domainSlug.length <= 30 && /^[a-z0-9_]+$/.test(domainSlug);

  // Derived availability (mirrors the server rules) for display.
  const availability: "checking" | "available" | "taken" | "invalid" | "own" | null =
    !domainSlug
      ? null
      : !domainSlugValid
      ? "invalid"
      : remoteCheck?.slug === domainSlug
      ? remoteCheck.status
      : "checking";

  useEffect(() => {
    if (!domainSlugValid) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/domain/check?slug=${encodeURIComponent(domainSlug)}${cardId ? `&profileId=${cardId}` : ""}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setRemoteCheck({
          slug: domainSlug,
          status: data.available ? (data.reason === "own" ? "own" : "available") : "taken",
        });
      } catch {
        // ignore — derived availability falls back to "checking"
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [domainSlug, domainSlugValid, cardId]);

  // Auto-dismiss the save/publish toast after a few seconds (setState lives in
  // the deferred timeout callback, never synchronously in the effect body).
  useEffect(() => {
    if (!domainMsg) return;
    const t = setTimeout(() => setDomainMsg(null), 4500);
    return () => clearTimeout(t);
  }, [domainMsg]);

  // One submit does everything: claims the domain (if one is entered), saves the
  // card's content + template, and links the template to any other selected
  // domains. There's no separate "Link" step — saving publishes to the domain.
  const handleApply = async () => {
    // Validate before doing anything. Collect every problem so all offending
    // fields light up at once, and stop here until they're fixed.
    const nextErrors: { fullName?: string; domain?: string } = {};
    if (!profile.fullName.trim()) {
      nextErrors.fullName = "Please enter your full name before publishing.";
    }
    if (domainInput.trim()) {
      if (availability === "invalid") {
        nextErrors.domain = "3–30 characters · letters, numbers and underscores only.";
      } else if (availability === "taken") {
        nextErrors.domain = "That link is already taken — try another.";
      } else if (availability === "checking") {
        nextErrors.domain = "Still checking this link — please wait a moment.";
      }
    }
    if (nextErrors.fullName || nextErrors.domain) {
      setFieldErrors(nextErrors);
      setSaveError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});

    setSaving(true);
    setSaveError("");
    setDomainMsg(null);
    try {
      // 0. If no card is selected yet (e.g. a brand-new user's first template),
      //    create a free one now. The server caps this at the free limit / trial.
      let activeId = cardId;
      if (!activeId) {
        const createRes = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: `Card ${cards.length + 1}`, cardTemplate: selectedId }),
        });
        const created = await createRes.json();
        if (!createRes.ok) {
          setSaveError(created.error ?? "Couldn't create a free template.");
          return;
        }
        activeId = created.id as string;
        // Add to the list so the slug/template maps below can find it, but defer
        // selecting it (setCardId) until after the save so the reload effect
        // fetches the already-saved content instead of racing with this save.
        setCards((prev) => [
          ...prev,
          { id: created.id, label: created.label, slug: created.slug ?? null, fullName: created.fullName ?? "", cardTemplate: created.cardTemplate ?? selectedId, ordered: false, locked: false },
        ]);
      }
      const createdNew = activeId !== cardId;

      // 1. Claim / update the domain slug if one is entered and it isn't already
      //    this card's slug. Blocked states are guarded by the disabled button.
      const slug = domainInput.trim();
      if (slug && availability !== "own") {
        const domRes = await fetch("/api/domain", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: activeId, slug }),
        });
        const domData = await domRes.json();
        if (!domRes.ok) {
          setDomainMsg({ ok: false, text: domData.error ?? "Failed to save domain." });
          return;
        }
        setDomainInput(domData.slug);
        setCards((prev) => prev.map((c) => (c.id === activeId ? { ...c, slug: domData.slug } : c)));
      }

      // 2. Save the card's content + selected template.
      const res = await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, cardTemplate: selectedId, profileId: activeId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error ?? "Failed to save. Please try again.");
        return;
      }

      // 3. Apply this template to any additionally selected domains.
      if (linkIds.length > 0) {
        await fetch("/api/themes/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardTemplate: selectedId, profileIds: linkIds }),
        });
      }

      // Reflect the new template locally for the affected cards.
      const affected = new Set([activeId, ...linkIds]);
      setCards((prev) => prev.map((c) => (affected.has(c.id) ? { ...c, cardTemplate: selectedId } : c)));
      setActiveId(selectedId);
      setLinkIds([]);
      setEditing(false);
      // Select the freshly created card now that its content is saved, and sync
      // the free-template quota.
      if (createdNew) {
        setCardId(activeId);
        refreshTrial();
      }
      setDomainMsg({
        ok: true,
        text: slug ? `Published — live at /profile/${slug}` : "Saved & published.",
      });
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? TEMPLATES.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      )
    : TEMPLATES;

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];
  const SelectedComponent = selected.Component;

  // A demo card is one without a placed order. Editing still works, but we nudge
  // the user to order it so they get a physical NFC card linked to this profile.
  const selectedCard = cards.find((c) => c.id === cardId);
  const isDemo = Boolean(selectedCard) && !selectedCard?.ordered;
  // A locked card is a demo template past the free trial: shown but read-only
  // until an order activates it.
  const isLocked = Boolean(selectedCard?.locked);
  // Where "order this card" points, so the order attaches to (and activates)
  // this exact template.
  const orderThisCardHref = selectedCard
    ? `/dashboard/orders?new=1&profileId=${selectedCard.id}`
    : "/dashboard/orders?new=1";

  // The public URL this card is (or will be) served from. Reflects the slug as
  // you edit it, so the preview address bar always points at the real domain.
  const liveUrl = domainInput.trim()
    ? `${APP_DOMAIN}/profile/${domainInput.trim()}`
    : APP_DOMAIN;


  return (
    <div className="min-h-full bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Themes</h1>
            <p className="text-xs text-gray-400">Pick a domain, then choose its template</p>
          </div>

          {/* Domain selector — choose which card/domain to theme. */}
          {cards.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Domain</label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={cardId ?? ""}
                  disabled={creatingDomain}
                  onChange={(e) => {
                    if (e.target.value === "__new__") handleCreateDomain();
                    else setCardId(e.target.value);
                  }}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {domainOptionLabel(c)}
                    </option>
                  ))}
                  <option value="__new__">+ New domain</option>
                </select>
                {creatingDomain ? (
                  <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                ) : (
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                )}
              </div>
            </div>
          )}

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm outline-none placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="px-6 py-6 md:px-8">
          {/* Free-trial countdown + quota. */}
          {trial && <TrialBanner trial={trial} />}

          {/* Locked template — a demo card past the free trial. Read-only until
              an order activates it. */}
          {isLocked ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5">
              <div className="flex items-center gap-2.5 text-sm text-red-800">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">Template locked.</span> Your free trial has ended, so this template is read-only. Place an order to activate it and edit again.
                </span>
              </div>
              <Link
                href={orderThisCardHref}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Order to activate
              </Link>
            </div>
          ) : (
            /* Demo card notice — this profile has no ordered NFC card yet. */
            isDemo && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
                <div className="flex items-center gap-2.5 text-sm text-amber-800">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">Demo card.</span> Your edits are saved, but order this card to ship a physical NFC card linked to this profile.
                  </span>
                </div>
                <Link
                  href={orderThisCardHref}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Order this card
                </Link>
              </div>
            )
          )}
          {/* ── Template carousel ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Search className="h-9 w-9 text-gray-200" />
              <p className="mt-3 text-sm font-medium text-gray-600">No templates found</p>
              <button type="button" onClick={() => setSearch("")} className="mt-1.5 text-xs text-blue-600 hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400">{filtered.length} of {TEMPLATES.length} templates</p>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => scrollCarousel(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => scrollCarousel(1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-2">
                {filtered.map((t) => {
                  const isSelected = t.id === selectedId;
                  const isActive = t.id === activeId;
                  const Comp = t.Component;
                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedId(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(t.id);
                        }
                      }}
                      className={`group relative w-44 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isSelected ? "shadow-lg shadow-blue-500/10 ring-2 ring-blue-500" : "ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300"
                      }`}
                    >
                      <div className="pointer-events-none">
                        <ScaledPreview>
                          <Comp profile={profile} />
                        </ScaledPreview>
                      </div>
                      {isSelected && (
                        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow-md">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      {isActive && (
                        <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                          Active
                        </span>
                      )}
                      <div className="border-t border-gray-100 p-2.5">
                        <p className="truncate text-xs font-semibold text-gray-900">{t.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{t.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Big live preview + controls ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Preview */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  {selectedId === activeId ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">Preview</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {/* Desktop / mobile viewport toggle */}
                  <div className="flex rounded-lg border border-gray-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewport("desktop")}
                      title="Desktop preview"
                      className={`flex h-8 w-9 items-center justify-center rounded-md transition ${viewport === "desktop" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewport("mobile")}
                      title="Mobile preview"
                      className={`flex h-8 w-9 items-center justify-center rounded-md transition ${viewport === "mobile" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Single primary action — opens the edit form which also
                      publishes. Disabled while a template is locked (trial ended). */}
                  <button
                    onClick={() => !isLocked && setEditing(true)}
                    disabled={isLocked}
                    title={isLocked ? "Locked — place an order to activate this template" : undefined}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-900/15 transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-900 disabled:active:scale-100"
                  >
                    {isLocked ? <Lock className="h-[18px] w-[18px]" /> : <SquarePen className="h-[18px] w-[18px]" />} Edit &amp; Publish
                  </button>
                </div>
              </div>

              <div className={`mx-auto transition-all duration-300 ${viewport === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
                <BrowserFrame url={liveUrl}>
                  <ScaledPreview>
                    <SelectedComponent profile={profile} />
                  </ScaledPreview>
                </BrowserFrame>
              </div>

              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ImageIcon className="h-3.5 w-3.5" />
                Live preview — edits reflect here instantly
              </p>
            </div>

            {/* Side panel: description, domain, link to other domains */}
            <div className="space-y-3 lg:sticky lg:top-18.25 lg:self-start">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">{selected.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Published link — status only. Editing the link lives inside the
                  Edit & Publish drawer. */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <Globe className="h-3.5 w-3.5" /> Published link
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                  <span className="flex-1 truncate font-mono text-xs text-gray-600">{liveUrl}</span>
                  {selectedCard?.slug ? (
                    <a
                      href={`/profile/${selectedCard.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      View live
                    </a>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Not set
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => !isLocked && setEditing(true)}
                  disabled={isLocked}
                  title={isLocked ? "Locked — place an order to activate this template" : undefined}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {isLocked ? (
                    <><Lock className="h-3.5 w-3.5" /> Locked — order to activate</>
                  ) : (
                    <><SquarePen className="h-3.5 w-3.5" /> {selectedCard?.slug ? "Edit link & content" : "Set link & content"}</>
                  )}
                </button>
              </div>

              {/* Link this template to other domains */}
              {cards.length > 1 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Also link “{selected.name}” to other domains
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cards
                      .filter((c) => c.id !== cardId)
                      .map((c) => {
                        const on = linkIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setLinkIds((prev) => (on ? prev.filter((id) => id !== c.id) : [...prev, c.id]))
                            }
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                              on ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {on && <Check className="h-3 w-3" />}
                            {c.label}{c.slug ? ` (/${c.slug})` : ""}
                          </button>
                        );
                      })}
                  </div>
                  {linkIds.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Applying will also set this template on {linkIds.length} other domain{linkIds.length > 1 ? "s" : ""}.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditDrawer
          profile={profile}
          onChange={patchProfile}
          onClose={() => setEditing(false)}
          templateName={selected.name}
          templateId={selectedId}
          domainInput={domainInput}
          onDomainChange={onDomainChange}
          availability={availability}
          liveUrl={liveUrl}
          onSave={handleApply}
          saving={saving}
          saveError={saveError}
          errors={fieldErrors}
          onClearError={clearFieldError}
        />
      )}

      {/* Save / publish toast */}
      {domainMsg && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            domainMsg.ok ? "bg-gray-900" : "bg-red-600"
          }`}
        >
          {domainMsg.ok ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4" />}
          {domainMsg.text}
        </div>
      )}
    </div>
  );
}
