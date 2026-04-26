import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";

export const metadata = {
  title: "Agent Overview - Homeland",
};

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: agentProfile } = await supabase
    .from("AgentProfile")
    .select("id, verificationStatus, totalListings")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (!agentProfile) redirect("/agent/verification");

  const [propertiesResult, bookingsResult] = await Promise.all([
    supabase
      .from("Property")
      .select("id, viewCount", { count: "exact" })
      .eq("agentProfileId", agentProfile.id),
    supabase
      .from("Property")
      .select("id")
      .eq("agentProfileId", agentProfile.id),
  ]);

  const listingCount = propertiesResult.count ?? 0;
  const propertyIds = (bookingsResult.data ?? []).map((row) => row.id);

  const bookingCount = propertyIds.length
    ? (
        await supabase
          .from("Booking")
          .select("id", { count: "exact", head: true })
          .in("propertyId", propertyIds)
      ).count ?? 0
    : 0;

  const totalViews = (propertiesResult.data ?? []).reduce(
    (sum, property) => sum + (property.viewCount ?? 0),
    0,
  );

  const stats = [
    { label: "Total Listings", value: listingCount, note: "Drafts, pending, and live homes" },
    { label: "Tour Requests", value: bookingCount, note: "Inspection requests across listings" },
    { label: "Total Views", value: totalViews, note: "Buyer and renter listing views" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#e7e0d2] bg-[#12372a] p-6 text-white shadow-xl shadow-emerald-950/10 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e6b15f]">Agent workspace</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              Track listing performance, inspection demand, and verification status from one place.
            </p>
          </div>
          <Link
            href="/agent/listings/new"
            className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#12372a] hover:bg-[#f8f6ee]"
          >
            New listing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm shadow-stone-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b641e]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#121826]">{stat.value}</p>
            <p className="mt-2 text-sm leading-5 text-[#6f6a5f]">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-dashed border-[#d9cfbc] bg-white p-6">
        <p className="text-sm font-semibold text-[#121826]">
          Verification status: {agentProfile.verificationStatus}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6f6a5f]">
          Keep your profile and documents updated so users can trust your listings before booking inspections.
        </p>
      </div>
    </div>
  );
}
