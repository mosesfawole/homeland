import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  sendBookingCancelledEmail,
  sendBookingConfirmedEmail,
} from "@/lib/email";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["CONFIRM", "CANCEL", "COMPLETE"]),
  agentNote: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabase
      .from("Booking")
      .select(
        `
        *,
        property:Property(id, title, agentProfileId),
        user:User(id, name, email)
      `,
      )
      .eq("id", id)
      .single();

    if (bookingError) {
      console.error("[PATCH /api/bookings/:id] Booking lookup failed", formatSupabaseError(bookingError));
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isAgentOwner =
      session.user.role === "AGENT" &&
      session.user.agentProfileId === booking.property.agentProfileId;
    const isUserOwner =
      session.user.role === "USER" && session.user.id === booking.userId;

    if (!isAgentOwner && !isUserOwner && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, agentNote, cancelReason } = parsed.data;
    let updateData = {} as {
      status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
      confirmedAt?: Date | null;
      cancelledAt?: Date | null;
      cancelReason?: string | null;
      agentNote?: string | null;
    };

    if (action === "CONFIRM") {
      if (!isAgentOwner && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          { error: "Only pending bookings can be confirmed" },
          { status: 409 },
        );
      }
      updateData = {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        agentNote: agentNote ?? null,
      };
    }

    if (action === "CANCEL") {
      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Booking is already closed" },
          { status: 409 },
        );
      }
      updateData = {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: cancelReason ?? null,
      };
    }

    if (action === "COMPLETE") {
      if (!isAgentOwner && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (booking.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Only confirmed bookings can be completed" },
          { status: 409 },
        );
      }
      updateData = {
        status: "COMPLETED",
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from("Booking")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("[PATCH /api/bookings/:id] Booking update failed", formatSupabaseError(updateError ?? { message: "Booking not updated" }));
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 },
      );
    }

    const tourDate = new Date(booking.tourDate).toLocaleDateString("en-NG");

    if (action === "CONFIRM") {
      await sendBookingConfirmedEmail({
        userEmail: booking.user.email,
        userName: booking.user.name,
        propertyTitle: booking.property.title,
        tourDate,
        tourTime: booking.tourTime,
        bookingId: booking.id,
      });
    }

    if (action === "CANCEL") {
      await sendBookingCancelledEmail({
        userEmail: booking.user.email,
        userName: booking.user.name,
        propertyTitle: booking.property.title,
        tourDate,
        tourTime: booking.tourTime,
        bookingId: booking.id,
        cancelReason: cancelReason ?? null,
      });
    }

    return NextResponse.json({ message: "Booking updated", data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/bookings/:id]", message);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
