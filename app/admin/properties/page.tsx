import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice, timeAgo } from "@/lib/utils/format";
import PropertyReviewActions from "@/components/admin/PropertyReviewActions";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Properties - Homeland",
};

export default async function AdminPropertiesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: properties, error } = await supabase
    .from("Property")
    .select(
      `
      id,
      title,
      listingType,
      status,
      price,
      createdAt,
      isFeatured,
      agentProfile:AgentProfile(
        agencyName,
        user:User(name, email)
      )
    `,
    )
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[AdminPropertiesPage] Failed to load properties", formatSupabaseError(error));
  }

  const propertyList = properties ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve, reject, or feature listings.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {propertyList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No properties found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Listing</th>
                <th className="text-left px-4 py-3 font-medium">Agent</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {propertyList.map((property) => (
                <tr key={property.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium">
                      {property.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.listingType === "RENT" ? "For Rent" : "For Sale"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {property.agentProfile?.agencyName ||
                      property.agentProfile?.user?.name ||
                      property.agentProfile?.user?.email ||
                      "Agent"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatPrice(property.price, true)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {timeAgo(property.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <PropertyReviewActions
                      propertyId={property.id}
                      isFeatured={property.isFeatured}
                    />
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
