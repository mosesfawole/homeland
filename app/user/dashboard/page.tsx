import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";

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
  const stats = [
    { label: "Saved Properties", value: favoritesCount, note: "Homes you are comparing" },
    { label: "Upcoming Tours", value: upcomingTours, note: "Pending or confirmed inspections" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#e7e0d2] bg-white p-6 shadow-sm shadow-stone-200/50 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b641e]">Buyer workspace</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#121826]">Overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6a5f]">
              Keep your shortlisted homes, tours, and agent conversations organized.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex w-fit rounded-full bg-[#12372a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2c21]"
          >
            Browse properties
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm shadow-stone-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b641e]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#121826]">{stat.value}</p>
            <p className="mt-2 text-sm leading-5 text-[#6f6a5f]">{stat.note}</p>
          </div>
        ))}
      </div>

      {favoritesCount === 0 && upcomingTours === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[#d9cfbc] bg-white p-6">
          <p className="text-sm font-semibold text-[#121826]">Start with a verified shortlist</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6a5f]">
            Save properties while browsing, then book inspections when a listing looks right.
          </p>
        </div>
      ) : null}
      </div>
  );
}
