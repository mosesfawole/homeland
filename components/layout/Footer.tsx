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
      { label: "About", href: "/" },
      { label: "Trust & safety", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[2fr_3fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              H
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Homeland</p>
              <p className="text-xs text-gray-500">Trusted Nigerian listings</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 max-w-sm">
            Homeland connects verified agents with serious renters and buyers. We
            focus on transparency, verified listings, and frictionless booking.
          </p>
          <p className="text-xs text-gray-400">© 2026 Homeland. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                {column.title}
              </p>
              <div className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900"
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
