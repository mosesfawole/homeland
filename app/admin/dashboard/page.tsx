import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export const metadata = {
  title: "Admin Overview - Homeland",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const supabase = getSupabaseAdmin();

  const [users, listings, bookings, reports] = await Promise.all([
    supabase.from("User").select("id", { count: "exact", head: true }),
    supabase.from("Property").select("id", { count: "exact", head: true }),
    supabase.from("Booking").select("id", { count: "exact", head: true }),
    supabase
      .from("Report")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false),
  ]);

  const usersCount = users.count ?? 0;
  const listingsCount = listings.count ?? 0;
  const bookingsCount = bookings.count ?? 0;
  const reportsCount = reports.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform activity and approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {usersCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Listings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {listingsCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Bookings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {bookingsCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Open Reports</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {reportsCount}
          </p>
        </div>
      </div>
    </div>
  );
}
