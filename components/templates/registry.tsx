import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Contact,
  ArrowUpRight,
  Sparkles,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  fullName: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  avatarUrl: string;
  accent: string;
  headline: string;
  skills: string;
  greeting: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

// Shared fallbacks so every template renders the same editable fields and never
// shows hardcoded copy. A blank field falls back to a sensible default.
const txt = (value: string, fallback: string) => (value.trim() ? value : fallback);

export type TemplateProps = { profile: Profile };

export type TemplateDef = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  Component: (props: TemplateProps) => React.ReactElement;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCENTS = [
  "#7c3aed",
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#d946ef",
  "#0f172a",
];

export const DESIGN_W = 1200;
export const DESIGN_H = 760;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function host(website: string) {
  return website.replace(/^https?:\/\//, "");
}

export function Avatar({ profile, size, ring }: { profile: Profile; size: number; ring?: string }) {
  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        style={{ width: size, height: size, borderColor: ring }}
        className="rounded-full border-4 object-cover shadow-lg"
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${profile.accent}, ${profile.accent}99)`,
        borderColor: ring,
      }}
      className="flex items-center justify-center rounded-full border-4 font-bold text-white shadow-lg"
    >
      <span style={{ fontSize: size * 0.4 }}>
        {profile.fullName.charAt(0).toUpperCase() || "B"}
      </span>
    </div>
  );
}

// Skills as a list, with a light default so the slot is always visible.
function skillsOf(profile: Profile) {
  const arr = profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : ["Strategy", "Design", "Growth", "Leadership"];
}

// Contact items shared by every template, so the data shown is identical across
// all of them (only the styling differs per template).
function ContactItems({ profile, iconColor }: { profile: Profile; iconColor?: string }) {
  const items: [typeof Mail, string][] = [
    [Mail, profile.email],
    [Phone, profile.phone],
    [MapPin, profile.location],
    [Globe, host(profile.website)],
  ];
  return (
    <>
      {items.map(([Icon, value], i) =>
        value ? (
          <span key={i} className="flex items-center gap-2">
            <Icon className="h-5 w-5 shrink-0" style={iconColor ? { color: iconColor } : undefined} />
            <span className="truncate">{value}</span>
          </span>
        ) : null
      )}
    </>
  );
}

// Skill chips shared by every template (content identical, chip style varies).
function SkillChips({
  profile,
  className = "flex flex-wrap justify-center gap-2",
  chipClassName = "",
  chipStyle,
}: {
  profile: Profile;
  className?: string;
  chipClassName?: string;
  chipStyle?: React.CSSProperties;
}) {
  return (
    <div className={className}>
      {skillsOf(profile).map((s, i) => (
        <span key={i} className={`rounded-lg px-3.5 py-1.5 text-base font-medium ${chipClassName}`} style={chipStyle}>
          {s}
        </span>
      ))}
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────
// Every template renders the SAME editable content model — greeting, name, role,
// headline, bio, skills, the four contact fields and two CTAs — so the data is
// consistent and nothing is hardcoded; only the visual styling differs.

function ClassicTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div
        className="h-40 w-full shrink-0"
        style={{ background: `linear-gradient(135deg, ${profile.accent}55, #c4b5fd 50%, #ddd6fe)` }}
      />
      <div className="-mt-16 flex flex-1 flex-col items-center px-16 pb-10 text-center">
        <Avatar profile={profile} size={120} ring="#ffffff" />
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em]" style={{ color: profile.accent }}>
          {txt(profile.greeting, "Hello, I am")}
        </p>
        <h1 className="text-5xl font-extrabold text-gray-900">{profile.fullName}</h1>
        <p className="mt-1 text-2xl text-gray-500">{profile.role}</p>
        <p className="mt-3 max-w-2xl text-xl font-semibold text-gray-700">{txt(profile.headline, "Crafting work that speaks for itself.")}</p>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-500">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipStyle={{ backgroundColor: `${profile.accent}14`, color: profile.accent }} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-gray-600">
          <ContactItems profile={profile} iconColor={profile.accent} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button className="flex items-center gap-2 rounded-2xl px-7 py-3 text-lg font-semibold text-white shadow-lg" style={{ backgroundColor: profile.accent }}>
            <Contact className="h-5 w-5" /> {txt(profile.ctaPrimary, "Add to Contacts")}
          </button>
          <button className="rounded-2xl border-2 px-7 py-3 text-lg font-semibold" style={{ borderColor: `${profile.accent}55`, color: profile.accent }}>
            {txt(profile.ctaSecondary, "View work")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModernTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full items-center gap-12 bg-gray-50 px-16">
      <div className="flex-1">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-semibold"
          style={{ backgroundColor: `${profile.accent}1a`, color: profile.accent }}
        >
          <Sparkles className="h-4 w-4" /> {txt(profile.greeting, profile.role)}
        </span>
        <h1 className="mt-5 text-6xl font-black leading-[1.05] tracking-tight text-gray-900">
          {txt(profile.headline, "Building Scalable & Engaging Web.")}
        </h1>
        <p className="mt-2 text-2xl font-semibold text-gray-400">{profile.role}</p>
        <p className="mt-5 max-w-md text-xl leading-relaxed text-gray-500">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-5 flex flex-wrap gap-2" chipClassName="shadow-sm" chipStyle={{ backgroundColor: "#fff", color: profile.accent }} />
        <div className="mt-7 flex gap-4">
          <button className="rounded-xl px-7 py-3.5 text-lg font-semibold text-white shadow-lg" style={{ backgroundColor: profile.accent }}>
            {txt(profile.ctaPrimary, "Get in touch")}
          </button>
          <button className="rounded-xl border-2 border-gray-300 px-7 py-3.5 text-lg font-semibold text-gray-700">
            {txt(profile.ctaSecondary, "View work")}
          </button>
        </div>
      </div>
      <div className="flex w-[320px] shrink-0 flex-col items-center">
        <Avatar profile={profile} size={230} ring="#ffffff" />
        <div className="mt-5 w-full rounded-2xl bg-white px-6 py-5 shadow-xl">
          <p className="text-center text-2xl font-bold text-gray-900">{profile.fullName}</p>
          <div className="mt-3 space-y-1.5 text-sm text-gray-500">
            <ContactItems profile={profile} iconColor={profile.accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalistTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-24 text-center">
      <Avatar profile={profile} size={90} ring="#f3f4f6" />
      <p className="mt-5 text-sm uppercase tracking-[0.3em] text-gray-400">{txt(profile.greeting, profile.fullName)}</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-gray-900">
        {txt(profile.headline, "I help startups launch fast, scalable products.")}
      </h1>
      <p className="mt-4 text-xl uppercase tracking-widest text-gray-400">
        {profile.fullName} &mdash; {profile.role}
      </p>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-500">{profile.bio}</p>
      <SkillChips profile={profile} className="mt-5 flex flex-wrap justify-center gap-2" chipClassName="border border-gray-200" chipStyle={{ color: "#6b7280" }} />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base text-gray-500">
        <ContactItems profile={profile} />
      </div>
      <div className="mt-6 flex gap-3">
        <button className="rounded-full px-7 py-3 text-base font-semibold text-white" style={{ backgroundColor: profile.accent }}>{txt(profile.ctaPrimary, "Get in touch")}</button>
        <button className="rounded-full border border-gray-300 px-7 py-3 text-base font-semibold text-gray-700">{txt(profile.ctaSecondary, "View work")}</button>
      </div>
    </div>
  );
}

function PrimeTemplate({ profile }: TemplateProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-900">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 30% 20%, ${profile.accent}66, transparent 55%), radial-gradient(circle at 80% 80%, #1e293b, #0f172a)` }}
      />
      <div className="relative flex h-full flex-col justify-center px-20">
        <p className="text-xl font-medium text-gray-400">{txt(profile.greeting, "Hello, I am")}</p>
        <h1 className="mt-2 text-7xl font-black tracking-tight text-white">{profile.fullName}</h1>
        <p className="mt-3 text-3xl font-semibold" style={{ color: profile.accent }}>{profile.role}</p>
        <p className="mt-4 max-w-2xl text-2xl font-medium text-gray-200">{txt(profile.headline, "Designing bold digital experiences.")}</p>
        <p className="mt-4 max-w-xl text-xl leading-relaxed text-gray-400">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-5 flex flex-wrap gap-2" chipStyle={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-lg text-gray-300">
          <ContactItems profile={profile} iconColor={profile.accent} />
        </div>
        <div className="mt-7 flex gap-4">
          <button className="rounded-full px-8 py-3.5 text-lg font-semibold text-white shadow-xl" style={{ backgroundColor: profile.accent }}>
            {txt(profile.ctaPrimary, "Let's talk")}
          </button>
          <button className="rounded-full border border-white/30 px-8 py-3.5 text-lg font-semibold text-white backdrop-blur">
            {txt(profile.ctaSecondary, "Download CV")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MidnightTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a12] px-16">
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur"
        style={{ boxShadow: `0 0 80px ${profile.accent}33` }}
      >
        <div className="flex justify-center"><Avatar profile={profile} size={108} ring={profile.accent} /></div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: profile.accent }}>{txt(profile.greeting, "Hello, I am")}</p>
        <h1 className="text-4xl font-extrabold text-white">{profile.fullName}</h1>
        <p className="mt-1 text-lg font-semibold uppercase tracking-widest text-gray-400">{profile.role}</p>
        <p className="mt-3 text-lg font-medium text-gray-200">{txt(profile.headline, "Crafting standout brands.")}</p>
        <p className="mt-2 text-base leading-relaxed text-gray-400">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipClassName="border border-white/10" chipStyle={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#d1d5db" }} />
        <div className="mt-4 grid grid-cols-2 gap-3 text-left text-base text-gray-300">
          <ContactItems profile={profile} iconColor={profile.accent} />
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button className="rounded-2xl px-7 py-3 text-base font-bold text-white" style={{ backgroundColor: profile.accent }}>
            {txt(profile.ctaPrimary, "Connect with me")}
          </button>
          <button className="rounded-2xl border border-white/20 px-7 py-3 text-base font-bold text-white">
            {txt(profile.ctaSecondary, "View work")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuroraTemplate({ profile }: TemplateProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center px-20"
      style={{ background: `linear-gradient(135deg, ${profile.accent}, #ec4899 55%, #f59e0b)` }}
    >
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/40 bg-white/20 p-12 text-center text-white shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center"><Avatar profile={profile} size={108} ring="#ffffff" /></div>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-white/90">{txt(profile.greeting, "Hello, I am")}</p>
        <h1 className="text-5xl font-black drop-shadow">{profile.fullName}</h1>
        <p className="mt-1 text-2xl font-medium text-white/90">{profile.role}</p>
        <p className="mt-3 text-2xl font-semibold">{txt(profile.headline, "Let's make something vibrant.")}</p>
        <p className="mt-2 text-lg leading-relaxed text-white/90">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipStyle={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-white/90">
          <ContactItems profile={profile} />
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button className="rounded-full bg-white px-7 py-3 text-base font-bold text-gray-900 shadow-lg">{txt(profile.ctaPrimary, "Hire me")}</button>
          <button className="rounded-full border-2 border-white px-7 py-3 text-base font-bold text-white">{txt(profile.ctaSecondary, "Portfolio")}</button>
        </div>
      </div>
    </div>
  );
}

function CorporateTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex w-[38%] flex-col items-center justify-center p-10 text-center text-white" style={{ backgroundColor: profile.accent }}>
        <Avatar profile={profile} size={150} ring="#ffffff" />
        <h1 className="mt-6 text-4xl font-extrabold">{profile.fullName}</h1>
        <p className="mt-1.5 text-xl text-white/80">{profile.role}</p>
        <div className="mt-8 w-full space-y-3 text-left text-base">
          <ContactItems profile={profile} />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center p-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: profile.accent }}>{txt(profile.greeting, "About me")}</p>
        <h2 className="mt-2 text-4xl font-extrabold leading-tight text-gray-900">{txt(profile.headline, "Driving results through strategy.")}</h2>
        <p className="mt-4 text-xl leading-relaxed text-gray-600">{profile.bio}</p>
        <SkillChips profile={profile} className="mt-6 flex flex-wrap gap-2.5" chipStyle={{ backgroundColor: `${profile.accent}14`, color: profile.accent }} />
        <div className="mt-8 flex gap-3">
          <button className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-lg font-semibold text-white" style={{ backgroundColor: profile.accent }}>
            {txt(profile.ctaPrimary, "Book a meeting")} <ArrowUpRight className="h-5 w-5" />
          </button>
          <button className="rounded-xl border-2 px-7 py-3.5 text-lg font-semibold" style={{ borderColor: `${profile.accent}55`, color: profile.accent }}>
            {txt(profile.ctaSecondary, "View work")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreativeTemplate({ profile }: TemplateProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fef6e4]">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full" style={{ backgroundColor: `${profile.accent}33` }} />
      <div className="absolute -bottom-24 right-10 h-80 w-80 rotate-12 rounded-[3rem] bg-pink-200" />
      <div className="absolute right-40 top-16 h-16 w-16 rotate-45 bg-amber-300" />
      <div className="relative flex h-full flex-col justify-center px-20">
        <p className="text-2xl font-bold" style={{ color: profile.accent }}>{txt(profile.greeting, "Hey, I'm")}</p>
        <h1 className="text-7xl font-black leading-none text-gray-900">{profile.fullName}.</h1>
        <p className="mt-3 max-w-xl text-3xl font-bold text-gray-800">{txt(profile.headline, "I make brands unforgettable.")}</p>
        <p className="mt-3 max-w-lg text-xl font-medium text-gray-700">{profile.bio}</p>
        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-2xl bg-gray-900 px-5 py-2.5 text-xl font-bold text-white">
          <Star className="h-5 w-5" style={{ color: profile.accent }} /> {profile.role}
        </div>
        <SkillChips profile={profile} className="mt-4 flex flex-wrap gap-2" chipClassName="border-2 border-gray-900" chipStyle={{ backgroundColor: "#fff", color: "#374151" }} />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-semibold text-gray-700">
          <ContactItems profile={profile} />
        </div>
        <div className="mt-5 flex gap-3 text-lg">
          <button className="rounded-full px-8 py-3.5 font-bold text-white shadow-[5px_5px_0_0_#111]" style={{ backgroundColor: profile.accent }}>
            {txt(profile.ctaPrimary, "Say hello")}
          </button>
          <button className="rounded-full border-2 border-gray-900 px-8 py-3.5 font-bold text-gray-900">
            {txt(profile.ctaSecondary, "Portfolio")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ElegantTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#f8f5f0] px-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: profile.accent }}>
        {txt(profile.greeting, "Portfolio")}
      </p>
      <div className="my-5 h-px w-20" style={{ backgroundColor: profile.accent }} />
      <h1 className="text-6xl font-light tracking-tight text-gray-900" style={{ fontFamily: "Georgia, serif" }}>{profile.fullName}</h1>
      <p className="mt-3 text-2xl italic text-gray-500" style={{ fontFamily: "Georgia, serif" }}>{profile.role}</p>
      <p className="mt-4 max-w-2xl text-2xl font-light text-gray-700" style={{ fontFamily: "Georgia, serif" }}>{txt(profile.headline, "Timeless work, thoughtfully made.")}</p>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-gray-600">{profile.bio}</p>
      <SkillChips profile={profile} className="mt-5 flex flex-wrap justify-center gap-2" chipStyle={{ border: `1px solid ${profile.accent}55`, color: profile.accent }} />
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base text-gray-600">
        <ContactItems profile={profile} iconColor={profile.accent} />
      </div>
      <div className="mt-6 flex gap-3">
        <button className="border-2 px-9 py-3 text-base font-semibold uppercase tracking-widest" style={{ borderColor: profile.accent, color: profile.accent }}>
          {txt(profile.ctaPrimary, "Get in touch")}
        </button>
        <button className="px-9 py-3 text-base font-semibold uppercase tracking-widest text-white" style={{ backgroundColor: profile.accent }}>
          {txt(profile.ctaSecondary, "View work")}
        </button>
      </div>
    </div>
  );
}

