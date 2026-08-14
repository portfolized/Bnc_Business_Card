"use client";

import { useState } from "react";
import { KeyRound, X, Loader2, Check } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-foreground placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#00a54f]/15 hover:border-gray-300 hover:bg-gray-50";

const buttonClass =
  "w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

export default function ResetPassword({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function close() {
    setOpen(false);
    setPassword("");
    setConfirm("");
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(close, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <KeyRound className="h-4 w-4" /> Reset password
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Reset password</h2>
                <p className="mt-0.5 text-sm text-subtext">Set a new password for this account.</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <Check className="h-4 w-4 shrink-0" /> Password updated.
                </div>
              )}

              <div>
                <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-foreground/90">
                  New password
                </label>
                <PasswordInput
                  id="reset-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-subtext">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium text-foreground/90">
                  Confirm password
                </label>
                <PasswordInput
                  id="reset-confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className={inputClass}
                />
              </div>

              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
