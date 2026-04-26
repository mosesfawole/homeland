import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Search properties", href: "/search" },
      { label: "Featured listings", href: "/search" },
      { label: "Book a tour", href: "/search" },
    ],
  },
  {
    title: "For agents",
    links: [
      { label: "Create listing", href: "/agent/listings/new" },
      { label: "Agent dashboard", href: "/agent/dashboard" },
      { label: "Verification", href: "/agent/verification" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Trust & safety", href: "/trust-safety" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e7e0d2] bg-[#12372a] text-white">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[2fr_3fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-[#12372a]">
              H
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Homeland</p>
              <p className="text-xs text-white/60">Trusted Nigerian listings</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/70">
            Homeland connects verified agents with serious renters and buyers. We
            focus on transparency, verified listings, and frictionless booking.
          </p>
          <p className="text-xs text-white/45">Copyright 2026 Homeland. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#e6b15f]">
                {column.title}
              </p>
              <div className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
