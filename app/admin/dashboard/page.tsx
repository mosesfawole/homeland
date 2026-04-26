import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";
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
  const stats = [
    { label: "Total Users", value: usersCount, note: "Registered renters, buyers, and agents" },
    { label: "Listings", value: listingsCount, note: "All submitted property records" },
    { label: "Bookings", value: bookingsCount, note: "Inspection requests created" },
    { label: "Open Reports", value: reportsCount, note: "Fraud or quality reports needing review" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#e7e0d2] bg-white p-6 shadow-sm shadow-stone-200/50 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b641e]">Admin console</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#121826]">Overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6a5f]">
              Monitor approvals, listing quality, reports, and marketplace activity.
            </p>
          </div>
          <Link
            href="/admin/properties"
            className="inline-flex w-fit rounded-full bg-[#12372a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2c21]"
          >
            Review listings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm shadow-stone-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b641e]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#121826]">{stat.value}</p>
            <p className="mt-2 text-sm leading-5 text-[#6f6a5f]">{stat.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
