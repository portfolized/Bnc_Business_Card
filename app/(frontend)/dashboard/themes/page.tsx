"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import {
  TEMPLATES,
  ACCENTS,
  DESIGN_W,
  DESIGN_H,
  host,
} from "@/components/templates/registry";
import type { Profile } from "@/components/templates/registry";
import ImageUpload from "@/components/ui/ImageUpload";

type Card = {
  id: string;
  label: string;
  slug: string | null;
  fullName: string;
  cardTemplate: string;
};

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: Profile = {
  fullName: "Full Name",
  role: "Founder",
  bio: "This is a profile, Customizable & Flexible for your use case.",
  email: "example@example.com",
  phone: "+977 9800000001",
  website: "full-name-59.zalient.me",
  location: "Kathmandu, Nepal",
  avatarUrl: "",
  accent: "#7c3aed",
  headline: "",
  skills: "",
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      )}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Edit drawer ────────────────────────────────────────────────────────────────

function EditDrawer({
  profile,
  onChange,
  onClose,
  templateName,
  templateId,
}: {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
  onClose: () => void;
  templateName: string;
  templateId: string;
}) {
  const showHeadline = ["modern", "minimalist", "creative", "elegant"].includes(templateId);
  const showSkills = templateId === "corporate";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Content</h3>
            <p className="text-xs text-gray-400">{templateName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* avatar */}
          <ImageUpload
            label="Profile photo"
            value={profile.avatarUrl || null}
            onChange={(url) => onChange({ avatarUrl: url ?? "" })}
            rounded="full"
            className="h-20 w-20"
            placeholder="Upload"
          />

          <EditField label="Full Name" value={profile.fullName} onChange={(v) => onChange({ fullName: v })} placeholder="Your full name" />
          <EditField label="Role / Title" value={profile.role} onChange={(v) => onChange({ role: v })} placeholder="e.g. Product Designer" />
          <EditField label="Bio" value={profile.bio} onChange={(v) => onChange({ bio: v })} textarea placeholder="A short description about yourself" />
          <EditField label="Email" value={profile.email} onChange={(v) => onChange({ email: v })} placeholder="your@email.com" />
          <EditField label="Phone" value={profile.phone} onChange={(v) => onChange({ phone: v })} placeholder="+1 234 567 8900" />
          <EditField label="Website" value={profile.website} onChange={(v) => onChange({ website: v })} placeholder="yoursite.com" />
          <EditField label="Location" value={profile.location} onChange={(v) => onChange({ location: v })} placeholder="City, Country" />

          {showHeadline && (
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
          )}

          {showSkills && (
            <EditField
              label="Expertise / Skills"
              value={profile.skills}
              onChange={(v) => onChange({ skills: v })}
              placeholder="Strategy, Leadership, Product, Growth, Design"
              hint="Comma-separated list of your skills or expertise areas."
            />
          )}

          {/* accent */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <Palette className="h-3.5 w-3.5" /> Accent color
            </label>
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

        {/* footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Done
          </button>
        </div>
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
  const [cards, setCards] = useState<Card[]>([]);
  const [cardId, setCardId] = useState<string | null>(null);
  const [linkIds, setLinkIds] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainMsg, setDomainMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const patchProfile = (patch: Partial<Profile>) =>
    setProfile((prev) => ({ ...prev, ...patch }));

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
        const initial = data.find((c) => c.id === fromUrl)?.id ?? data[0]?.id ?? null;
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
    setLinkIds([]);
    setDomainMsg(null);
    setLoading(true);
    async function load() {
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

  const handleApply = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // Save the current card's full theme (content + template).
      const res = await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, cardTemplate: selectedId, profileId: cardId }),
      });
      if (!res.ok) {
        setSaveError("Failed to save. Please try again.");
        return;
      }

      // Also link this template to any additionally selected domains.
      if (linkIds.length > 0) {
        await fetch("/api/themes/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardTemplate: selectedId, profileIds: linkIds }),
        });
      }

      // Reflect the new template locally for the affected cards.
      const affected = new Set([cardId, ...linkIds]);
      setCards((prev) => prev.map((c) => (affected.has(c.id) ? { ...c, cardTemplate: selectedId } : c)));
      setActiveId(selectedId);
      setLinkIds([]);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Assign / change the domain (slug) for the selected card, right here.
  const handleSaveDomain = async () => {
    if (!cardId) return;
    setDomainSaving(true);
    setDomainMsg(null);
    try {
      const res = await fetch("/api/domain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: cardId, slug: domainInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setDomainInput(data.slug);
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, slug: data.slug } : c)));
        setDomainMsg({ ok: true, text: `Linked to /profile/${data.slug}` });
      } else {
        setDomainMsg({ ok: false, text: data.error ?? "Failed to save domain." });
      }
    } catch {
      setDomainMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setDomainSaving(false);
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

  return (
    <div className="min-h-full bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Themes</h1>
            <p className="text-xs text-gray-400">Choose a template for each card</p>
          </div>

          {/* Card selector */}
          {cards.length > 0 && (
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={cardId ?? ""}
                onChange={(e) => setCardId(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}{c.slug ? ` (/${c.slug})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── Left: template grid ── */}
            <div>
              <p className="mb-3 text-xs font-medium text-gray-400">
                {filtered.length} of {TEMPLATES.length} templates
              </p>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <Search className="h-9 w-9 text-gray-200" />
                  <p className="mt-3 text-sm font-medium text-gray-600">No templates found</p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-1.5 text-xs text-blue-600 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((t) => {
                    const isSelected = t.id === selectedId;
                    const isActive = t.id === activeId;
                    const Comp = t.Component;
                    return (
                      <div
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(t.id)}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedId(t.id)}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-200 ${
                          isSelected
                            ? "shadow-lg shadow-blue-500/10 ring-2 ring-blue-500"
                            : "ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative">
                          <div className="pointer-events-none">
                            <ScaledPreview>
                              <Comp profile={profile} />
                            </ScaledPreview>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-gray-900 shadow backdrop-blur-sm">
                              Preview
                            </span>
                          </div>

                          {/* Selected check */}
                          {isSelected && (
                            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow-md">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}

                          {/* Active badge */}
                          {isActive && (
                            <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="border-t border-gray-100 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                              <p className="truncate text-xs text-gray-400">{t.description}</p>
                            </div>
                            {isSelected && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                                className="shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                                title="Edit content"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {t.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right: live preview ── */}
            <div className="lg:sticky lg:top-18.25 lg:self-start">
              {/* Info card */}
              <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{selected.name}</p>
                      {selectedId === activeId ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                          Preview
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{selected.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <SquarePen className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={saving || (selectedId === activeId && linkIds.length === 0)}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {saving ? "Saving..." : linkIds.length > 0 ? `Apply to ${linkIds.length + 1} domains` : selectedId === activeId ? "Applied" : "Apply"}
                    </button>
                  </div>
                </div>
                {saveError && (
                  <p className="mt-2 text-xs text-red-500">{saveError}</p>
                )}

                {/* This card's domain — assign / change it right here */}
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    <Globe className="h-3.5 w-3.5" /> Domain for this card
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-gray-200">
                      <span className="whitespace-nowrap border-r border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-400">/profile/</span>
                      <input
                        value={domainInput}
                        onChange={(e) => { setDomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setDomainMsg(null); }}
                        placeholder="yourname"
                        maxLength={30}
                        className="flex-1 px-2.5 py-2 text-sm text-gray-800 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      disabled={domainSaving || domainInput.length < 3}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {domainSaving ? "Saving…" : "Link"}
                    </button>
                  </div>
                  {domainMsg && (
                    <p className={`mt-1.5 text-[11px] ${domainMsg.ok ? "text-emerald-600" : "text-red-500"}`}>{domainMsg.text}</p>
                  )}
                </div>

                {/* Link this template to other domains */}
                {cards.length > 1 && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
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
                                setLinkIds((prev) =>
                                  on ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                                )
                              }
                              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                                on
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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

              <BrowserFrame url={host(profile.website)}>
                <ScaledPreview>
                  <SelectedComponent profile={profile} />
                </ScaledPreview>
              </BrowserFrame>

              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ImageIcon className="h-3.5 w-3.5" />
                Live preview — edits reflect here instantly
              </p>
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
        />
      )}
    </div>
  );
}
