import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingActions from "@/components/agent/ListingActions";
import { formatPrice, timeAgo } from "@/lib/utils/format";
import Link from "next/link";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Manage Listings - Homeland",
};

export default async function AgentListingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: agentProfile, error: agentError } = await supabase
    .from("AgentProfile")
    .select("id")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (agentError) {
    console.error(
      "[AgentListingsPage] Failed to load agent profile",
      formatSupabaseError(agentError),
    );
  }

  if (!agentProfile) redirect("/agent/verification");

  const { data: listings, error: listingsError } = await supabase
    .from("Property")
    .select("id, title, status, listingType, price, viewCount, createdAt")
    .eq("agentProfileId", agentProfile.id)
    .order("createdAt", { ascending: false });

  if (listingsError) {
    console.error(
      "[AgentListingsPage] Failed to load listings",
      formatSupabaseError(listingsError),
    );
  }

  const listingList = listings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your property listings.
          </p>
        </div>
        <Link
          href="/agent/listings/new"
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          New Listing
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {listingList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No listings yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Listing</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Views</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listingList.map((listing) => (
                <tr key={listing.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {listing.title}
                    </div>
                    <div className="text-xs text-blue-500">
                      {listing.listingType === "RENT" ? "For Rent" : "For Sale"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatPrice(listing.price, true)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {listing.viewCount}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {timeAgo(listing.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ListingActions propertyId={listing.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
