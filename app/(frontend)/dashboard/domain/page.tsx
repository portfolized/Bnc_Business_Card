"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RuleState = boolean | null;

function RuleDot({ ok, children }: { ok: RuleState; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-[13px] text-gray-500">
      <span
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-200 ${
          ok === null ? "bg-gray-300" : ok ? "bg-emerald-500" : "bg-red-400"
        }`}
      />
      {children}
    </div>
  );
}

type Card = { id: string; label: string; slug: string | null };

export default function DomainPage() {
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [cardId, setCardId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const MAX_DOMAINS = 10;
  const domainsUsed = cards.filter((c) => c.slug).length;

  const slug = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const previewSlug = slug || "yourname";

  const rules: Record<string, RuleState> = username
    ? {
        length: username.length >= 3 && username.length <= 30,
        chars: /^[a-zA-Z0-9_]+$/.test(username),
        noSpaces: !/[\s!@#$%^&*()\-+=[\]{};:'",.<>?/\\|`~]/.test(username),
      }
    : { length: null, chars: null, noSpaces: null };

  // Load cards, then choose which one's domain to edit (?profileId or first).
  useEffect(() => {
    let cancelled = false;
    async function loadCards() {
      try {
        const res = await fetch("/api/cards");
        if (!res.ok || cancelled) return;
        const data: Card[] = await res.json();
        setCards(data);
        const fromUrl = new URLSearchParams(window.location.search).get("profileId");
        setCardId(data.find((c) => c.id === fromUrl)?.id ?? data[0]?.id ?? null);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCards();
    return () => { cancelled = true; };
  }, []);

  // Load the selected card's slug whenever the selection changes.
  useEffect(() => {
    if (!cardId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/domain?profileId=${cardId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setUsername(data.slug || "");
          setSaved(Boolean(data.slug));
          setError("");
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [cardId]);

  const handleSave = async () => {
    setError("");
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Please enter a valid username (3-30 chars, letters/numbers/underscores only).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/domain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: cardId, slug: username }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setUsername(data.slug);
        setCards((prev) => prev.map((c) => (c.id === data.profileId ? { ...c, slug: data.slug } : c)));
      } else {
        setError(data.error ?? "Failed to save username.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Create a new card (unlimited). A domain (slug) is only claimed on save.
  const handleCreateCard = async () => {
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `Card ${cards.length + 1}` }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards((prev) => [...prev, { id: data.id, label: data.label, slug: data.slug ?? null }]);
        setCardId(data.id);
        setUsername("");
        setSaved(false);
      } else {
        setError(data.error ?? "Failed to create domain.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm">BNC Business Card</span>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-[13px] font-medium px-4 py-1.5 rounded-full mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            </svg>
            Profile Username
          </div>
          <h1 className="text-[38px] font-bold text-gray-900 leading-tight mb-3">Your Profile URL</h1>
          <p className="text-[15px] text-gray-500 mb-5 max-w-md mx-auto">
            Choose a unique username — your profile will be live and shareable at this address
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { icon: "shield", label: "Unique" },
              { icon: "link", label: "Shareable" },
              { icon: "pencil", label: "Editable" },
            ].map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-1.5">
                <FeatureIcon name={icon} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
          {/* Left — Configuration */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[15px] text-gray-900">Set your username</p>
                <p className="text-[12px] text-gray-400">Each card gets its own profile link</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[13px] text-gray-500">
                  Card / Domain <span className="text-gray-400">· {domainsUsed}/{MAX_DOMAINS} domains used</span>
                </label>
                <button
                  type="button"
                  onClick={handleCreateCard}
                  disabled={creating}
                  className="text-[12px] font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  {creating ? "Adding…" : "+ New card"}
                </button>
              </div>
              {cards.length > 0 ? (
                <select
                  value={cardId ?? ""}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 h-10 text-[14px] text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}{c.slug ? ` (/profile/${c.slug})` : " — no domain yet"}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2.5 text-[13px] text-gray-400">
                  No cards yet — click “New domain” to reserve one, or place an order.
                </p>
              )}
            </div>

            <label className="block text-[13px] text-gray-500 mb-1.5">Username</label>
            <div className="flex gap-2 items-center">
              <div className={`flex flex-1 items-center border rounded-lg overflow-hidden bg-white transition-all duration-150 ${username ? "border-indigo-400 ring-2 ring-indigo-100" : "border-gray-200"}`}>
                <span className="px-3 h-10 flex items-center text-[13px] text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                  /profile/
                </span>
                <input
                  type="text"
                  value={loading ? "" : username}
                  maxLength={30}
                  disabled={loading}
                  onChange={(e) => { setUsername(e.target.value); setSaved(false); setError(""); }}
                  placeholder={loading ? "Loading..." : "yourname"}
                  className="flex-1 h-10 px-3 text-[14px] text-gray-800 outline-none bg-transparent placeholder-gray-300 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[14px] font-medium rounded-lg transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                )}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Preview URL */}
            <div className="mt-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
              <span className="text-[13px] font-mono text-gray-400 flex-1 truncate">
                /profile/<span className="text-indigo-600 font-medium">{previewSlug}</span>
              </span>
              {saved && slug && (
                <Link
                  href={`/profile/${slug}`}
                  target="_blank"
                  className="text-[12px] text-indigo-600 hover:underline whitespace-nowrap"
                >
                  View live
                </Link>
              )}
            </div>

            {/* Status messages */}
            {error && <p className="mt-2.5 text-[13px] text-red-500">{error}</p>}
            {saved && !error && (
              <p className="mt-2.5 text-[13px] text-emerald-600">
                Username saved! Your profile is live at{" "}
                <Link href={`/profile/${slug}`} target="_blank" className="underline">
                  /profile/{slug}
                </Link>
              </p>
            )}

            {/* Rules */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[12px] text-gray-400 mb-2">Username rules</p>
              <RuleDot ok={rules.length}>3-30 characters</RuleDot>
              <RuleDot ok={rules.chars}>Letters, numbers, underscores only</RuleDot>
              <RuleDot ok={rules.noSpaces}>No spaces or special characters</RuleDot>
            </div>
          </div>

          {/* Right — How it works */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[15px] text-gray-900">How it works</p>
                <p className="text-[12px] text-gray-400">Your profile URL explained</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { step: "1", title: "Pick a username", desc: "Choose something memorable - your name, brand, or handle." },
                {
                  step: "2",
                  title: "Your profile goes live",
                  desc: (
                    <>
                      Instantly accessible at{" "}
                      <code className="text-[12px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">/profile/username</code>{" "}
                      - share it anywhere.
                    </>
                  ),
                },
                { step: "3", title: "Change anytime", desc: "You can update your username later. Old links will redirect automatically." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3 items-start">
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-indigo-50 text-indigo-700 text-[12px] font-medium flex items-center justify-center mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-800 mb-0.5">{title}</p>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[12px] text-gray-400 mb-2">Example URLs</p>
              {["samratsapkota", "john_doe", "mybrand123"].map((ex) => (
                <p key={ex} className="font-mono text-[12px] text-gray-400 py-0.5">
                  /profile/<span className="text-indigo-600">{ex}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    shield: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    link: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    pencil: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  };
  return <>{icons[name]}</>;
}