function TechTemplate({ profile }: TemplateProps) {
  const fields: [string, string][] = [
    ["name", profile.fullName],
    ["role", profile.role],
    ["tagline", txt(profile.greeting, "Hello, I am")],
    ["headline", txt(profile.headline, "I build fast, reliable software.")],
    ["bio", profile.bio],
    ["email", profile.email],
    ["phone", profile.phone],
    ["location", profile.location],
    ["site", host(profile.website)],
  ];
  const firstName = profile.fullName.split(" ")[0]?.toLowerCase() || "me";
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0d1117] px-16 font-mono">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-gray-700 bg-[#161b22] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-gray-700 bg-[#0d1117] px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-4 text-sm text-gray-500">~/profile.ts</span>
        </div>
        <div className="space-y-1.5 p-8 text-lg leading-relaxed">
          <p><span className="text-purple-400">const</span> <span style={{ color: profile.accent }}>profile</span> <span className="text-gray-400">= {"{"}</span></p>
          {fields.map(([k, v]) => (
            <p key={k} className="truncate pl-6">
              <span className="text-sky-300">{k}</span><span className="text-gray-400">:</span> <span className="text-amber-300">&apos;{v}&apos;</span><span className="text-gray-400">,</span>
            </p>
          ))}
          <p className="truncate pl-6">
            <span className="text-sky-300">skills</span><span className="text-gray-400">: [</span>
            <span className="text-amber-300">{skillsOf(profile).map((s) => `'${s}'`).join(", ")}</span>
            <span className="text-gray-400">],</span>
          </p>
          <p className="text-gray-400">{"}"}</p>
          <p className="pt-3 text-gray-500">
            <span className="text-green-400">$</span> {txt(profile.ctaPrimary, "hire")} {firstName}{" "}
            <span className="text-gray-600">--{txt(profile.ctaSecondary, "portfolio")}</span>
            <span className="ml-1 inline-block h-5 w-2.5 animate-pulse align-middle" style={{ backgroundColor: profile.accent }} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateDef[] = [
  { id: "classic",    name: "Default Template",    description: "Clean cover & profile",       tags: ["clean", "simple", "default"],      Component: ClassicTemplate },
  { id: "modern",     name: "Modern Template",     description: "Bold statement hero",         tags: ["modern", "bold"],                  Component: ModernTemplate },
  { id: "minimalist", name: "Minimalist Template", description: "Typography focused",          tags: ["minimal", "clean"],                Component: MinimalistTemplate },
  { id: "prime",      name: "Prime Template",      description: "Dark cinematic hero",         tags: ["dark", "cinematic"],               Component: PrimeTemplate },
  { id: "midnight",   name: "Midnight Template",   description: "Dark neon glow card",         tags: ["dark", "neon"],                    Component: MidnightTemplate },
  { id: "aurora",     name: "Aurora Template",     description: "Vibrant glassmorphism",       tags: ["gradient", "colorful"],            Component: AuroraTemplate },
  { id: "corporate",  name: "Corporate Template",  description: "Professional split layout",   tags: ["corporate", "business"],           Component: CorporateTemplate },
  { id: "creative",   name: "Creative Template",   description: "Playful & colorful",          tags: ["creative", "fun"],                 Component: CreativeTemplate },
  { id: "elegant",    name: "Elegant Template",    description: "Luxury serif style",          tags: ["luxury", "elegant"],               Component: ElegantTemplate },
  { id: "tech",       name: "Tech Template",       description: "Code editor vibe",            tags: ["developer", "code"],               Component: TechTemplate },
];

