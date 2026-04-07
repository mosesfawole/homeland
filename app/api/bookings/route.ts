import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true, agentProfileId: true },
    });

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

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        propertyId,
        tourDate: tourDateTime,
        tourTime,
        message,
        status: "PENDING",
      },
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
