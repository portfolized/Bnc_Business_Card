import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  Wallet,
  Handshake,
  FileClock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { formatNpr, AFFILIATE_RATE } from "@/lib/currency";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

async function getData() {
  const [
    totalOrders,
    totalUsers,
    pendingOrders,
    recentOrders,
    revenueAgg,
    referredRevenueAgg,
    paidAgg,
    pendingArticles,
    pendingPosts,
    latestOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: "DELIVERED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "DELIVERED", user: { referredById: { not: null } } },
    }),
    prisma.user.aggregate({ _sum: { affiliatePaidNpr: true } }),
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true, username: true } } },
    }),
  ]);

  const revenue = revenueAgg._sum.totalAmount ?? 0;
  const earned = (referredRevenueAgg._sum.totalAmount ?? 0) * AFFILIATE_RATE;
  const paid = paidAgg._sum.affiliatePaidNpr ?? 0;

  return {
    totalOrders,
    totalUsers,
    pendingOrders,
    recentOrders,
    revenue,
    affiliateOutstanding: Math.max(0, earned - paid),
    pendingReview: pendingArticles + pendingPosts,
    latestOrders,
  };
}

export default async function AdminPage() {
  const s = await getData();

  const stats = [
    { label: "Total Revenue", value: formatNpr(s.revenue), icon: Wallet, grad: "from-emerald-500 to-teal-500" },
    { label: "Total Orders", value: s.totalOrders, icon: ShoppingBag, grad: "from-blue-500 to-indigo-500" },
    { label: "Total Users", value: s.totalUsers, icon: Users, grad: "from-violet-500 to-purple-500" },
    { label: "Pending Orders", value: s.pendingOrders, icon: Clock, grad: "from-amber-500 to-orange-500" },
    { label: "Orders This Week", value: s.recentOrders, icon: TrendingUp, grad: "from-sky-500 to-cyan-500" },
    { label: "Affiliate Payout Due", value: formatNpr(s.affiliateOutstanding), icon: Handshake, grad: "from-pink-500 to-rose-500" },
    { label: "Content to Review", value: s.pendingReview, icon: FileClock, grad: "from-fuchsia-500 to-pink-500" },
  ];

  const quickActions = [
    { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag, desc: "Update statuses" },
    { label: "Affiliate Payouts", href: "/admin/affiliate", icon: Handshake, desc: "Pay referrers" },
    { label: "Moderate Blog", href: "/admin/articles", icon: BookOpen, desc: "Approve articles" },
  ];

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1120] via-indigo-950 to-emerald-950 p-7 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-slate-300">Welcome back 👋</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Admin Overview</h1>
          <p className="mt-1.5 max-w-lg text-sm text-slate-300">
            Monitor revenue, fulfil orders, settle affiliate payouts, and moderate the blog — all in one place.
          </p>
          {s.pendingReview > 0 && (
            <Link
              href="/admin/articles"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/20"
            >
              <FileClock className="h-3.5 w-3.5" />
              {s.pendingReview} item{s.pendingReview > 1 ? "s" : ""} awaiting review
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, grad }) => (
          <div
            key={label}
            className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`inline-flex rounded-xl bg-gradient-to-br ${grad} p-2.5 text-white shadow-sm`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-sm text-subtext">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-xs text-subtext">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {s.latestOrders.length === 0 ? (
          <div className="py-14 text-center text-sm text-subtext">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {s.latestOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-subtext">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{o.user.name ?? o.user.username ?? "—"}</p>
                    <p className="text-xs text-subtext">{o.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">{formatNpr(o.totalAmount)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? ""}`}>
                      {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-subtext">
                    {o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
