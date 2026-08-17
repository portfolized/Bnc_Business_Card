import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import RichText from "./RichText";
import InfoButton from "./InfoButton";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SocialLink = { platform: string; url: string };

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
  bankAccount: string;
  insurance: string;
  socialLinks: SocialLink[];
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

// ─── Social media icons (inline SVGs, no extra dependency) ───────────────────

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  github: "GitHub",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

// Social links shared by every template, rendered below ContactItems.
function SocialLinks({ profile, iconColor }: { profile: Profile; iconColor?: string }) {
  if (!profile.socialLinks || profile.socialLinks.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {profile.socialLinks.map((link, i) => {
        if (!link.url) return null;
        const icon = PLATFORM_ICONS[link.platform];
        if (!icon) return null;
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-80"
            style={{ backgroundColor: iconColor ? `${iconColor}20` : undefined, color: iconColor }}
            title={PLATFORM_LABELS[link.platform] || link.platform}
          >
            {icon}
          </a>
        );
      })}
    </div>
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
        <RichText text={txt(profile.headline, "Crafting work that speaks for itself.")} className="mt-3 max-w-2xl text-xl font-semibold text-gray-700" />
        <RichText text={profile.bio} className="mt-2 max-w-2xl text-base leading-relaxed text-gray-500" maxLength={200} />
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipStyle={{ backgroundColor: `${profile.accent}14`, color: profile.accent }} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-gray-600">
          <ContactItems profile={profile} iconColor={profile.accent} />
          <div className="mt-3"><SocialLinks profile={profile} iconColor={profile.accent} /></div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <InfoButton
            title="Bank Account"
            content={profile.bankAccount}
            accent={profile.accent}
            className="rounded-2xl px-7 py-3 text-lg font-semibold text-white shadow-lg"
            style={{ backgroundColor: profile.accent }}
          >
            Bank Account
          </InfoButton>
          <InfoButton
            title="Insurance"
            content={profile.insurance}
            accent={profile.accent}
            className="rounded-2xl border-2 px-7 py-3 text-lg font-semibold"
            style={{ borderColor: `${profile.accent}55`, color: profile.accent }}
          >
            Insurance
          </InfoButton>
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
        <RichText text={txt(profile.headline, "Building Scalable & Engaging Web.")} className="mt-5 text-6xl font-black leading-[1.05] tracking-tight text-gray-900" />
        <p className="mt-2 text-2xl font-semibold text-gray-400">{profile.role}</p>
        <RichText text={profile.bio} className="mt-5 max-w-md text-xl leading-relaxed text-gray-500" maxLength={200} />
        <SkillChips profile={profile} className="mt-5 flex flex-wrap gap-2" chipClassName="shadow-sm" chipStyle={{ backgroundColor: "#fff", color: profile.accent }} />
        <div className="mt-7 flex gap-4">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-xl px-7 py-3.5 text-lg font-semibold text-white shadow-lg" style={{ backgroundColor: profile.accent }}>
            Bank Account
          </InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-xl border-2 border-gray-300 px-7 py-3.5 text-lg font-semibold text-gray-700">
            Insurance
          </InfoButton>
        </div>
      </div>
      <div className="flex w-[320px] shrink-0 flex-col items-center">
        <Avatar profile={profile} size={230} ring="#ffffff" />
        <div className="mt-5 w-full rounded-2xl bg-white px-6 py-5 shadow-xl">
          <p className="text-center text-2xl font-bold text-gray-900">{profile.fullName}</p>
          <div className="mt-3 space-y-1.5 text-sm text-gray-500">
            <ContactItems profile={profile} iconColor={profile.accent} />
          <div className="mt-3"><SocialLinks profile={profile} iconColor={profile.accent} /></div>
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
      <RichText text={txt(profile.headline, "I help startups launch fast, scalable products.")} className="mt-3 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-gray-900" />
      <p className="mt-4 text-xl uppercase tracking-widest text-gray-400">
        {profile.fullName} &mdash; {profile.role}
      </p>
      <RichText text={profile.bio} className="mt-4 max-w-xl text-lg leading-relaxed text-gray-500" maxLength={200} />
      <SkillChips profile={profile} className="mt-5 flex flex-wrap justify-center gap-2" chipClassName="border border-gray-200" chipStyle={{ color: "#6b7280" }} />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base text-gray-500">
        <ContactItems profile={profile} />
      </div>
      <div className="mt-3 flex justify-center"><SocialLinks profile={profile} /></div>
      <div className="mt-6 flex gap-3">
        <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-full px-7 py-3 text-base font-semibold text-white" style={{ backgroundColor: profile.accent }}>Bank Account</InfoButton>
        <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-full border border-gray-300 px-7 py-3 text-base font-semibold text-gray-700">Insurance</InfoButton>
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
        <RichText text={txt(profile.headline, "Designing bold digital experiences.")} className="mt-4 max-w-2xl text-2xl font-medium text-gray-200" />
        <RichText text={profile.bio} className="mt-4 max-w-xl text-xl leading-relaxed text-gray-400" maxLength={200} />
        <SkillChips profile={profile} className="mt-5 flex flex-wrap gap-2" chipStyle={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-lg text-gray-300">
          <ContactItems profile={profile} iconColor={profile.accent} />
          <div className="mt-3"><SocialLinks profile={profile} iconColor={profile.accent} /></div>
        </div>
        <div className="mt-7 flex gap-4">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-full px-8 py-3.5 text-lg font-semibold text-white shadow-xl" style={{ backgroundColor: profile.accent }}>Bank Account</InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-full border border-white/30 px-8 py-3.5 text-lg font-semibold text-white backdrop-blur">Insurance</InfoButton>
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
        <RichText text={txt(profile.headline, "Crafting standout brands.")} className="mt-3 text-lg font-medium text-gray-200" />
        <RichText text={profile.bio} className="mt-2 text-base leading-relaxed text-gray-400" maxLength={200} />
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipClassName="border border-white/10" chipStyle={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#d1d5db" }} />
        <div className="mt-4 grid grid-cols-2 gap-3 text-left text-base text-gray-300">
          <ContactItems profile={profile} iconColor={profile.accent} />
          <div className="mt-3"><SocialLinks profile={profile} iconColor={profile.accent} /></div>
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-2xl px-7 py-3 text-base font-bold text-white" style={{ backgroundColor: profile.accent }}>Bank Account</InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-2xl border border-white/20 px-7 py-3 text-base font-bold text-white">Insurance</InfoButton>
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
        <RichText text={txt(profile.headline, "Let's make something vibrant.")} className="mt-3 text-2xl font-semibold" />
        <RichText text={profile.bio} className="mt-2 text-lg leading-relaxed text-white/90" maxLength={200} />
        <SkillChips profile={profile} className="mt-4 flex flex-wrap justify-center gap-2" chipStyle={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-white/90">
          <ContactItems profile={profile} />
          <div className="mt-3"><SocialLinks profile={profile} /></div>
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-full bg-white px-7 py-3 text-base font-bold text-gray-900 shadow-lg">Bank Account</InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-full border-2 border-white px-7 py-3 text-base font-bold text-white">Insurance</InfoButton>
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
          <div className="mt-3"><SocialLinks profile={profile} /></div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center p-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: profile.accent }}>{txt(profile.greeting, "About me")}</p>
        <RichText text={txt(profile.headline, "Driving results through strategy.")} className="mt-2 text-4xl font-extrabold leading-tight text-gray-900" />
        <RichText text={profile.bio} className="mt-4 text-xl leading-relaxed text-gray-600" maxLength={200} />
        <SkillChips profile={profile} className="mt-6 flex flex-wrap gap-2.5" chipStyle={{ backgroundColor: `${profile.accent}14`, color: profile.accent }} />
        <div className="mt-8 flex gap-3">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-xl px-7 py-3.5 text-lg font-semibold text-white" style={{ backgroundColor: profile.accent }}>
            Bank Account
          </InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-xl border-2 px-7 py-3.5 text-lg font-semibold" style={{ borderColor: `${profile.accent}55`, color: profile.accent }}>
            Insurance
          </InfoButton>
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
        <RichText text={txt(profile.headline, "I make brands unforgettable.")} className="mt-3 max-w-xl text-3xl font-bold text-gray-800" />
        <RichText text={profile.bio} className="mt-3 max-w-lg text-xl font-medium text-gray-700" maxLength={200} />
        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-2xl bg-gray-900 px-5 py-2.5 text-xl font-bold text-white">
          <Star className="h-5 w-5" style={{ color: profile.accent }} /> {profile.role}
        </div>
        <SkillChips profile={profile} className="mt-4 flex flex-wrap gap-2" chipClassName="border-2 border-gray-900" chipStyle={{ backgroundColor: "#fff", color: "#374151" }} />
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-semibold text-gray-700">
          <ContactItems profile={profile} />
          <div className="mt-3"><SocialLinks profile={profile} /></div>
        </div>
        <div className="mt-5 flex gap-3 text-lg">
          <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="rounded-full px-8 py-3.5 font-bold text-white shadow-[5px_5px_0_0_#111]" style={{ backgroundColor: profile.accent }}>Bank Account</InfoButton>
          <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="rounded-full border-2 border-gray-900 px-8 py-3.5 font-bold text-gray-900">Insurance</InfoButton>
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
      <RichText text={txt(profile.headline, "Timeless work, thoughtfully made.")} className="mt-4 max-w-2xl text-2xl font-light text-gray-700" style={{ fontFamily: "Georgia, serif" }} />
      <RichText text={profile.bio} className="mt-3 max-w-xl text-lg leading-relaxed text-gray-600" maxLength={200} />
      <SkillChips profile={profile} className="mt-5 flex flex-wrap justify-center gap-2" chipStyle={{ border: `1px solid ${profile.accent}55`, color: profile.accent }} />
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base text-gray-600">
        <ContactItems profile={profile} iconColor={profile.accent} />
      </div>
      <div className="mt-3 flex justify-center"><SocialLinks profile={profile} iconColor={profile.accent} /></div>
      <div className="mt-6 flex gap-3">
        <InfoButton title="Bank Account" content={profile.bankAccount} accent={profile.accent} className="border-2 px-9 py-3 text-base font-semibold uppercase tracking-widest" style={{ borderColor: profile.accent, color: profile.accent }}>Bank Account</InfoButton>
        <InfoButton title="Insurance" content={profile.insurance} accent={profile.accent} className="px-9 py-3 text-base font-semibold uppercase tracking-widest text-white" style={{ backgroundColor: profile.accent }}>Insurance</InfoButton>
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
          <p className="truncate pl-6">
            <span className="text-sky-300">socials</span><span className="text-gray-400">: [</span>
            <span className="text-amber-300">{profile.socialLinks?.filter(s => s.url).map((s) => `'${s.platform}'`).join(", ") || "none"}</span>
            <span className="text-gray-400">],</span>
          </p>
          <p className="text-gray-400">{"}"}</p>
          <p className="pt-3 text-gray-500">
            <span className="text-green-400">$</span> bank-account {firstName}{" "}
            <span className="text-gray-600">--insurance</span>
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
