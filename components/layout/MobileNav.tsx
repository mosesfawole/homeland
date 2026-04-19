"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

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

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
        <span>Menu</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
          />
          <div
            id="mobile-nav-panel"
            className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="grid gap-2">
                {showNewListing ? (
                  <Link
                    href="/agent/listings/new"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    New listing
                  </Link>
                ) : null}

                {dashboardHref ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
