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
    <nav className="space-y-1.5 text-sm">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block border-l-2 px-3 py-2.5 transition ${
              isActive
                ? "border-[#e8754f] bg-[#e9eee8] font-semibold text-[#164b3a]"
                : "border-transparent text-[#6f7b70] hover:border-[#b8c9bd] hover:bg-[#f7f8f5] hover:text-[#17221d]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
