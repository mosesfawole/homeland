import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your listings, bookings, and engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Total Listings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {listingCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Tour Requests</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {bookingCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Total Views</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {totalViews}
          </p>
        </div>
      </div>
    </div>
  );
}
