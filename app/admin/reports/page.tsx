import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";

export const metadata = {
  title: "Reports - Homeland",
};

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review flagged listings for action.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {reports.length === 0 ? (
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
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    {report.property.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {report.user.name ?? report.user.email}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
