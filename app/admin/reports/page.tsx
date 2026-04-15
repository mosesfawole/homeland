import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { unwrapRelation, type RelationValue } from "@/lib/utils/helpers";

export const metadata = {
  title: "Reports - Homeland",
};

type ReportedProperty = {
  title?: string | null;
};

type ReportUser = {
  name?: string | null;
  email?: string | null;
};

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: reports, error } = await supabase
    .from("Report")
    .select(
      `
      id,
      reason,
      details,
      createdAt,
      property:Property(title),
      user:User(name, email)
    `,
    )
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[AdminReportsPage] Failed to load reports", formatSupabaseError(error));
  }

  const reportList = reports ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review flagged listings for action.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {reportList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No reports yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Property</th>
                <th className="text-left px-4 py-3 font-medium">Reported By</th>
                <th className="text-left px-4 py-3 font-medium">Reason</th>
                <th className="text-left px-4 py-3 font-medium">Details</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {reportList.map((report) => {
                const property = unwrapRelation(
                  report.property as RelationValue<ReportedProperty>,
                );
                const user = unwrapRelation(
                  report.user as RelationValue<ReportUser>,
                );
                return (
                <tr key={report.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    {property?.title ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user?.name ?? user?.email ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {report.reason}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {report.details ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {timeAgo(report.createdAt)}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
