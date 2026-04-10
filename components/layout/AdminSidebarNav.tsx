"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminSidebarNav() {
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
