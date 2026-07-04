"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Handshake,
  BookOpen,
  Settings,
  Users,
  CreditCard,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Affiliate", href: "/admin/affiliate", icon: Handshake },
  { label: "Blog", href: "/admin/articles", icon: BookOpen },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function sectionTitle(pathname: string) {
  return navItems.find((n) => (n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? "Admin";
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
      <Image src="/logo.png" alt="BNC" width={36} height={36} className="rounded-xl ring-1 ring-white/15" />
      <div>
        <span className="block text-sm font-semibold text-white">BNC Admin</span>
        <span className="text-[11px] text-slate-400">Management Console</span>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-gradient-to-r from-indigo-500/20 to-emerald-500/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-emerald-400" />}
            <Icon className={`h-4 w-4 ${active ? "text-indigo-300" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Admin";
  const email = session?.user?.email || "";
  const initial = (name || email || "A").charAt(0).toUpperCase();

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="truncate text-xs text-slate-400">{email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin-login" })}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

function Sidebar({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      <SidebarHeader />
      <NavLinks pathname={pathname} onClose={onClose} />
      <UserBlock />
    </>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f6f7fb]">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-shrink-0 flex-col bg-[#0b1120] md:flex">
        <Sidebar pathname={pathname} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-foreground">{sectionTitle(pathname)}</h2>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View site
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0b1120] shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
        <Sidebar pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>
    </div>
  );
}
