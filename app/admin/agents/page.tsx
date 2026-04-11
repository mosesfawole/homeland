import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgentReviewActions from "@/components/admin/AgentReviewActions";
import AgentBulkActions from "@/components/admin/AgentBulkActions";
import { timeAgo } from "@/lib/utils/format";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import Link from "next/link";

export const metadata = {
  title: "Agents - Homeland",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminAgentsPage({
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
  let agentsQuery = supabase
    .from("AgentProfile")
    .select(
      `
      id,
      verificationStatus,
      govIdUrl,
      cacDocUrl,
      createdAt,
      user:User(name, email)
    `,
    )
    .order("createdAt", { ascending: false });

  if (tab === "verified") {
    agentsQuery = agentsQuery.eq("verificationStatus", "VERIFIED");
  } else if (tab === "rejected") {
    agentsQuery = agentsQuery.eq("verificationStatus", "REJECTED");
  } else if (tab === "all") {
    // no filter
  } else {
    agentsQuery = agentsQuery.eq("verificationStatus", "PENDING");
  }

  const [agentsResult, pendingCount, verifiedCount, rejectedCount, allCount] =
    await Promise.all([
      agentsQuery,
      supabase
        .from("AgentProfile")
        .select("id", { count: "exact", head: true })
        .eq("verificationStatus", "PENDING"),
      supabase
        .from("AgentProfile")
        .select("id", { count: "exact", head: true })
        .eq("verificationStatus", "VERIFIED"),
      supabase
        .from("AgentProfile")
        .select("id", { count: "exact", head: true })
        .eq("verificationStatus", "REJECTED"),
      supabase.from("AgentProfile").select("id", { count: "exact", head: true }),
    ]);

  if (agentsResult.error) {
    console.error(
      "[AdminAgentsPage] Failed to load agents",
      formatSupabaseError(agentsResult.error),
    );
  }

  const agentList = agentsResult.data ?? [];
  const tabs = [
    { key: "pending", label: "Pending", count: pendingCount.count ?? 0 },
    { key: "verified", label: "Verified", count: verifiedCount.count ?? 0 },
    { key: "rejected", label: "Rejected", count: rejectedCount.count ?? 0 },
    { key: "all", label: "All", count: allCount.count ?? 0 },
  ];

  const statusLabel = (status: string) => {
    if (status === "PENDING") return "PENDING";
    if (status === "VERIFIED") return "APPROVED";
    return status;
  };
  const isPendingTab = tab === "pending";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review agent verification documents.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const isActive = tab === item.key || (tab === "pending" && item.key === "pending");
            const href =
              item.key === "pending" ? "/admin/agents" : `/admin/agents?tab=${item.key}`;
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
        <AgentBulkActions
          pendingCount={pendingCount.count ?? 0}
          isPendingTab={isPendingTab}
        />
      </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {agentList.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No agents found for this filter.
            </div>
          ) : (
            <table className="w-full text-sm" data-admin-table="agents">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Agent</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Docs</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
                {agentList.map((agent) => (
                  <tr
                    key={agent.id}
                    data-row-id={agent.id}
                    className="border-t border-gray-100"
                  >
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium">
                      {agent.user?.name ?? "Agent"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.user?.email ?? "-"}
                    </div>
                  </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {statusLabel(agent.verificationStatus)}
                      </span>
                    </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="flex flex-col gap-1">
                      {agent.govIdUrl ? (
                        <a
                          href={agent.govIdUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Gov ID
                        </a>
                      ) : (
                        <span className="text-gray-400">No ID</span>
                      )}
                      {agent.cacDocUrl ? (
                        <a
                          href={agent.cacDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          CAC Doc
                        </a>
                      ) : (
                        <span className="text-gray-400">No CAC</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {timeAgo(agent.createdAt)}
                  </td>
                    <td className="px-4 py-3">
                      <AgentReviewActions
                        agentProfileId={agent.id}
                        status={agent.verificationStatus}
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
