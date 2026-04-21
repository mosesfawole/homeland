"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative z-[60] md:hidden">
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
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-slate-950/18 backdrop-blur-sm"
          />
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-x-4 top-20 z-50 ml-auto max-w-sm overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur"
          >
            <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Navigation
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                Move around Homeland faster
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Browse listings, jump into your dashboard, or continue your account setup.
              </p>
            </div>

            <nav className="grid gap-2 p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
                >
                  <span>{link.label}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              ))}
            </nav>

            <div className="border-t border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quick actions
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Pick up where you left off without digging through the site.
                </p>
              </div>

              <div className="grid gap-2">
                {showNewListing ? (
                  <Link
                    href="/agent/listings/new"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    New listing
                  </Link>
                ) : null}

                {dashboardHref ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
