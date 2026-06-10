"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Palette,
  Globe,
  Trophy,
  FileText,
  BookOpen,
  ShoppingBag,
  Handshake,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Home", href: "/dashboard/home", icon: Home },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Themes", href: "/dashboard/themes", icon: Palette },
  { label: "Custom Domain", href: "/dashboard/domain", icon: Globe },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
  { label: "Articles", href: "/dashboard/articles", icon: BookOpen },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Affiliate", href: "/dashboard/affiliate", icon: Handshake },
];

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
      <Image src="/logo.png" alt="BNC" width={32} height={32} className="rounded-full" />
      <span className="font-semibold text-foreground">BNC Dashboard</span>
    </div>
  );
}

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-subtext hover:bg-gray-100 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  return (
    <div className="border-t border-gray-200 px-3 py-4">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-subtext transition-colors hover:bg-gray-100 hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-section-gray">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <SidebarHeader />
        <NavLinks pathname={pathname} />
        <SignOutButton />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="BNC" width={28} height={28} className="rounded-full" />
            <span className="text-sm font-semibold text-foreground">BNC Dashboard</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-1.5 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarHeader />
        <NavLinks pathname={pathname} onClose={() => setMobileOpen(false)} />
        <SignOutButton />
      </aside>
    </div>
  );
}
