"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Eye,
  Users,
  ShoppingBag,
  Palette,
  Globe,
  Plus,
  UserPlus,
  Package,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatNpr } from "@/lib/currency";

type ActivityItem = {
  type: "lead" | "order";
  id: string;
  title: string;
  amount?: number;
  createdAt: string;
};

type Stats = {
  cards: number;
  views: number;
  leads: number;
  orders: number;
  draftOrders: number;
  activity: ActivityItem[];
};

const STAT_CARDS: { key: keyof Stats; label: string; icon: React.ElementType; tint: string }[] = [
  { key: "cards", label: "Cards", icon: CreditCard, tint: "bg-violet-50 text-violet-600" },
  { key: "views", label: "Profile views", icon: Eye, tint: "bg-blue-50 text-blue-600" },
  { key: "leads", label: "Leads", icon: Users, tint: "bg-emerald-50 text-emerald-600" },
  { key: "orders", label: "Orders", icon: ShoppingBag, tint: "bg-amber-50 text-amber-600" },
];

const QUICK_ACTIONS = [
  { label: "Order a card", desc: "Design & order a new NFC card", href: "/dashboard/orders?new=1", icon: Plus },
  { label: "Edit themes", desc: "Choose a template for your card", href: "/dashboard/themes", icon: Palette },
  { label: "Set a domain", desc: "Claim your profile username", href: "/dashboard/domain", icon: Globe },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function HomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const value = (key: keyof Stats) => {
    const v = stats?.[key];
    return typeof v === "number" ? v.toLocaleString("en-IN") : "—";
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Greeting banner */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <span className="text-xl">✦</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-violet-600">
              {greeting}, {userName}
            </p>
            <p className="text-xs text-gray-500">
              Here&apos;s how your cards are doing. Manage themes, domains and orders from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, tint }) => (
            <div key={key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-gray-300" /> : value(key)}
              </p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Pending payment nudge */}
        {!loading && stats && stats.draftOrders > 0 && (
          <Link
            href="/dashboard/orders"
            className="mt-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition hover:bg-amber-100/70"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium text-amber-800">
              <Package className="h-4 w-4" />
              You have {stats.draftOrders} order{stats.draftOrders > 1 ? "s" : ""} awaiting payment.
            </span>
            <ArrowRight className="h-4 w-4 text-amber-700" />
          </Link>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          {/* Recent activity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Recent activity</h2>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              </div>
            ) : stats && stats.activity.length > 0 ? (
              <ul className="space-y-3">
                {stats.activity.map((a) => (
                  <li key={`${a.type}-${a.id}`} className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        a.type === "lead" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {a.type === "lead" ? <UserPlus className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-400">{timeAgo(a.createdAt)}</p>
                    </div>
                    {typeof a.amount === "number" && (
                      <span className="text-sm font-semibold text-gray-700">{formatNpr(a.amount)}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-8 w-8 text-gray-200" />
                <p className="mt-2 text-sm font-medium text-gray-600">No activity yet</p>
                <p className="text-xs text-gray-400">Orders and leads will show up here.</p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Quick actions</h2>
            {QUICK_ACTIONS.map(({ label, desc, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:bg-violet-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
