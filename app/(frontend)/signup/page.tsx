"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Landing/Navbar";
import AuthCard, {
  AuthDivider,
  AuthError,
  GoogleIcon,
  buttonClassName,
  googleButtonClassName,
  inputClassName,
} from "@/components/auth/AuthCard";

function safeNext() {
  if (typeof window === "undefined") return "/dashboard";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") ? next : "/dashboard";
}

// The referral code from ?ref=, falling back to the persisted cookie (so it
// survives a Google round-trip). Stored so both credential and OAuth signups
// attribute the referrer.
function getRefCode() {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(window.location.search).get("ref");
  if (fromUrl) return fromUrl.trim();
  const match = document.cookie.match(/(?:^|;\s*)bnc_ref=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SignupPage() {
  const router = useRouter();

  // Persist an incoming referral code for 30 days so Google signups count.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `bnc_ref=${encodeURIComponent(ref.trim())}; max-age=2592000; path=/; samesite=lax`;
    }
  }, []);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, ref: getRefCode() }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but sign-in failed. Please log in manually.");
      return;
    }

    router.push(safeNext());
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: safeNext() });
  }

  return (
    <>
      <Navbar />
      <AuthCard
        title="Create your account"
        subtitle="Join BNC Business Card and start networking smarter"
        footer={
          <p className="mt-5 text-center text-sm text-subtext">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="space-y-4">
          <AuthError message={error} />

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className={googleButtonClassName}
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground/90">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                autoComplete="username"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3–20 characters: letters, numbers, or underscores"
                className={inputClassName}
              />
              <p className="mt-1 text-[11px] text-subtext">3–20 chars: letters, numbers, underscores</p>
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground/90">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground/90">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
                className={inputClassName}
              />
              <p className="mt-1 text-[11px] text-subtext">At least 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`${buttonClassName} mt-1`}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
      </AuthCard>
    </>
  );
}
