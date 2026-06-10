import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Contact,
  ArrowUpRight,
  Code2,
  Briefcase,
  Share2,
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
};

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

// ─── Templates ────────────────────────────────────────────────────────────────

function ClassicTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div
        className="h-64 w-full"
        style={{ background: `linear-gradient(135deg, ${profile.accent}55, #c4b5fd 50%, #ddd6fe)` }}
      />
      <div className="-mt-20 flex flex-1 flex-col items-center px-12 pb-12 text-center">
        <Avatar profile={profile} size={150} ring="#ffffff" />
        <h1 className="mt-6 text-5xl font-extrabold text-gray-900">{profile.fullName}</h1>
        <p className="mt-2 text-2xl text-gray-500">{profile.role}</p>
        <p className="mt-6 max-w-xl text-xl leading-relaxed text-gray-600">{profile.bio}</p>
        <div className="mt-7 space-y-3 text-lg" style={{ color: profile.accent }}>
          <p className="flex items-center justify-center gap-2"><Mail className="h-5 w-5" /> {profile.email}</p>
          <p className="flex items-center justify-center gap-2"><Phone className="h-5 w-5" /> {profile.phone}</p>
        </div>
        <button
          className="mt-9 flex items-center gap-3 rounded-2xl px-9 py-4 text-xl font-semibold text-white shadow-lg"
          style={{ backgroundColor: profile.accent }}
        >
          <Contact className="h-6 w-6" /> Add to Contacts
        </button>
      </div>
    </div>
  );
}

function ModernTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full items-center bg-gray-50 px-20">
      <div className="flex-1">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-semibold"
          style={{ backgroundColor: `${profile.accent}1a`, color: profile.accent }}
        >
          <Sparkles className="h-4 w-4" /> {profile.role}
        </span>
        <h1 className="mt-6 text-7xl font-black leading-[1.05] tracking-tight text-gray-900">
          {profile.headline || "Building Scalable & Engaging Web."}
        </h1>
        <p className="mt-7 max-w-md text-2xl leading-relaxed text-gray-500">{profile.bio}</p>
        <div className="mt-9 flex gap-4">
          <button className="rounded-xl px-8 py-4 text-xl font-semibold text-white shadow-lg" style={{ backgroundColor: profile.accent }}>
            Get in touch
          </button>
          <button className="rounded-xl border-2 border-gray-300 px-8 py-4 text-xl font-semibold text-gray-700">
            View work
          </button>
        </div>
      </div>
      <div className="relative ml-12 flex flex-col items-center">
        <Avatar profile={profile} size={300} ring="#ffffff" />
        <div className="mt-6 rounded-2xl bg-white px-7 py-4 text-center shadow-xl">
          <p className="text-2xl font-bold text-gray-900">{profile.fullName}</p>
          <p className="text-lg text-gray-400">{host(profile.website)}</p>
        </div>
      </div>
    </div>
  );
}

function MinimalistTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-24 text-center">
      <Avatar profile={profile} size={96} ring="#f3f4f6" />
      <h1 className="mt-10 max-w-3xl text-6xl font-bold leading-tight tracking-tight text-gray-900">
        {profile.headline ? (
          profile.headline
        ) : (
          <>I help startups launch{" "}<span style={{ color: profile.accent }}>fast,</span> scalable products.</>
        )}
      </h1>
      <p className="mt-8 text-2xl uppercase tracking-widest text-gray-400">
        {profile.fullName} &mdash; {profile.role}
      </p>
      <div className="mt-12 flex items-center gap-10 text-xl text-gray-500">
        <span className="flex items-center gap-2"><Mail className="h-5 w-5" /> {profile.email}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        <span className="flex items-center gap-2"><Globe className="h-5 w-5" /> {host(profile.website)}</span>
      </div>
      <div className="mt-14 flex items-center gap-12 opacity-40">
        {["ACME", "NOVA", "PIXEL", "VERTEX", "ORBIT"].map((b) => (
          <span key={b} className="text-2xl font-black tracking-widest text-gray-400">{b}</span>
        ))}
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
      <div className="relative flex h-full flex-col justify-center px-24">
        <p className="text-2xl font-medium text-gray-400">Hello, I am</p>
        <h1 className="mt-3 text-8xl font-black tracking-tight text-white">{profile.fullName}</h1>
        <p className="mt-4 text-3xl font-semibold" style={{ color: profile.accent }}>{profile.role}</p>
        <p className="mt-8 max-w-xl text-2xl leading-relaxed text-gray-300">{profile.bio}</p>
        <div className="mt-10 flex gap-4">
          <button className="rounded-full px-9 py-4 text-xl font-semibold text-white shadow-xl" style={{ backgroundColor: profile.accent }}>
            Let&apos;s talk
          </button>
          <button className="rounded-full border border-white/30 px-9 py-4 text-xl font-semibold text-white backdrop-blur">
            Download CV
          </button>
        </div>
        <div className="mt-12 flex gap-5 text-white/70">
          {[Code2, Briefcase, Share2].map((Icon, i) => (
            <span key={i} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20">
              <Icon className="h-5 w-5" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MidnightTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a12] px-20">
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-white/3 p-14 text-center backdrop-blur"
        style={{ boxShadow: `0 0 80px ${profile.accent}33` }}
      >
        <div className="flex justify-center"><Avatar profile={profile} size={140} ring={profile.accent} /></div>
        <h1 className="mt-7 text-5xl font-extrabold text-white">{profile.fullName}</h1>
        <p className="mt-2 text-xl font-semibold uppercase tracking-widest" style={{ color: profile.accent }}>{profile.role}</p>
        <p className="mt-6 text-xl leading-relaxed text-gray-400">{profile.bio}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 text-left text-lg text-gray-300">
          <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <Mail className="h-5 w-5" style={{ color: profile.accent }} /> {profile.email}
          </span>
          <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            <Phone className="h-5 w-5" style={{ color: profile.accent }} /> {profile.phone}
          </span>
        </div>
        <button className="mt-9 w-full rounded-2xl py-4 text-xl font-bold text-white" style={{ backgroundColor: profile.accent }}>
          Connect with me
        </button>
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
      <div className="w-full max-w-3xl rounded-4xl border border-white/40 bg-white/20 p-14 text-center text-white shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center"><Avatar profile={profile} size={140} ring="#ffffff" /></div>
        <h1 className="mt-7 text-6xl font-black drop-shadow">{profile.fullName}</h1>
        <p className="mt-2 text-2xl font-medium text-white/90">{profile.role}</p>
        <p className="mt-6 text-2xl leading-relaxed text-white/90">{profile.bio}</p>
        <div className="mt-9 flex justify-center gap-4">
          <button className="rounded-full bg-white px-9 py-4 text-xl font-bold text-gray-900 shadow-lg">Hire me</button>
          <button className="rounded-full border-2 border-white px-9 py-4 text-xl font-bold text-white">Portfolio</button>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-lg text-white/80">
          <Globe className="h-5 w-5" /> {host(profile.website)}
        </p>
      </div>
    </div>
  );
}

function CorporateTemplate({ profile }: TemplateProps) {
  const skillList = profile.skills
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["Strategy", "Leadership", "Product", "Growth", "Design"];

  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex w-[38%] flex-col items-center justify-center p-12 text-center text-white" style={{ backgroundColor: profile.accent }}>
        <Avatar profile={profile} size={170} ring="#ffffff" />
        <h1 className="mt-7 text-4xl font-extrabold">{profile.fullName}</h1>
        <p className="mt-2 text-xl text-white/80">{profile.role}</p>
        <div className="mt-10 w-full space-y-4 text-left text-lg">
          <p className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0" /> <span className="truncate">{profile.email}</span></p>
          <p className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0" /> {profile.phone}</p>
          <p className="flex items-center gap-3"><MapPin className="h-5 w-5 shrink-0" /> {profile.location}</p>
        </div>
      </div>
      <div className="flex-1 p-14">
        <h2 className="text-base font-bold uppercase tracking-widest text-gray-400">About</h2>
        <p className="mt-4 text-2xl leading-relaxed text-gray-700">{profile.bio}</p>
        <h2 className="mt-12 text-base font-bold uppercase tracking-widest text-gray-400">Expertise</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {skillList.map((s) => (
            <span key={s} className="rounded-lg px-5 py-2.5 text-lg font-medium" style={{ backgroundColor: `${profile.accent}14`, color: profile.accent }}>{s}</span>
          ))}
        </div>
        <button className="mt-12 flex items-center gap-2 rounded-xl px-8 py-4 text-xl font-semibold text-white" style={{ backgroundColor: profile.accent }}>
          Book a meeting <ArrowUpRight className="h-5 w-5" />
        </button>
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
      <div className="relative flex h-full flex-col justify-center px-24">
        <h1 className="text-8xl font-black leading-none text-gray-900">
          {profile.headline ? (
            <>{profile.headline}<br /><span style={{ color: profile.accent }}>{profile.fullName}.</span></>
          ) : (
            <>Hey, I&apos;m <br /><span style={{ color: profile.accent }}>{profile.fullName}.</span></>
          )}
        </h1>
        <p className="mt-6 max-w-lg text-3xl font-medium text-gray-700">{profile.bio}</p>
        <div className="mt-8 inline-flex w-fit items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3 text-2xl font-bold text-white">
          <Star className="h-6 w-6" style={{ color: profile.accent }} /> {profile.role}
        </div>
        <div className="mt-10 flex gap-4 text-xl">
          <button className="rounded-full px-9 py-4 font-bold text-white shadow-[6px_6px_0_0_#111]" style={{ backgroundColor: profile.accent }}>
            Say hello
          </button>
          <span className="flex items-center gap-2 px-4 py-4 font-semibold text-gray-700">
            <Mail className="h-5 w-5" /> {profile.email}
          </span>
        </div>
      </div>
    </div>
  );
}

function ElegantTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#f8f5f0] px-24 text-center">
      <div className="text-base font-semibold uppercase tracking-widest" style={{ color: profile.accent }}>
        {profile.headline || "Portfolio"}
      </div>
      <div className="my-8 h-px w-24" style={{ backgroundColor: profile.accent }} />
      <h1 className="text-7xl font-light tracking-tight text-gray-900" style={{ fontFamily: "Georgia, serif" }}>{profile.fullName}</h1>
      <p className="mt-4 text-3xl italic text-gray-500" style={{ fontFamily: "Georgia, serif" }}>{profile.role}</p>
      <p className="mt-8 max-w-xl text-2xl leading-relaxed text-gray-600">{profile.bio}</p>
      <div className="my-9 h-px w-24" style={{ backgroundColor: profile.accent }} />
      <div className="flex items-center gap-10 text-xl text-gray-600">
        <span className="flex items-center gap-2"><Mail className="h-5 w-5" style={{ color: profile.accent }} /> {profile.email}</span>
        <span className="flex items-center gap-2"><Phone className="h-5 w-5" style={{ color: profile.accent }} /> {profile.phone}</span>
      </div>
      <button className="mt-10 border-2 px-12 py-4 text-lg font-semibold uppercase tracking-widest" style={{ borderColor: profile.accent, color: profile.accent }}>
        Get in touch
      </button>
    </div>
  );
}

function TechTemplate({ profile }: TemplateProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0d1117] px-20 font-mono">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-gray-700 bg-[#161b22] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-gray-700 bg-[#0d1117] px-5 py-3">
          <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
          <span className="h-3.5 w-3.5 rounded-full bg-yellow-500" />
          <span className="h-3.5 w-3.5 rounded-full bg-green-500" />
          <span className="ml-4 text-base text-gray-500">~/profile.ts</span>
        </div>
        <div className="space-y-2 p-10 text-2xl leading-relaxed">
          <p><span className="text-purple-400">const</span> <span style={{ color: profile.accent }}>developer</span> <span className="text-gray-400">= {"{"}</span></p>
          <p className="pl-8"><span className="text-sky-300">name</span><span className="text-gray-400">:</span> <span className="text-amber-300">&apos;{profile.fullName}&apos;</span><span className="text-gray-400">,</span></p>
          <p className="pl-8"><span className="text-sky-300">role</span><span className="text-gray-400">:</span> <span className="text-amber-300">&apos;{profile.role}&apos;</span><span className="text-gray-400">,</span></p>
          <p className="pl-8"><span className="text-sky-300">email</span><span className="text-gray-400">:</span> <span className="text-amber-300">&apos;{profile.email}&apos;</span><span className="text-gray-400">,</span></p>
          <p className="pl-8"><span className="text-sky-300">site</span><span className="text-gray-400">:</span> <span className="text-amber-300">&apos;{host(profile.website)}&apos;</span><span className="text-gray-400">,</span></p>
          <p className="text-gray-400">{"}"}</p>
          <p className="pt-4 text-gray-500">
            <span className="text-green-400">$</span> hire {profile.fullName.split(" ")[0].toLowerCase()}
            <span className="ml-1 inline-block h-6 w-3 animate-pulse align-middle" style={{ backgroundColor: profile.accent }} />
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
