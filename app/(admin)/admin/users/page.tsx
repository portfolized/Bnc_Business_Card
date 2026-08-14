"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronRight,
  Users,
  UserCog,
  ShoppingBag,
  Search,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import PasswordInput from "@/components/ui/PasswordInput";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number; profiles: number; leads: number; referrals: number };
};

type RoleFilter = "ALL" | "admin" | "user";

// Mirror the signup form's input/button styling for a familiar look.
const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-foreground placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#00a54f]/15 hover:border-gray-300 hover:bg-gray-50";

const buttonClass =
  "w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#009444] hover:shadow-lg hover:shadow-[#00a54f]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground/90";

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onCreated(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Create user</h2>
            <p className="mt-0.5 text-sm text-subtext">Add a new account with email, username, and password.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <ErrorBox message={error} />

          <div>
            <label htmlFor="create-username" className={labelClass}>Username</label>
            <input
              id="create-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              autoComplete="off"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]{3,20}"
              title="3–20 characters: letters, numbers, or underscores"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-subtext">3–20 chars: letters, numbers, underscores</p>
          </div>

          <div>
            <label htmlFor="create-email" className={labelClass}>Email address</label>
            <input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="off"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="create-password" className={labelClass}>Password</label>
            <PasswordInput
              id="create-password"
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
            <label htmlFor="create-confirm" className={labelClass}>Confirm password</label>
            <PasswordInput
              id="create-confirm"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL") {
        const isAdmin = u.role === "admin";
        if (roleFilter === "admin" && !isAdmin) return false;
        if (roleFilter === "user" && isAdmin) return false;
      }
      if (!q) return true;
      return (
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const withOrders = users.filter((u) => u._count.orders > 0).length;

  const openUser = (id: string) => router.push(`/admin/users/${id}`);

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <PageHeader
        icon={Users}
        eyebrow="People"
        title="Users"
        subtitle="Everyone registered on BNC. Click a user to see everything about them."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" /> Create user
          </button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={users.length} icon={Users} grad="from-violet-500 to-purple-500" />
        <StatCard label="Admins" value={adminCount} icon={UserCog} grad="from-indigo-500 to-blue-500" />
        <StatCard label="Customers (with orders)" value={withOrders} icon={ShoppingBag} grad="from-emerald-500 to-teal-500" />
      </div>

      {/* Search + filter toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or username…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          {(["ALL", "admin", "user"] as RoleFilter[]).map((f) => {
            const count = f === "ALL" ? users.length : users.filter((u) => (f === "admin" ? u.role === "admin" : u.role !== "admin")).length;
            const label = f === "ALL" ? "All" : f === "admin" ? "Admins" : "Users";
            return (
              <button
                key={f}
                type="button"
                onClick={() => setRoleFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  roleFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {label} <span className="text-xs text-gray-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-center">Cards</th>
                <th className="px-5 py-3 text-center">Orders</th>
                <th className="px-5 py-3 text-center">Leads</th>
                <th className="px-5 py-3 text-center">Referrals</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-sm text-subtext">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openUser(u.id)}
                    className="group cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-bold text-white">
                          {(u.name || u.email || "U").charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">{u.name ?? u.username ?? "—"}</span>
                          <span className="block truncate text-xs text-subtext">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">User</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center text-foreground">{u._count.profiles}</td>
                    <td className="px-5 py-3 text-center text-foreground">{u._count.orders}</td>
                    <td className="px-5 py-3 text-center text-foreground">{u._count.leads}</td>
                    <td className="px-5 py-3 text-center text-foreground">{u._count.referrals}</td>
                    <td className="px-5 py-3 text-subtext">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex text-gray-300 transition group-hover:text-indigo-500">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && (
        <CreateUserModal
          onClose={() => setCreateOpen(false)}
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}
