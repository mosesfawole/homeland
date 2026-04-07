import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Overview - Homeland",
};

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const [favoritesCount, upcomingTours] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.booking.count({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        tourDate: { gte: new Date() },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your favorites and upcoming tours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Saved Properties</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {favoritesCount}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Upcoming Tours</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {upcomingTours}
          </p>
        </div>
      </div>
    </div>
  );
}
