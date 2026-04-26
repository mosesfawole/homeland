"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronRight, Menu, X } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

type MobileNavProps = {
  navLinks: NavLink[];
  dashboardHref: string | null;
  isAuthenticated: boolean;
  showNewListing: boolean;
};

export default function MobileNav({
  navLinks,
  dashboardHref,
  isAuthenticated,
  showNewListing,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative z-[60] md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${
          open
            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
            : "border-[#d9cfbc] bg-white text-[#39463d] shadow-sm hover:bg-[#f8f6ee]"
        }`}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
        <span>{open ? "Close" : "Menu"}</span>
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex min-h-dvh flex-col overflow-y-auto bg-[#f7f5f0]"
        >
          <div className="flex items-center justify-between border-b border-[#e7e0d2] bg-white/75 px-4 py-4 backdrop-blur">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <span className="brand-mark">H</span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-[#121826]">Homeland</p>
                <p className="text-[11px] text-[#6f6a5f]">Verified property marketplace</p>
              </div>
            </Link>

            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cfbc] bg-white text-[#39463d] transition-colors hover:bg-[#f8f6ee]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 px-4 py-7">
            <div className="mb-7 rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b641e]">
                Menu
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#121826]">
                Find, verify, and manage property faster.
              </p>
            </div>

            <nav className="grid gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-[#e7e0d2] bg-white px-4 py-4 text-base font-semibold text-[#29362e] shadow-sm transition-colors hover:border-[#cbbda3] hover:text-[#12372a]"
                >
                  <span>{link.label}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-[#e7e0d2] bg-white/80 px-4 py-5">
            <div className="grid gap-3">
              {showNewListing ? (
                <Link
                  href="/agent/listings/new"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d9cfbc] bg-white px-4 py-3 text-sm font-semibold text-[#12372a] transition-colors hover:bg-[#f8f6ee]"
                >
                  New listing
                </Link>
              ) : null}

              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d9cfbc] bg-white px-4 py-3 text-sm font-semibold text-[#12372a] transition-colors hover:bg-[#f8f6ee]"
                >
                  Dashboard
                </Link>
              ) : null}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await signOut({ callbackUrl: "/" });
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-[#12372a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2c21]"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-[#d9cfbc] bg-white px-4 py-3 text-sm font-semibold text-[#12372a] transition-colors hover:bg-[#f8f6ee]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl bg-[#12372a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2c21]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
