"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/agent/dashboard", label: "Overview" },
  { href: "/agent/listings", label: "Listings" },
  { href: "/agent/bookings", label: "Bookings" },
  { href: "/agent/verification", label: "Verification" },
];

export default function AgentSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 text-sm">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-lg border transition ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-slate-50 text-slate-700 border-transparent hover:bg-white hover:border-slate-200 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