// ─── Form config for each template (used by public profile page) ──────────────

export const TEMPLATE_FORM_CONFIG: Record<string, {
  type: string;
  title: string;
  subtitle: string;
  cta: string;
  dark: boolean;
  sectionBg: string;
  inputBg: string;
  inputBorder: string;
  mutedText: string;
  cardBg: string;
}> = {
  classic:    { type: "Contact",  title: "Get in Touch",        subtitle: "Send me a message and I'll get back to you.",      cta: "Send Message",      dark: false, sectionBg: "bg-gray-50",      inputBg: "bg-white",       inputBorder: "border-gray-200", mutedText: "text-gray-500", cardBg: "bg-white" },
  modern:     { type: "Contact",  title: "Let's Work Together", subtitle: "Ready to build something great together?",         cta: "Let's Talk",        dark: false, sectionBg: "bg-white",        inputBg: "bg-gray-50",     inputBorder: "border-gray-200", mutedText: "text-gray-500", cardBg: "bg-gray-50" },
  minimalist: { type: "Inquiry",  title: "Send an Inquiry",     subtitle: "Reach out for collaborations or questions.",       cta: "Submit Inquiry",    dark: false, sectionBg: "bg-white",        inputBg: "bg-gray-50",     inputBorder: "border-gray-200", mutedText: "text-gray-500", cardBg: "bg-gray-50" },
  prime:      { type: "Contact",  title: "Let's Talk",          subtitle: "Ready to start your next big project?",           cta: "Start Conversation",dark: true,  sectionBg: "bg-gray-900",     inputBg: "bg-gray-800",    inputBorder: "border-gray-700", mutedText: "text-gray-400", cardBg: "bg-gray-800" },
  midnight:   { type: "Contact",  title: "Connect with Me",     subtitle: "Drop me a message anytime.",                      cta: "Connect",           dark: true,  sectionBg: "bg-[#0a0a12]",   inputBg: "bg-white/5",     inputBorder: "border-white/10", mutedText: "text-gray-500", cardBg: "bg-white/5" },
  aurora:     { type: "Booking",  title: "Work with Me",        subtitle: "Tell me about your project and goals.",           cta: "Send Request",      dark: false, sectionBg: "bg-gradient-to-br from-purple-50 to-pink-50", inputBg: "bg-white", inputBorder: "border-purple-200", mutedText: "text-purple-400", cardBg: "bg-white" },
  corporate:  { type: "Meeting",  title: "Book a Meeting",      subtitle: "Schedule time to discuss your needs.",            cta: "Schedule Meeting",  dark: false, sectionBg: "bg-gray-50",      inputBg: "bg-white",       inputBorder: "border-gray-200", mutedText: "text-gray-500", cardBg: "bg-white" },
  creative:   { type: "Contact",  title: "Say Hello! 👋",       subtitle: "I'd love to hear from you!",                      cta: "Say Hello",         dark: false, sectionBg: "bg-[#fef6e4]",   inputBg: "bg-white",       inputBorder: "border-amber-200",mutedText: "text-amber-700",cardBg: "bg-white" },
  elegant:    { type: "Inquiry",  title: "Make an Inquiry",     subtitle: "For project inquiries and collaborations.",       cta: "Send Inquiry",      dark: false, sectionBg: "bg-[#f8f5f0]",   inputBg: "bg-white",       inputBorder: "border-stone-200",mutedText: "text-stone-500", cardBg: "bg-white" },
  tech:       { type: "Contact",  title: "Hire Me",             subtitle: "Let's ship something amazing together.",          cta: "Send Message",      dark: true,  sectionBg: "bg-[#0d1117]",   inputBg: "bg-[#161b22]",   inputBorder: "border-gray-700", mutedText: "text-gray-500", cardBg: "bg-[#161b22]" },
};
