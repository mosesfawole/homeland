import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Overview - Homeland",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [users, listings, bookings, reports] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    prisma.report.count({ where: { resolved: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform activity and approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{users}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Listings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {listings}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Bookings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {bookings}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-500">Open Reports</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {reports}
          </p>
        </div>
      </div>
    </div>
  );
}
