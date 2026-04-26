import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import MobileNav from "@/components/layout/MobileNav";

const buildNavLinks = (role?: string) => {
  const links = [{ label: "Search", href: "/search" }];

  if (role === "AGENT") {
    links.push(
      { label: "Agent dashboard", href: "/agent/dashboard" },
      { label: "My listings", href: "/agent/listings" },
    );
  }

  if (role === "USER") {
    links.push(
      { label: "Favorites", href: "/user/favorites" },
      { label: "Bookings", href: "/user/bookings" },
    );
  }

  if (role === "ADMIN") {
    links.push(
      { label: "Admin console", href: "/admin/dashboard" },
      { label: "Reports", href: "/admin/reports" },
    );
  }

  if (!role) {
    links.push({ label: "For agents", href: "/register" });
  }

  return links;
};

export default async function Navbar() {
  const session = await auth().catch((error) => {
    console.error("[Navbar] Failed to load session", error);
    return null;
  });

  const role = session?.user?.role;
  const navLinks = buildNavLinks(role);

  const dashboardHref =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "AGENT"
        ? "/agent/dashboard"
        : role === "USER"
          ? "/user/dashboard"
          : null;

  return (
    <header className="sticky top-0 z-30 border-b border-[#e7e0d2]/80 bg-[#f7f5f0]/90 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="brand-mark">H</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[#121826]">Homeland</p>
            <p className="text-[11px] font-medium text-[#6f6a5f]">Verified property marketplace</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#e7e0d2] bg-white/70 p-1 text-sm text-[#5f655f] shadow-sm shadow-stone-200/40">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 transition-colors hover:bg-[#f1efe7] hover:text-[#12372a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <MobileNav
            navLinks={navLinks}
            dashboardHref={dashboardHref}
            isAuthenticated={Boolean(session)}
            showNewListing={role === "AGENT"}
          />

          {role === "AGENT" ? (
            <Link
              href="/agent/listings/new"
              className="hidden rounded-full border border-[#d9cfbc] bg-white/70 px-4 py-2 text-sm font-medium text-[#12372a] shadow-sm transition-colors hover:bg-white md:inline-flex"
            >
              New listing
            </Link>
          ) : null}

          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden rounded-full border border-[#d9cfbc] bg-white/70 px-4 py-2 text-sm font-medium text-[#12372a] shadow-sm transition-colors hover:bg-white md:inline-flex"
            >
              Dashboard
            </Link>
          ) : null}

          {session ? (
            <form
              className="hidden md:block"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-[#12372a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d2c21]"
              >
                Sign out
              </button>
            </form>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="rounded-full border border-[#d9cfbc] bg-white/70 px-4 py-2 text-[#4f5b51] transition-colors hover:bg-white hover:text-[#12372a]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#12372a] px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-[#0d2c21]"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
