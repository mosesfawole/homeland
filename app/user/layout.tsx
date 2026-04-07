import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "USER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border border-gray-100 rounded-xl p-4 h-fit">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              User Dashboard
            </h2>
            <nav className="space-y-2 text-sm">
              <Link
                href="/user/dashboard"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Overview
              </Link>
              <Link
                href="/user/bookings"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Bookings
              </Link>
              <Link
                href="/user/favorites"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Favorites
              </Link>
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
