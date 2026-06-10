import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Zap, BarChart3, Palette } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const features = [
  { icon: Zap, text: "Share contacts instantly with NFC tap" },
  { icon: BarChart3, text: "Track views, taps & real-time analytics" },
  { icon: Palette, text: "Customize with stunning card designs" },
];

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[#f0ede8] px-3 pb-8 pt-[82px] sm:px-5 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/[0.06] lg:min-h-[calc(100vh-136px)] lg:flex-row">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col bg-gradient-to-br from-[#00a54f] to-[#005e2e] p-12 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-36 -left-20 w-[420px] h-[420px] rounded-full bg-black/[0.10]" />
        <div className="pointer-events-none absolute top-1/2 right-6 w-36 h-36 rounded-full bg-white/[0.04] -translate-y-1/2" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-14">
            <Image
              src="/logo.png"
              alt="BNC"
              width={44}
              height={44}
              className="rounded-full ring-2 ring-white/30"
              style={{ width: 44, height: 44 }}
              priority
            />
            <div>
              <p className="text-white font-bold text-[15px] leading-tight">BNC Business Card</p>
              <p className="text-white/55 text-xs mt-0.5">Smart NFC Networking</p>
            </div>
          </Link>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-[42px] font-extrabold text-white leading-tight mb-4">
              The future of<br />networking is<br />
              <span className="text-bnc-yellow">here.</span>
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-xs">
              Smart NFC digital cards that make every professional connection count.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4 mb-auto">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/85 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial card */}
          <div className="mt-10 rounded-2xl bg-white/10 border border-white/[0.18] p-5 backdrop-blur-sm">
            <svg className="h-5 w-5 text-white/40 mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-white/85 text-sm italic leading-relaxed">
              BNC transformed how I network. I haven&apos;t handed out a paper card in months.
            </p>
            <div className="flex items-center gap-2.5 mt-3.5">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold shrink-0">
                S
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah K.</p>
                <p className="text-white/55 text-xs">Founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-10 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="BNC"
                width={32}
                height={32}
                className="rounded-full"
                style={{ width: 32, height: 32 }}
              />
              <span className="text-sm font-bold text-foreground">BNC Business Card</span>
            </Link>
          </div>

          {/* Page title */}
          <div className="mb-7">
            <h1 className="text-[28px] font-bold text-foreground tracking-tight">{title}</h1>
            <p className="text-subtext text-sm mt-1.5">{subtitle}</p>
          </div>

          {children}
          {footer}

          <div className="mt-6 pt-5 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-subtext hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-[11px] text-subtext uppercase tracking-widest">
          or continue with email
        </span>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
      <svg
        className="h-4 w-4 mt-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {message}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-foreground placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#00a54f]/15 hover:border-gray-300 hover:bg-gray-50";

export const buttonClassName =
  "w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#009444] hover:shadow-lg hover:shadow-[#00a54f]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

export const googleButtonClassName =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-foreground transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
