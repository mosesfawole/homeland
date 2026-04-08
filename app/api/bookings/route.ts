import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendBookingReceivedEmail } from "@/lib/email";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  tourDate: z.string().min(1),
  tourTime: z.string().min(1),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { propertyId, tourDate, tourTime, message } = parsed.data;
    const supabase = getSupabaseAdmin();
    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .select(
        `
        id,
        status,
        title,
        agentProfile:AgentProfile(
          id,
          user:User(email, name)
        )
      `,
      )
      .eq("id", propertyId)
      .maybeSingle();

    if (propertyError) {
      console.error("[POST /api/bookings] Property lookup failed", formatSupabaseError(propertyError));
    }

    if (!property || property.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Property not available for booking" },
        { status: 404 },
      );
    }

    const tourDateTime = new Date(`${tourDate}T${tourTime}`);
    if (Number.isNaN(tourDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time" },
        { status: 400 },
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("Booking")
      .insert({
        userId: session.user.id,
        propertyId,
        tourDate: tourDateTime.toISOString(),
        tourTime,
        message: message ?? null,
        status: "PENDING",
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      console.error("[POST /api/bookings] Booking create failed", formatSupabaseError(bookingError ?? { message: "Booking not created" }));
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    await sendBookingReceivedEmail({
      agentEmail: property.agentProfile?.user?.email ?? null,
      agentName: property.agentProfile?.user?.name ?? null,
      propertyTitle: property.title,
      tourDate: tourDateTime.toLocaleDateString("en-NG"),
      tourTime,
      userName: session.user.name ?? null,
      bookingId: booking.id,
    });

    return NextResponse.json(
      { message: "Booking request created", data: booking },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/bookings]", message);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
