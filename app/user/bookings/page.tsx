import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";

export const metadata = {
  title: "My Bookings - Homeland",
};

export default async function UserBookingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your tour requests and their status.
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
