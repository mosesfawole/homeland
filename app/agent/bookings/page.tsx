import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookingCard, { type BookingCardData } from "@/components/booking/BookingCard";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { unwrapRelation, type RelationValue } from "@/lib/utils/helpers";

export const metadata = {
  title: "Tour Requests - Homeland",
};

type BookingProperty = {
  id: string;
  title: string;
};

type BookingUser = {
  name: string | null;
  email: string | null;
  phone?: string | null;
};

export default async function AgentBookingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: agentProfile, error: agentError } = await supabase
    .from("AgentProfile")
    .select("id")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (agentError) {
    console.error("[AgentBookingsPage] Failed to load agent profile", formatSupabaseError(agentError));
  }

  if (!agentProfile) redirect("/agent/verification");

  const { data: properties } = await supabase
    .from("Property")
    .select("id")
    .eq("agentProfileId", agentProfile.id);

  const propertyIds = (properties ?? []).map((row) => row.id);

  const { data: bookings, error: bookingsError } = propertyIds.length
    ? await supabase
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
        property:Property(id, title),
        user:User(name, email, phone)
      `,
        )
        .in("propertyId", propertyIds)
        .order("createdAt", { ascending: false })
    : { data: [], error: null };

  if (bookingsError) {
    console.error("[AgentBookingsPage] Failed to load bookings", formatSupabaseError(bookingsError));
  }

  const bookingList = (bookings ?? []).map((booking) => {
    const property = unwrapRelation(
      booking.property as RelationValue<BookingProperty>,
    );
    const user = unwrapRelation(booking.user as RelationValue<BookingUser>);
    return {
      ...booking,
      property: property ?? { id: "", title: "Property" },
      user,
    } as BookingCardData;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tour Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review incoming tour requests from clients.
        </p>
      </div>

      {bookingList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookingList.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role="AGENT" />
          ))}
        </div>
      )}
    </div>
  );
}
