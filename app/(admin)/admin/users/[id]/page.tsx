import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Users as UsersIcon,
  Wallet,
  ExternalLink,
  Globe,
  Inbox,
} from "lucide-react";
import { formatNpr, AFFILIATE_RATE } from "@/lib/currency";

const ORDER_STATUS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const LEAD_STATUS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-600",
  CONTACTED: "bg-yellow-50 text-yellow-600",
  IN_PROGRESS: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profiles: {
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { orders: true, leads: true } } },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { profile: { select: { label: true, slug: true } } },
      },
      leads: {
        orderBy: { createdAt: "desc" },
        include: { profile: { select: { label: true, slug: true } } },
      },
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          orders: { select: { totalAmount: true, status: true } },
        },
      },
      referredBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  const earned = user.referrals.reduce(
    (sum, r) => sum + r.orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.totalAmount * AFFILIATE_RATE, 0),
    0
  );
  const due = Math.max(0, earned - user.affiliatePaidNpr);

  const stats = [
    { label: "Cards / Domains", value: user.profiles.length, icon: CreditCard },
    { label: "Orders", value: user.orders.length, icon: ShoppingBag },
    { label: "Leads", value: user.leads.length, icon: Inbox },
    { label: "Referrals", value: user.referrals.length, icon: UsersIcon },
  ];

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <Link href="/admin/users" className="mb-5 inline-flex items-center gap-1.5 text-sm text-subtext hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-2xl font-bold text-white">
          {(user.name || user.email || "U").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{user.name ?? user.username ?? "—"}</h1>
            {user.role === "admin" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">User</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-subtext">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
            {user.username && <span>@{user.username}</span>}
            <span>Joined {fmtDate(user.createdAt)}</span>
            {user.referralCode && <span>Ref code: <span className="font-mono text-gray-700">{user.referralCode}</span></span>}
          </div>
          {user.referredBy && (
            <p className="mt-1 text-xs text-subtext">
              Referred by{" "}
              <Link href={`/admin/users/${user.referredBy.id}`} className="text-indigo-600 hover:underline">
                {user.referredBy.name ?? user.referredBy.email}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="inline-flex rounded-lg bg-gray-900 p-2 text-white"><Icon className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-subtext">{label}</p>
          </div>
        ))}
      </div>

      {/* Affiliate summary */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Affiliate Earned", value: formatNpr(earned) },
          { label: "Paid Out", value: formatNpr(user.affiliatePaidNpr) },
          { label: "Outstanding", value: formatNpr(due) },
        ].map((x) => (
          <div key={x.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <Wallet className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{x.value}</p>
              <p className="text-xs text-subtext">{x.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards / Domains */}
      <Section title="Cards & Domains" count={user.profiles.length}>
        {user.profiles.length === 0 ? (
          <Empty>No cards yet.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {user.profiles.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{p.label}</p>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{p.cardTemplate}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-subtext">
                  <Globe className="h-3.5 w-3.5" />
                  {p.slug ? (
                    <Link href={`/profile/${p.slug}`} target="_blank" className="text-indigo-600 hover:underline">
                      /profile/{p.slug} <ExternalLink className="inline h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-gray-400">no domain yet</span>
                  )}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {p.views} views · {p._count.orders} order{p._count.orders !== 1 ? "s" : ""} · {p._count.leads} lead{p._count.leads !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Orders */}
      <Section title="Orders" count={user.orders.length}>
        {user.orders.length === 0 ? (
          <Empty>No orders yet.</Empty>
        ) : (
          <Table head={["Order", "Card / Domain", "Template", "Qty", "Total", "Status", "Date"]}>
            {user.orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-subtext">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-foreground">
                  {o.profile ? (o.profile.slug ? `${o.profile.label} (/${o.profile.slug})` : o.profile.label) : "—"}
                </td>
                <td className="px-4 py-3 text-foreground">{o.cardTemplate || "—"}</td>
                <td className="px-4 py-3 text-foreground">{o.quantity}</td>
                <td className="px-4 py-3 font-medium text-foreground">{formatNpr(o.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS[o.status] ?? ""}`}>
                    {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtext">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Leads */}
      <Section title="Leads" count={user.leads.length}>
        {user.leads.length === 0 ? (
          <Empty>No leads yet.</Empty>
        ) : (
          <Table head={["Name", "Email", "From card", "Type", "Status", "Date"]}>
            {user.leads.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-foreground">{l.fullName}</td>
                <td className="px-4 py-3 text-subtext">{l.email}</td>
                <td className="px-4 py-3 text-foreground">{l.profile?.label ?? "—"}</td>
                <td className="px-4 py-3 text-foreground">{l.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${LEAD_STATUS[l.status] ?? ""}`}>
                    {l.status.charAt(0) + l.status.slice(1).toLowerCase().replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtext">{fmtDate(l.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      {/* Referrals */}
      <Section title="Referred Users" count={user.referrals.length}>
        {user.referrals.length === 0 ? (
          <Empty>Hasn&apos;t referred anyone yet.</Empty>
        ) : (
          <Table head={["Name", "Email", "Orders", "Joined"]}>
            {user.referrals.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${r.id}`} className="font-medium text-indigo-600 hover:underline">
                    {r.name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-subtext">{r.email}</td>
                <td className="px-4 py-3 text-foreground">{r.orders.length}</td>
                <td className="px-4 py-3 text-subtext">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
        {title} <span className="text-gray-300">({count})</span>
      </h2>
      <div className="rounded-2xl border border-gray-200 bg-white p-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-subtext">{children}</p>;
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-subtext">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}
