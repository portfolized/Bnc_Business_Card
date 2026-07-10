"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useSession } from "next-auth/react";
import { homePathForRole } from "@/lib/auth-routes";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonial", href: "#testimonial" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const dashboardHref = homePathForRole(session?.user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6">
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full transition-all duration-500 ${
          scrolled
            ? "border border-gray-200/80 bg-white/95 px-5 py-2.5 shadow-xl backdrop-blur-md md:px-6"
            : "border border-white/60 bg-white/80 px-5 py-3 shadow-lg backdrop-blur-sm md:px-6"
        }`}
      >
        <Logo size="sm" />

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-subtext transition-colors hover:text-foreground hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link
              href={dashboardHref}
              className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:flex"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-gray-200 bg-white p-4 shadow-lg md:hidden">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-sm text-subtext hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {session?.user ? (
              <li>
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 py-1 text-sm font-medium text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-1.5 py-1 text-sm font-medium text-primary"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-1.5 py-1 text-sm font-medium text-primary"
                  >
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
