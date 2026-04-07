import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingCard from "@/components/booking/BookingCard";

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
      property: { select: { id: true, title: true } },
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

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role="USER" />
          ))}
        </div>
      )}
    </div>
  );
}
