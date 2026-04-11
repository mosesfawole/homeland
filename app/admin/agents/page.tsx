import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgentReviewActions from "@/components/admin/AgentReviewActions";
import { timeAgo } from "@/lib/utils/format";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Agents - Homeland",
};

export default async function AdminAgentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: agents, error } = await supabase
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

  if (error) {
    console.error(
      "[AdminAgentsPage] Failed to load agents",
      formatSupabaseError(error),
    );
  }

  const agentList = agents ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review agent verification documents.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {agentList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No agents found.
          </div>
        ) : (
          <table className="w-full text-sm">
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
                <tr key={agent.id} className="border-t border-gray-100">
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
                      {agent.verificationStatus}
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
                    <AgentReviewActions agentProfileId={agent.id} />
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
