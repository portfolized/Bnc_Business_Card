import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, ChevronRight, Users, UserCog, ShoppingBag } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, profiles: true, leads: true, referrals: true } },
    },
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  const adminCount = users.filter((u) => u.role === "admin").length;
  const withOrders = users.filter((u) => u._count.orders > 0).length;

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <PageHeader
        icon={Users}
        eyebrow="People"
        title="Users"
        subtitle="Everyone registered on BNC. Click a user to see everything about them."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={users.length} icon={Users} grad="from-violet-500 to-purple-500" />
        <StatCard label="Admins" value={adminCount} icon={UserCog} grad="from-indigo-500 to-blue-500" />
        <StatCard label="Customers (with orders)" value={withOrders} icon={ShoppingBag} grad="from-emerald-500 to-teal-500" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
              {users.map((u) => (
                <tr key={u.id} className="group transition hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-bold text-white">
                        {(u.name || u.email || "U").charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{u.name ?? u.username ?? "—"}</span>
                        <span className="block truncate text-xs text-subtext">{u.email}</span>
                      </span>
                    </Link>
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
                    {u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="inline-flex text-gray-300 transition group-hover:text-indigo-500">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
