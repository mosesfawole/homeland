import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";

export const metadata = {
  title: "Tour Requests - Homeland",
};

export default async function AgentBookingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!agentProfile) redirect("/agent/verification");

  const bookings = await prisma.booking.findMany({
    where: { property: { agentProfileId: agentProfile.id } },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tour Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review incoming tour requests from clients.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No bookings yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Property</th>
                <th className="text-left px-4 py-3 font-medium">Client</th>
                <th className="text-left px-4 py-3 font-medium">Tour Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">
                    {booking.property.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {booking.user.name ?? booking.user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(booking.tourDate).toLocaleDateString("en-NG")} at{" "}
                    {booking.tourTime}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {timeAgo(booking.createdAt)}
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
