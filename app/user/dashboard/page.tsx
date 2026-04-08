import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "User Overview - Homeland",
};

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const [favorites, upcoming] = await Promise.all([
    supabase
      .from("Favorite")
      .select("id", { count: "exact", head: true })
      .eq("userId", session.user.id),
    supabase
      .from("Booking")
      .select("id", { count: "exact", head: true })
      .eq("userId", session.user.id)
      .in("status", ["PENDING", "CONFIRMED"])
      .gte("tourDate", nowIso),
  ]);

  const favoritesCount = favorites.count ?? 0;
  const upcomingTours = upcoming.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your favorites and upcoming tours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Saved Properties</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {favoritesCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Upcoming Tours</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {upcomingTours}
          </p>
        </div>
      </div>
    </div>
  );
}
