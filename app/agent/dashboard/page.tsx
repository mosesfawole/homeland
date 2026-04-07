import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Agent Overview - Homeland",
};

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true, totalListings: true },
  });

  if (!agentProfile) redirect("/agent/verification");

  const [listingCount, bookingCount, viewsAgg] = await Promise.all([
    prisma.property.count({ where: { agentProfileId: agentProfile.id } }),
    prisma.booking.count({
      where: { property: { agentProfileId: agentProfile.id } },
    }),
    prisma.property.aggregate({
      where: { agentProfileId: agentProfile.id },
      _sum: { viewCount: true },
    }),
  ]);

  const totalViews = viewsAgg._sum.viewCount ?? 0;

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
