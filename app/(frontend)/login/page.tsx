"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { homePathForRole, postLoginPath } from "@/lib/auth-routes";
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
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  // Only allow internal redirects.
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Persist a referral code if someone arrives here via a ?ref= link, so a
  // first-time Google sign-in still attributes the referrer.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `bnc_ref=${encodeURIComponent(ref.trim())}; max-age=2592000; path=/; samesite=lax`;
    }
  }, []);

  // Already signed in — send admins to the admin console, everyone else to the dashboard.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    router.replace(homePathForRole(session.user.role));
  }, [status, session, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const freshSession = await getSession();
    router.push(postLoginPath(freshSession?.user?.role, safeNext()));
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: postLoginPath(undefined, safeNext()) });
  }

  return (
    <>
      <Navbar />
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your BNC Business Card account"
        footer={
          <p className="mt-5 text-center text-sm text-subtext">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create one free
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/90">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={inputClassName}
              />
            </div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`${buttonClassName} mt-1`}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </AuthCard>
    </>
  );
}
