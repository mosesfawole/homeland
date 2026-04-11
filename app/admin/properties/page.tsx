import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice, timeAgo } from "@/lib/utils/format";
import PropertyReviewActions from "@/components/admin/PropertyReviewActions";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";

export const metadata = {
  title: "Properties - Homeland",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const tabRaw = resolvedSearchParams?.tab;
  const tab = typeof tabRaw === "string" ? tabRaw : "pending";
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const supabase = getSupabaseAdmin();
  let propertiesQuery = supabase
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

  if (tab === "approved") {
    propertiesQuery = propertiesQuery.eq("status", "ACTIVE");
  } else if (tab === "rejected") {
    propertiesQuery = propertiesQuery.eq("status", "REJECTED");
  } else if (tab === "featured") {
    propertiesQuery = propertiesQuery.eq("isFeatured", true);
  } else if (tab === "all") {
    // no filter
  } else {
    propertiesQuery = propertiesQuery.eq("status", "PENDING_REVIEW");
  }

  const [
    propertiesResult,
    pendingCount,
    approvedCount,
    rejectedCount,
    featuredCount,
    allCount,
  ] = await Promise.all([
    propertiesQuery,
    supabase
      .from("Property")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING_REVIEW"),
    supabase
      .from("Property")
      .select("id", { count: "exact", head: true })
      .eq("status", "ACTIVE"),
    supabase
      .from("Property")
      .select("id", { count: "exact", head: true })
      .eq("status", "REJECTED"),
    supabase
      .from("Property")
      .select("id", { count: "exact", head: true })
      .eq("isFeatured", true),
    supabase.from("Property").select("id", { count: "exact", head: true }),
  ]);

  if (propertiesResult.error) {
    console.error(
      "[AdminPropertiesPage] Failed to load properties",
      formatSupabaseError(propertiesResult.error),
    );
  }

  const propertyList = propertiesResult.data ?? [];
  const tabs = [
    { key: "pending", label: "Pending", count: pendingCount.count ?? 0 },
    { key: "approved", label: "Approved", count: approvedCount.count ?? 0 },
    { key: "rejected", label: "Rejected", count: rejectedCount.count ?? 0 },
    { key: "featured", label: "Featured", count: featuredCount.count ?? 0 },
    { key: "all", label: "All", count: allCount.count ?? 0 },
  ];

  const statusLabel = (status: string) => {
    if (status === "PENDING_REVIEW") return "PENDING";
    if (status === "ACTIVE") return "APPROVED";
    return status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve, reject, or feature listings.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const isActive = tab === item.key || (tab === "pending" && item.key === "pending");
          const href =
            item.key === "pending" ? "/admin/properties" : `/admin/properties?tab=${item.key}`;
          return (
            <Link
              key={item.key}
              href={href}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-slate-300"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {propertyList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No properties found for this filter.
          </div>
        ) : (
          <table className="w-full text-sm" data-admin-table="properties">
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
                <tr
                  key={property.id}
                  data-row-id={property.id}
                  className="border-t border-gray-100"
                >
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
                      {statusLabel(property.status)}
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
                      status={property.status}
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
