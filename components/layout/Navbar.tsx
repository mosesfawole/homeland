import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

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
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
            H
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">Homeland</p>
            <p className="text-[11px] text-gray-500">Trusted listings</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-100 bg-white shadow-lg p-2 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          {role === "AGENT" ? (
            <Link
              href="/agent/listings/new"
              className="hidden sm:inline-flex px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              New listing
            </Link>
          ) : null}

          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden sm:inline-flex px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          ) : null}

          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
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
