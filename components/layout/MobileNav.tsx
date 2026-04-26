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
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
          className="fixed inset-0 z-50 flex min-h-dvh flex-col overflow-y-auto bg-white"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                H
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">Homeland</p>
                <p className="text-[11px] text-slate-500">Trusted listings</p>
              </div>
            </Link>

            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 px-4 py-6">
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Navigation
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                Where do you want to go?
              </p>
            </div>

            <nav className="grid gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-slate-100 py-4 text-base font-medium text-slate-800 transition-colors hover:text-slate-950"
                >
                  <span>{link.label}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-5">
            <div className="grid gap-3">
              {showNewListing ? (
                <Link
                  href="/agent/listings/new"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  New listing
                </Link>
              ) : null}

              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
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
