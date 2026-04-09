import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border border-gray-100 rounded-xl p-4 h-fit shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Agent Dashboard
            </h2>
            <nav className="space-y-2 text-sm">
              <Link
                href="/agent/dashboard"
                className="block px-3 py-2 rounded-lg border border-transparent bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-200 hover:text-slate-900 transition"
              >
                Overview
              </Link>
              <Link
                href="/agent/listings"
                className="block px-3 py-2 rounded-lg border border-transparent bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-200 hover:text-slate-900 transition"
              >
                Listings
              </Link>
              <Link
                href="/agent/bookings"
                className="block px-3 py-2 rounded-lg border border-transparent bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-200 hover:text-slate-900 transition"
              >
                Bookings
              </Link>
              <Link
                href="/agent/verification"
                className="block px-3 py-2 rounded-lg border border-transparent bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-200 hover:text-slate-900 transition"
              >
                Verification
              </Link>
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
