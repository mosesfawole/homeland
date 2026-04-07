import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingCard from "@/components/booking/BookingCard";

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
      property: { select: { id: true, title: true } },
      user: { select: { name: true, email: true, phone: true } },
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

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role="AGENT" />
          ))}
        </div>
      )}
    </div>
  );
}
