import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendBookingReceivedEmail } from "@/lib/email";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { unwrapRelation, type RelationValue } from "@/lib/utils/helpers";
import { isSameOrigin, getRequestIp, checkRateLimit } from "@/lib/security";

export const runtime = "nodejs";

type AgentUser = {
  email: string | null;
  name: string | null;
};

type AgentProfile = {
  id: string;
  user: RelationValue<AgentUser>;
};

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  tourDate: z.string().min(1),
  tourTime: z.string().min(1),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`booking:${ip}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }
    const session = await auth();
    if (!session || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
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

    const tourDateTime = new Date(`${tourDate}T${tourTime}:00+01:00`);
    if (Number.isNaN(tourDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time" },
        { status: 400 },
      );
    }
    if (tourDateTime.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Tour time must be in the future" },
        { status: 400 },
      );
    }
    const tourDateIso = tourDateTime.toISOString();

    const { data: conflicts, error: conflictError } = await supabase
      .from("Booking")
      .select("id")
      .eq("propertyId", propertyId)
      .eq("tourDate", tourDateIso)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (conflictError) {
      console.error("[POST /api/bookings] Conflict check failed", formatSupabaseError(conflictError));
      return NextResponse.json(
        { error: "Unable to validate booking availability" },
        { status: 500 },
      );
    }

    if ((conflicts ?? []).length > 0) {
      return NextResponse.json(
        { error: "That time slot is already booked. Please pick another time." },
        { status: 409 },
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("Booking")
      .insert({
        userId: session.user.id,
        propertyId,
        tourDate: tourDateIso,
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

    const agentProfile = unwrapRelation(
      property.agentProfile as RelationValue<AgentProfile>,
    );
    const agentUser = unwrapRelation(agentProfile?.user);

    await sendBookingReceivedEmail({
      agentEmail: agentUser?.email ?? null,
      agentName: agentUser?.name ?? null,
      propertyTitle: property.title,
      tourDate: tourDateTime.toLocaleDateString("en-NG", {
        timeZone: "Africa/Lagos",
      }),
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
