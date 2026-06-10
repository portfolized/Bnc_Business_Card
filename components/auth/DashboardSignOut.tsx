"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function DashboardSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
