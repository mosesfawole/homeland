import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookingCard, { type BookingCardData } from "@/components/booking/BookingCard";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { unwrapRelation, type RelationValue } from "@/lib/utils/helpers";

export const metadata = {
  title: "My Bookings - Homeland",
};

type BookingProperty = {
  id: string;
  title: string;
};

export default async function UserBookingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: bookings, error } = await supabase
    .from("Booking")
    .select(
      `
      id,
      status,
      tourDate,
      tourTime,
      message,
      createdAt,
      cancelReason,
      agentNote,
      property:Property(id, title)
    `,
    )
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[UserBookingsPage] Failed to load bookings", formatSupabaseError(error));
  }

  const bookingList = (bookings ?? []).map((booking) => {
    const property = unwrapRelation(
      booking.property as RelationValue<BookingProperty>,
    );
    return {
      ...booking,
      property: property ?? { id: "", title: "Property" },
    } as BookingCardData;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your tour requests and their status.
        </p>
      </div>

      {bookingList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookingList.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role="USER" />
          ))}
        </div>
      )}
    </div>
  );
}
