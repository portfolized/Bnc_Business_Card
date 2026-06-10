"use client";

import { useEffect, useRef, useState } from "react";
import {
  TEMPLATES,
  TEMPLATE_FORM_CONFIG,
  DESIGN_W,
  DESIGN_H,
} from "@/components/templates/registry";
import type { Profile } from "@/components/templates/registry";
import {
  Mail,
  Phone,
  Building2,
  User,
  ChevronDown,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react";

// ─── Scaled hero ─────────────────────────────────────────────────────────────

function ScaledHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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

// ─── Lead form ────────────────────────────────────────────────────────────────

type FormState = { fullName: string; email: string; phone: string; company: string; message: string };

const EMPTY_FORM: FormState = { fullName: "", email: "", phone: "", company: "", message: "" };

function LeadForm({
  username,
  cfg,
  accent,
}: {
  username: string;
  cfg: (typeof TEMPLATE_FORM_CONFIG)[string];
  accent: string;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = (field: keyof FormState, v: string) => setForm((p) => ({ ...p, [field]: v }));

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${cfg.inputBg} ${cfg.inputBorder} ${
    cfg.dark
      ? "text-white placeholder:text-gray-500 focus:ring-white/10"
      : "text-gray-800 placeholder:text-gray-400 focus:ring-blue-100 focus:border-blue-400"
  }`;

  const labelClass = `mb-1.5 block text-xs font-semibold uppercase tracking-wide ${
    cfg.dark ? "text-gray-400" : "text-gray-500"
  }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...form, type: cfg.type }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}20` }}>
          <CheckCircle2 className="h-10 w-10" style={{ color: accent }} />
        </div>
        <h3 className={`text-2xl font-bold ${cfg.dark ? "text-white" : "text-gray-900"}`}>Message Sent!</h3>
        <p className={`mt-2 text-base ${cfg.mutedText}`}>
          Thanks for reaching out. I&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => { setForm(EMPTY_FORM); setStatus("idle"); }}
          className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> Full Name *</span>
          </label>
          <input
            required
            type="text"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="John Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email *</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 234 567 8900"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Company</span>
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Inc."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Message</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell me about your project or what you'd like to discuss..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading" ? "Sending..." : cfg.cta}
      </button>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileView({
  profile,
  templateId,
  username,
}: {
  profile: Profile;
  templateId: string;
  username: string;
}) {
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const Component = template.Component;
  const cfg = TEMPLATE_FORM_CONFIG[templateId] ?? TEMPLATE_FORM_CONFIG.classic;

  const scrollToForm = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* ── Hero (the template) ── */}
      <section className="relative">
        <ScaledHero>
          <Component profile={profile} />
        </ScaledHero>

        {/* Scroll indicator */}
        <button
          type="button"
          onClick={scrollToForm}
          aria-label="Scroll to contact form"
          className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity hover:opacity-100 ${
            cfg.dark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="text-xs font-medium tracking-widest uppercase">Contact</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </section>

      {/* ── Contact / Lead form ── */}
      <section id="contact-section" className={`px-6 py-20 md:px-8 ${cfg.sectionBg}`}>
        <div className="mx-auto max-w-2xl">
          {/* Section header */}
          <div className={`mb-12 text-center ${cfg.dark ? "text-white" : "text-gray-900"}`}>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: `${profile.accent}20`, color: profile.accent }}
            >
              {cfg.type}
            </div>
            <h2 className="text-4xl font-bold">{cfg.title}</h2>
            <p className={`mt-3 text-lg ${cfg.mutedText}`}>{cfg.subtitle}</p>
          </div>

          {/* Form card */}
          <div className={`rounded-2xl border p-8 shadow-sm ${cfg.cardBg} ${cfg.dark ? "border-white/10" : "border-gray-200"}`}>
            <LeadForm username={username} cfg={cfg} accent={profile.accent} />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`py-6 text-center text-xs ${cfg.dark ? "bg-black/30 text-gray-600" : "bg-white text-gray-400 border-t border-gray-100"}`}>
        Powered by <span className="font-semibold">BNC Business Card</span>
      </footer>
    </main>
  );
}
